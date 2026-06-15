/**
 * Rules specific to the "Baseplates" section.
 */

import { validateVariants } from './helpers.js';

/**
 * Rule: Sizes column should not be empty.
 */
export const sizesRequired = {
  id: 'baseplates/sizes-required',
  description: 'Baseplates must specify a size',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Sizes')) continue;
      for (const row of table.rows) {
        const sizes = row.cells['Sizes'] || '';
        if (!sizes.trim()) {
          issues.push({
            line: row.line,
            message: 'Sizes column is empty',
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Sizes should follow the NxM pattern (e.g., 2x3, 1x1-7x7).
 */
export const sizesFormat = {
  id: 'baseplates/sizes-format',
  description: 'Sizes should use NxM format (e.g., "2x3", "1x1-7x7")',
  severity: 'warning',
  check(section) {
    const issues = [];
    // Pattern: digits with optional decimal x digits, optionally with ranges, lists, etc.
    const sizePattern = /\d+(\.\d+)?x\d+(\.\d+)?/i;
    for (const table of section.tables) {
      if (!table.headers.includes('Sizes')) continue;
      for (const row of table.rows) {
        const sizes = (row.cells['Sizes'] || '').trim();
        if (!sizes || sizes === '-' || sizes.toLowerCase() === 'any') continue;
        if (sizes.toLowerCase().includes('customizable')) continue;
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

/**
 * Rule: Variants should be a number or dash.
 */
export const variantsValid = {
  id: 'baseplates/variants-valid',
  description: 'Variants must be a number, range, or dash',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Variants')) continue;
      for (const row of table.rows) {
        const val = (row.cells['Variants'] || '').trim();
        if (!val) continue;
        const result = validateVariants(val);
        if (!result.valid) {
          issues.push({
            line: row.line,
            message: result.reason,
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Format column should not be empty.
 */
export const formatRequired = {
  id: 'baseplates/format-required',
  description: 'Format column should not be empty',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Format')) continue;
      for (const row of table.rows) {
        const fmt = (row.cells['Format'] || '').trim();
        if (!fmt) {
          issues.push({
            line: row.line,
            message: 'Format column is empty',
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Date Added is required for all baseplates.
 */
export const dateRequired = {
  id: 'baseplates/date-required',
  description: 'Date Added is required',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Date Added')) continue;
      for (const row of table.rows) {
        const date = (row.cells['Date Added'] || '').trim();
        if (!date) {
          issues.push({
            line: row.line,
            message: 'Date Added is missing',
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Rule: Entries should be sorted alphabetically by description text.
 */
export const alphabeticalOrder = {
  id: 'baseplates/alphabetical-order',
  description: 'Entries should be sorted alphabetically by description',
  severity: 'warning',
  check(section) {
    const issues = [];
    for (const table of section.tables) {
      if (!table.headers.includes('Description')) continue;
      let prevName = '';
      let prevDisplay = '';
      for (const row of table.rows) {
        const desc = row.cells['Description'] || '';
        // Extract the link text for comparison
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

export const baseplateRules = [
  sizesRequired,
  sizesFormat,
  variantsValid,
  formatRequired,
  dateRequired,
  alphabeticalOrder,
];
