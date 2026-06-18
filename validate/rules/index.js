/**
 * Central rule registry.
 * Import all section rules and register them with the engine.
 */

import { RuleEngine } from '../engine.js';
import { allGlobalRules } from './global.js';
import { baseplateRules } from './baseplates.js';
import { binRules } from './bins.js';
import { lidRules } from './lids.js';
import { dashboardRules } from './dashboard.js';
import { adapterRules } from './adapters.js';
import { templateRules } from './templates.js';
import { everythingElseRules } from './everything-else.js';
import { stackfinityRules } from './stackfinity.js';
import { createListSectionRules } from './lists.js';

/**
 * Create and configure a fully-loaded rule engine.
 * @returns {RuleEngine}
 */
export function createEngine() {
  const engine = new RuleEngine();

  // Register global rules (apply to all sections)
  for (const rule of allGlobalRules) {
    engine.registerGlobalRule(rule);
  }

  // Register section-specific rules for table-based sections
  engine.registerRules('Baseplates', baseplateRules);
  engine.registerRules('Bins/Blocks', binRules);
  engine.registerRules('Lids for Bins', lidRules);
  engine.registerRules('Dashboard', dashboardRules);
  engine.registerRules('Adapters', adapterRules);
  engine.registerRules('Templates', templateRules);
  engine.registerRules('Everything Else', everythingElseRules);
  engine.registerRules('Stackfinity', stackfinityRules);

  // Register rules for list-based sections
  const listSections = [
    'Online Generators',
    'Offline Generators',
    'Articles',
    'Videos',
    'Other Collections',
    'Other Resources',
  ];

  for (const sectionName of listSections) {
    const rules = createListSectionRules(sectionName.toLowerCase().replace(/\s+/g, '-'));
    engine.registerRules(sectionName, rules);
  }

  return engine;
}
