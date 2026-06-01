/**
 * Markdown parser that extracts sections and their tables from the README.
 * Each section is identified by a top-level heading (# Heading).
 * Tables are parsed into arrays of row objects keyed by column header.
 */

/**
 * Parse a markdown string into sections.
 * @param {string} markdown - The raw markdown content
 * @returns {Array<{name: string, startLine: number, content: string, tables: Array}>}
 */
export function parseSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^# (.+)$/);

    if (headingMatch) {
      if (currentSection) {
        currentSection.content = lines.slice(currentSection.startLine - 1, i).join('\n');
        sections.push(currentSection);
      }
      currentSection = {
        name: headingMatch[1].trim(),
        startLine: i + 1,
        content: '',
        tables: [],
      };
    }
  }

  // Push the last section
  if (currentSection) {
    currentSection.content = lines.slice(currentSection.startLine - 1).join('\n');
    sections.push(currentSection);
  }

  // Parse tables within each section
  for (const section of sections) {
    section.tables = parseTables(section.content, section.startLine);
  }

  return sections;
}

/**
 * Parse markdown tables from a content block.
 * @param {string} content - Section content
 * @param {number} sectionStartLine - Line offset for error reporting
 * @returns {Array<{headers: string[], rows: Array<{line: number, raw: string, cells: object}>}>}
 */
function parseTables(content, sectionStartLine) {
  const lines = content.split('\n');
  const tables = [];
  let i = 0;

  while (i < lines.length) {
    // Detect a table header row: starts with |
    if (lines[i].trim().startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const headerLine = lines[i];
      const headers = parseTableRow(headerLine);
      const table = { headers, rows: [], startLine: sectionStartLine + i };

      // Skip header and separator
      i += 2;

      // Parse data rows
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const raw = lines[i];
        const cells = parseTableRow(raw);
        const cellObj = {};
        headers.forEach((h, idx) => {
          cellObj[h] = (cells[idx] || '').trim();
        });
        table.rows.push({
          line: sectionStartLine + i,
          raw,
          cells: cellObj,
        });
        i++;
      }

      tables.push(table);
    } else {
      i++;
    }
  }

  return tables;
}

/**
 * Check if a line is a markdown table separator (e.g., | :--- | ---: |)
 */
function isSeparatorRow(line) {
  if (!line) return false;
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return false;
  // Must contain dashes
  return /^[\s|:\-]+$/.test(trimmed);
}

/**
 * Parse a single table row into an array of cell values.
 */
function parseTableRow(line) {
  // Remove leading/trailing pipes and split
  const trimmed = line.trim();
  const withoutOuter = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return withoutOuter.split('|').map(cell => cell.trim());
}
