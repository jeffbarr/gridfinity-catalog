# Gridfinity Catalog Validator

A zero-dependency JavaScript tool that validates the structure and content of the gridfinity-catalog `README.md`.

## Requirements

- Node.js 18 or later

## Quick Start

From the repository root:

```bash
node validate/index.js
```

## Command-Line Options

| Flag | Description |
|------|-------------|
| `--verbose` | Show parsed sections and rule counts before results |
| `--errors-only` | Only show errors (suppress warnings) |
| `--section "Name"` | Validate a single section (partial match, case-insensitive) |

### Examples

```bash
# Run all rules, default output
node validate/index.js

# See what was parsed and how many rules loaded
node validate/index.js --verbose

# Only show errors (useful for CI — exits with code 1 if any errors found)
node validate/index.js --errors-only

# Validate just the Baseplates section
node validate/index.js --section "Baseplates"

# Validate anything matching "bin"
node validate/index.js --section "bin"
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No errors (warnings may be present) |
| `1` | One or more errors found |
| `2` | Configuration problem (file not found, invalid arguments) |

## What It Checks

### Global Rules (all table-based sections)

- **Column count consistency** — each row has the same number of columns as the header
- **Description has link** — Description column contains a markdown link
- **Description link valid** — URLs in Description are well-formed
- **Date Added valid** — dates match YYYY-MM-DD format and are real calendar dates
- **Date not future** — Date Added is not in the future
- **No empty rows** — table rows are not entirely blank

### Section-Specific Rules (Baseplates, Bins/Blocks, Lids, etc.)

- **Sizes required** — Sizes column is not empty
- **Sizes format** — Sizes use the NxM pattern (e.g., `2x3`, `1x1-7x7`)
- **Variants valid** — Variants column is a number, range, or dash
- **Format required** — Format column is not empty
- **Date required** — Date Added is not missing
- **Alphabetical order** — entries are sorted alphabetically by description

### List-Section Rules (Online Generators, Articles, Videos, etc.)

- **List has link** — each bullet item contains a markdown link
- **List link valid** — URLs in list items are well-formed
- **List not empty** — section contains at least one list item
- **No duplicate links** — no repeated URLs within a section

## Output Format

Issues are grouped by section and prefixed with severity:

```
Found 5 issue(s): 1 error(s), 4 warning(s)

── Baseplates (3 issue(s)) ──
  ❌ L51 [baseplates/sizes-required] Sizes column is empty
  ⚠️  L53 [baseplates/alphabetical-order] "Baseplates with Handle" should come before...
  ⚠️  L66 [baseplates/date-required] Date Added is missing

── Bins/Blocks (2 issue(s)) ──
  ❌ L251 [global/date-added-valid] Invalid Date Added: "STL,3MF" is not in YYYY-MM-DD format
  ⚠️  L127 [bins/sizes-format] Sizes "1" doesn't match expected NxM format
```

Each line includes:
- Severity icon (`❌` error, `⚠️` warning)
- Line number in README.md
- Rule ID (e.g., `baseplates/sizes-required`)
- Human-readable message

## Project Structure

```
validate/
├── README.md              ← You are here
├── package.json           # Metadata and npm scripts
├── index.js               # CLI entry point
├── parser.js              # Markdown → sections + tables
├── engine.js              # Rule engine (registry + runner)
└── rules/
    ├── index.js           # Wires all rules to the engine
    ├── helpers.js         # Shared utilities (date, URL, format)
    ├── global.js          # Rules applied to all sections
    ├── baseplates.js      # Baseplates section rules
    ├── bins.js            # Bins/Blocks section rules
    ├── lids.js            # Lids for Bins rules
    ├── dashboard.js       # Dashboard rules
    ├── adapters.js        # Adapters rules
    ├── templates.js       # Templates rules
    ├── everything-else.js # Everything Else rules
    └── lists.js           # Factory for list-based sections
```

## Adding a New Rule

1. Create a rule object:

```js
export const myRule = {
  id: 'section-name/rule-name',
  description: 'What this rule checks',
  severity: 'error',  // or 'warning'
  check(section) {
    const issues = [];
    // Inspect section.tables, section.content, etc.
    // Push { line: number, message: string } for each problem
    return issues;
  },
};
```

2. Register it in `rules/index.js`:

```js
import { myRule } from './my-rules.js';
engine.registerRule('Section Name', myRule);
```

## Adding a New Section

1. Create a new file in `rules/` (e.g., `rules/my-section.js`)
2. Export an array of rule objects
3. Register them in `rules/index.js`:

```js
import { mySectionRules } from './my-section.js';
engine.registerRules('My Section Heading', mySectionRules);
```

The section name must exactly match the `# Heading` in the README.

## CI Integration

Add to a GitHub Actions workflow:

```yaml
- name: Validate catalog
  run: node validate/index.js --errors-only
```

The process exits with code `1` on errors, which will fail the workflow step.
