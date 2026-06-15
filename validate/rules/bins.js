/**
 * Rules specific to the "Bins/Blocks" section.
 * Same structure as Baseplates - Description | Sizes | Variants | Format | Date Added
 */

import { validateVariants } from './helpers.js';

export const sizesRequired = {
  id: 'bins/sizes-required',
  description: 'Bins must specify a size',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Sizes')) continue;
      for (const row of table.rows) {
        const sizes = (row.cells['Sizes'] || '').trim();
        if (!sizes) {
          issues.push({ line: row.line, message: 'Sizes column is empty' });
        }
      }
    }
    return issues;
  },
};

export const sizesFormat = {
  id: 'bins/sizes-format',
  description: 'Sizes should use NxM format',
  severity: 'warning',
  check(section) {
    const issues = [];
    const sizePattern = /\d+(\.\d+)?x\d+(\.\d+)?/i;
    for (const table of section.tables) {
      if (!table.headers.includes('Sizes')) continue;
      for (const row of table.rows) {
        const sizes = (row.cells['Sizes'] || '').trim();
        if (!sizes || sizes === '-' || sizes === '?' || sizes.toLowerCase() === 'any') continue;
        if (sizes.toLowerCase().includes('customizable') || sizes.toLowerCase().includes('varies')) continue;
        if (!sizePattern.test(sizes)) {
          issues.push({
            line: row.line,
            message: `Sizes "${sizes}" doesn't match expected NxM format`,
          });
        }
      }
    }
    return issues;
  },
};

export const variantsValid = {
  id: 'bins/variants-valid',
  description: 'Variants must be a number, range, or dash',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Variants')) continue;
      for (const row of table.rows) {
        const val = (row.cells['Variants'] || '').trim();
        if (!val || val === '?') continue;
        const result = validateVariants(val);
        if (!result.valid) {
          issues.push({ line: row.line, message: result.reason });
        }
      }
    }
    return issues;
  },
};

export const formatRequired = {
  id: 'bins/format-required',
  description: 'Format column should not be empty',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Format')) continue;
      for (const row of table.rows) {
        const fmt = (row.cells['Format'] || '').trim();
        if (!fmt) {
          issues.push({ line: row.line, message: 'Format column is empty' });
        }
      }
    }
    return issues;
  },
};

export const dateRequired = {
  id: 'bins/date-required',
  description: 'Date Added is required',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Date Added')) continue;
      for (const row of table.rows) {
        const date = (row.cells['Date Added'] || '').trim();
        if (!date) {
          issues.push({ line: row.line, message: 'Date Added is missing' });
        }
      }
    }
    return issues;
  },
};

export const alphabeticalOrder = {
  id: 'bins/alphabetical-order',
  description: 'Entries should be sorted alphabetically',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Description')) continue;
      let prevName = '';
      let prevDisplay = '';
      for (const row of table.rows) {
        const desc = row.cells['Description'] || '';
        const match = desc.match(/\[([^\]]+)\]/);
        const name = match ? match[1].toLowerCase() : desc.toLowerCase();
        const display = match ? match[1] : desc;
        if (prevName && name < prevName) {
          issues.push({
            line: row.line,
            message: `"${display}" should come before "${prevDisplay}" (not alphabetical)`,
          });
        }
        prevName = name;
        prevDisplay = display;
      }
    }
    return issues;
  },
};

/**
 * Rule: Description link text should not be empty.
 */
export const descriptionLinkTextNotEmpty = {
  id: 'bins/link-text-not-empty',
  description: 'Link text in Description should not be empty',
  severity: 'error',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Description')) continue;
      for (const row of table.rows) {
        const desc = row.cells['Description'] || '';
        const emptyLink = /\[\s*\]\(/;
        if (emptyLink.test(desc)) {
          issues.push({ line: row.line, message: 'Description has link with empty text' });
        }
      }
    }
    return issues;
  },
};

export const binRules = [
  sizesRequired,
  sizesFormat,
  variantsValid,
  formatRequired,
  dateRequired,
  alphabeticalOrder,
  descriptionLinkTextNotEmpty,
];
