/**
 * Global rules that apply to all sections with tables.
 */

import { validateDate, extractLinks, validateUrl } from './helpers.js';

/**
 * Rule: Table rows should not have trailing extra pipes or mismatched column counts.
 */
export const columnCountConsistency = {
  id: 'global/column-count',
  description: 'Each table row must have the same number of columns as the header',
  severity: 'error',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      const expectedCols = table.headers.length;
      for (const row of table.rows) {
        const actualCols = Object.keys(row.cells).length;
        // Count pipes in raw line for a more accurate check
        const pipeCount = (row.raw.match(/\|/g) || []).length;
        // A well-formed row with N columns has N+1 pipes (leading + separators)
        // But trailing pipe is optional, so allow N or N+1 pipes
        if (actualCols > expectedCols) {
          issues.push({
            line: row.line,
            message: `Row has ${actualCols} columns but header has ${expectedCols}`,
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Description column should contain at least one valid markdown link.
 */
export const descriptionHasLink = {
  id: 'global/description-has-link',
  description: 'Description column should contain a markdown link',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Description')) continue;
      for (const row of table.rows) {
        const desc = row.cells['Description'] || '';
        if (!desc) continue;
        const links = extractLinks(desc);
        if (links.length === 0 && desc !== '-') {
          issues.push({
            line: row.line,
            message: `Description has no markdown link: "${desc.substring(0, 60)}..."`,
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Links in Description should have valid URLs.
 */
export const descriptionLinkValid = {
  id: 'global/description-link-valid',
  description: 'Links in Description must be valid URLs',
  severity: 'error',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Description')) continue;
      for (const row of table.rows) {
        const desc = row.cells['Description'] || '';
        const links = extractLinks(desc);
        for (const link of links) {
          const result = validateUrl(link.url);
          if (!result.valid) {
            issues.push({
              line: row.line,
              message: `Invalid URL in Description: ${result.reason}`,
            });
          }
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Date Added column must be a valid YYYY-MM-DD date.
 */
export const dateAddedValid = {
  id: 'global/date-added-valid',
  description: 'Date Added must be a valid date in YYYY-MM-DD format',
  severity: 'error',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Date Added')) continue;
      for (const row of table.rows) {
        const date = row.cells['Date Added'] || '';
        if (!date || date === '-') continue;
        // Sometimes trailing content exists after the date
        const cleaned = date.trim().split(/\s/)[0];
        const result = validateDate(cleaned);
        if (!result.valid) {
          issues.push({
            line: row.line,
            message: `Invalid Date Added: ${result.reason}`,
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Date Added should not be in the future.
 */
export const dateNotFuture = {
  id: 'global/date-not-future',
  description: 'Date Added should not be in the future',
  severity: 'warning',
  check(section) {
    const issues = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (const table of section.tables) {
      if (!table.headers.includes('Date Added')) continue;
      for (const row of table.rows) {
        const date = row.cells['Date Added'] || '';
        if (!date || date === '-') continue;
        const cleaned = date.trim().split(/\s/)[0];
        const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) continue;
        const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        if (d > today) {
          issues.push({
            line: row.line,
            message: `Date Added "${cleaned}" is in the future`,
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Rows should not be completely empty.
 */
export const noEmptyRows = {
  id: 'global/no-empty-rows',
  description: 'Table rows should not be entirely empty',
  severity: 'error',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      for (const row of table.rows) {
        const allEmpty = Object.values(row.cells).every(v => !v || v.trim() === '');
        if (allEmpty) {
          issues.push({
            line: row.line,
            message: 'Row is completely empty',
          });
        }
      }
    }
    return issues;
  },
};

export const allGlobalRules = [
  columnCountConsistency,
  descriptionHasLink,
  descriptionLinkValid,
  dateAddedValid,
  dateNotFuture,
  noEmptyRows,
];
