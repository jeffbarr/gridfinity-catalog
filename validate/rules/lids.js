/**
 * Rules specific to the "Lids for Bins" section.
 * Table: Description | Sizes | Variants | Format | Date Added
 */

import { validateVariants } from './helpers.js';

export const sizesRequired = {
  id: 'lids/sizes-required',
  description: 'Lids must specify a size',
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

export const formatRequired = {
  id: 'lids/format-required',
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
  id: 'lids/date-required',
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

export const lidRules = [
  sizesRequired,
  formatRequired,
  dateRequired,
];
