#!/usr/bin/env node

/**
 * Gridfinity Catalog Validator
 *
 * Usage:
 *   node validate/index.js [--verbose] [--section "Section Name"] [--errors-only]
 *
 * Validates the README.md against a set of configurable rules per section.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseSections } from './parser.js';
import { createEngine } from './rules/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- CLI argument parsing ---
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const errorsOnly = args.includes('--errors-only');
const sectionIdx = args.indexOf('--section');
const filterSection = sectionIdx !== -1 ? args[sectionIdx + 1] : null;

// --- Load README ---
const readmePath = resolve(__dirname, '..', 'README.md');
let markdown;
try {
  markdown = readFileSync(readmePath, 'utf-8');
} catch (err) {
  console.error(`❌ Could not read README.md at ${readmePath}`);
  console.error(err.message);
  process.exit(2);
}

// --- Parse ---
const sections = parseSections(markdown);

if (verbose) {
  console.log(`📄 Parsed ${sections.length} sections:`);
  for (const s of sections) {
    const tableInfo = s.tables.length > 0
      ? ` (${s.tables.reduce((sum, t) => sum + t.rows.length, 0)} rows in ${s.tables.length} table(s))`
      : '';
    console.log(`   • ${s.name}${tableInfo}`);
  }
  console.log('');
}

// --- Validate ---
const engine = createEngine();

if (verbose) {
  const summary = engine.getSummary();
  const totalRules = summary.global + Object.values(summary.sections).reduce((a, b) => a + b, 0);
  console.log(`🔧 ${totalRules} rules loaded (${summary.global} global, ${Object.keys(summary.sections).length} sections with specific rules)`);
  console.log('');
}

let sectionsToValidate = sections;
if (filterSection) {
  sectionsToValidate = sections.filter(s => s.name.toLowerCase().includes(filterSection.toLowerCase()));
  if (sectionsToValidate.length === 0) {
    console.error(`❌ No section found matching "${filterSection}"`);
    process.exit(2);
  }
}

const results = engine.validate(sectionsToValidate);

// --- Filter ---
let filteredResults = results;
if (errorsOnly) {
  filteredResults = results.filter(r => r.severity === 'error');
}

// --- Report ---
if (filteredResults.length === 0) {
  console.log('✅ No issues found!');
  process.exit(0);
}

// Group by section
const grouped = new Map();
for (const r of filteredResults) {
  if (!grouped.has(r.section)) grouped.set(r.section, []);
  grouped.get(r.section).push(r);
}

const errorCount = filteredResults.filter(r => r.severity === 'error').length;
const warningCount = filteredResults.filter(r => r.severity === 'warning').length;

console.log(`Found ${filteredResults.length} issue(s): ${errorCount} error(s), ${warningCount} warning(s)\n`);

for (const [section, issues] of grouped) {
  console.log(`── ${section} (${ issues.length} issue(s)) ──`);
  for (const issue of issues) {
    const icon = issue.severity === 'error' ? '❌' : '⚠️';
    const lineInfo = issue.line ? `L${issue.line}` : '   ';
    console.log(`  ${icon} ${lineInfo} [${issue.ruleId}] ${issue.message}`);
  }
  console.log('');
}

// --- Exit code ---
process.exit(errorCount > 0 ? 1 : 0);
