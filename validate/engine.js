/**
 * Rule engine with a registry pattern.
 * Rules are registered per-section and executed against parsed section data.
 *
 * Each rule is an object:
 *   {
 *     id: string,            - Unique rule identifier
 *     description: string,   - Human-readable description
 *     severity: 'error' | 'warning',
 *     check: (section) => Array<{line, message}>
 *   }
 */

export class RuleEngine {
  constructor() {
    // Map of section name -> array of rules
    this.sectionRules = new Map();
    // Rules that apply to ALL sections
    this.globalRules = [];
  }

  /**
   * Register a rule for a specific section.
   * @param {string} sectionName - The section heading (e.g., "Baseplates")
   * @param {object} rule - The rule object
   */
  registerRule(sectionName, rule) {
    if (!this.sectionRules.has(sectionName)) {
      this.sectionRules.set(sectionName, []);
    }
    this.sectionRules.get(sectionName).push(rule);
  }

  /**
   * Register multiple rules for a section at once.
   */
  registerRules(sectionName, rules) {
    for (const rule of rules) {
      this.registerRule(sectionName, rule);
    }
  }

  /**
   * Register a rule that runs against every section.
   */
  registerGlobalRule(rule) {
    this.globalRules.push(rule);
  }

  /**
   * Run all applicable rules against a set of parsed sections.
   * @param {Array} sections - Parsed sections from parser.js
   * @returns {Array<{section, rule, severity, line, message}>}
   */
  validate(sections) {
    const results = [];

    for (const section of sections) {
      // Run global rules
      for (const rule of this.globalRules) {
        const issues = rule.check(section);
        for (const issue of issues) {
          results.push({
            section: section.name,
            ruleId: rule.id,
            severity: rule.severity,
            line: issue.line,
            message: issue.message,
          });
        }
      }

      // Run section-specific rules
      const sectionSpecific = this.sectionRules.get(section.name) || [];
      for (const rule of sectionSpecific) {
        const issues = rule.check(section);
        for (const issue of issues) {
          results.push({
            section: section.name,
            ruleId: rule.id,
            severity: rule.severity,
            line: issue.line,
            message: issue.message,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get a summary of registered rules.
   */
  getSummary() {
    const summary = { global: this.globalRules.length, sections: {} };
    for (const [name, rules] of this.sectionRules) {
      summary.sections[name] = rules.length;
    }
    return summary;
  }
}
