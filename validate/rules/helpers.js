/**
 * Shared helper functions for building validation rules.
 */

/**
 * Validate that a date string matches YYYY-MM-DD format and is a real date.
 * @param {string} value
 * @returns {{valid: boolean, reason?: string}}
 */
export function validateDate(value) {
  if (!value) return { valid: false, reason: 'Date is empty' };

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { valid: false, reason: `"${value}" is not in YYYY-MM-DD format` };

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return { valid: false, reason: `Invalid month ${month}` };
  if (day < 1 || day > 31) return { valid: false, reason: `Invalid day ${day}` };

  // Check actual date validity
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, reason: `"${value}" is not a valid calendar date` };
  }

  return { valid: true };
}

/**
 * Validate that a URL is well-formed.
 * @param {string} value
 * @returns {{valid: boolean, reason?: string}}
 */
export function validateUrl(value) {
  if (!value) return { valid: false, reason: 'URL is empty' };
  try {
    new URL(value);
    return { valid: true };
  } catch {
    return { valid: false, reason: `"${value}" is not a valid URL` };
  }
}

/**
 * Extract markdown links from a cell value.
 * Returns array of {text, url} objects.
 */
export function extractLinks(cellValue) {
  const links = [];
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(cellValue)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  return links;
}

/**
 * Check if a string contains only allowed format values.
 * @param {string} value - Comma-separated format string
 * @param {string[]} allowed - Allowed format values
 */
export function validateFormats(value, allowed) {
  if (!value || value === '-') return { valid: true };
  const formats = value.split(',').map(f => f.trim());
  const invalid = formats.filter(f => !allowed.includes(f) && f !== '');
  if (invalid.length > 0) {
    return { valid: false, reason: `Unknown format(s): ${invalid.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Check that a numeric-like field is a positive integer or a range.
 */
export function validateVariants(value) {
  if (!value || value === '-' || value.toLowerCase() === 'many') return { valid: true };
  // Allow single numbers, ranges like "1-5", or descriptive text
  if (/^\d+$/.test(value)) return { valid: true };
  if (/^\d+\s*[-–]\s*\d+$/.test(value)) return { valid: true };
  // Allow things like "1 + 4 inserts", "3 + 3 trays", "2 parts"
  if (/\d/.test(value)) return { valid: true };
  return { valid: false, reason: `"${value}" doesn't look like a valid variant count` };
}

/**
 * Known valid 3D file format abbreviations.
 */
export const KNOWN_FORMATS = [
  'STL', 'stl',
  '3MF', '3mf', '3Mf', '3ML', '3LF',
  'F3D', 'f3d',
  'F3Z',
  'F360',
  'STEP', 'STP', 'step', 'stp',
  'OBJ', 'obj',
  'FBX', 'fbx',
  'AMF', 'amf',
  'OpenSCAD', 'SCAD', 'Openscad',
  'CadQuery',
  'Fusion 360',
  'Tinkercad',
  'Onshape',
  'SolidWorks',
  'Blend',
  'FCSTD',
  'STL+STEP', 'STL + STEP',
  'F3D + STL', '3MF + STL',
  'EXE', 'PDF', 'Python',
  '?',
];
