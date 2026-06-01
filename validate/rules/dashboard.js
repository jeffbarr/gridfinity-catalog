/**
 * Rules specific to the "Dashboard" section.
 * Table: Description | Format | Date Added
 */

export const formatRequired = {
  id: 'dashboard/format-required',
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
  id: 'dashboard/date-required',
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

export const dashboardRules = [
  formatRequired,
  dateRequired,
];
