/**
 * Rules for list-based sections (no tables):
 * - Online Generators
 * - Offline Generators
 * - Articles
 * - Videos
 * - Other Collections
 * - Other Resources
 *
 * These sections use bullet-point lists with markdown links.
 */

import { validateUrl } from './helpers.js';

/**
 * Rule: List items should contain at least one valid link.
 */
function createListLinkRule(sectionId) {
  return {
    id: `${sectionId}/list-has-link`,
    description: 'Each list item should contain a markdown link',
    severity: 'warning',
    check(section) {
      const issues = [];
      const lines = section.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Only check bullet-point list items
        if (!line.match(/^\s*[\*\-]\s/)) continue;
        const linkMatch = line.match(/\[([^\]]*)\]\(([^)]+)\)/);
        if (!linkMatch) {
          issues.push({
            line: section.startLine + i,
            message: `List item has no link: "${line.trim().substring(0, 60)}..."`,
          });
        }
      }
      return issues;
    },
  };
}

/**
 * Rule: Links in list items should be valid URLs.
 */
function createListLinkValidRule(sectionId) {
  return {
    id: `${sectionId}/list-link-valid`,
    description: 'Links in list items must be valid URLs',
    severity: 'error',
    check(section) {
      const issues = [];
      const lines = section.content.split('\n');
      const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.match(/^\s*[\*\-]\s/)) continue;
        let match;
        linkRegex.lastIndex = 0;
        while ((match = linkRegex.exec(line)) !== null) {
          const url = match[2];
          const result = validateUrl(url);
          if (!result.valid) {
            issues.push({
              line: section.startLine + i,
              message: `Invalid URL: ${result.reason}`,
            });
          }
        }
      }
      return issues;
    },
  };
}

/**
 * Rule: List items should not be empty.
 */
function createNonEmptyListRule(sectionId) {
  return {
    id: `${sectionId}/list-not-empty`,
    description: 'Section should contain at least one list item',
    severity: 'warning',
    check(section) {
      const issues = [];
      const lines = section.content.split('\n');
      const hasListItems = lines.some(l => l.match(/^\s*[\*\-]\s/));
      if (!hasListItems && section.tables.length === 0) {
        issues.push({
          line: section.startLine,
          message: 'Section has no list items or tables',
        });
      }
      return issues;
    },
  };
}

/**
 * Rule: Duplicate URLs within a section.
 */
function createNoDuplicateLinksRule(sectionId) {
  return {
    id: `${sectionId}/no-duplicate-links`,
    description: 'No duplicate URLs within a section',
    severity: 'warning',
    check(section) {
      const issues = [];
      const seenUrls = new Map(); // url -> first line
      const lines = section.content.split('\n');
      const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

      for (let i = 0; i < lines.length; i++) {
        let match;
        linkRegex.lastIndex = 0;
        while ((match = linkRegex.exec(lines[i])) !== null) {
          const url = match[2].replace(/\/$/, ''); // normalize trailing slash
          if (seenUrls.has(url)) {
            issues.push({
              line: section.startLine + i,
              message: `Duplicate URL "${url}" (first seen on line ${seenUrls.get(url)})`,
            });
          } else {
            seenUrls.set(url, section.startLine + i);
          }
        }
      }
      return issues;
    },
  };
}

// Generate rule sets for each list-based section
export function createListSectionRules(sectionId) {
  return [
    createListLinkRule(sectionId),
    createListLinkValidRule(sectionId),
    createNonEmptyListRule(sectionId),
    createNoDuplicateLinksRule(sectionId),
  ];
}
