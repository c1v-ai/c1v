import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { z } from 'zod';

import {
  constantsTableSchema,
  decisionMatrixSchema,
  enhancedUseCaseSchema,
  extractionSchema,
  ffbdSchema,
  interfacesSchema,
  qfdSchema,
  requirementsTableSchema,
  useCaseSchema,
} from '../schemas';
import { zodToStrictJsonSchema } from './zod-to-json';
import { MODULE_0_PHASE_SCHEMAS } from './module-0';
import { MODULE_1_PHASE_SCHEMAS } from './module-1';
import { MODULE_2_PHASE_SCHEMAS } from './module-2';
import { MODULE_3_PHASE_SCHEMAS } from './module-3';
import { MODULE_4_PHASE_SCHEMAS } from './module-4';
import { MODULE_5_PHASE_SCHEMAS } from './module-5';
import { MODULE_7_PHASE_SCHEMAS } from './module-7-interfaces';
import { MODULE_8_PHASE_SCHEMAS } from './module-8-risk';
import { MODULE_8_ATLAS_SCHEMAS } from './atlas';
import { SYNTHESIS_SCHEMAS } from './synthesis';

interface SchemaEntry {
  zodSchema: z.ZodType;
  name: string;
  filename: string;
}

const SCHEMAS: SchemaEntry[] = [
  { zodSchema: useCaseSchema, name: 'UseCase', filename: 'use-case.schema.json' },
  {
    zodSchema: enhancedUseCaseSchema,
    name: 'EnhancedUseCase',
    filename: 'enhanced-use-case.schema.json',
  },
  { zodSchema: ffbdSchema, name: 'Ffbd', filename: 'ffbd.schema.json' },
  {
    zodSchema: decisionMatrixSchema,
    name: 'DecisionMatrix',
    filename: 'decision-matrix.schema.json',
  },
  { zodSchema: qfdSchema, name: 'Qfd', filename: 'qfd.schema.json' },
  {
    zodSchema: interfacesSchema,
    name: 'Interfaces',
    filename: 'interfaces.schema.json',
  },
  {
    zodSchema: extractionSchema,
    name: 'ExtractionResult',
    filename: 'extraction.schema.json',
  },
  {
    zodSchema: requirementsTableSchema,
    name: 'RequirementsTable',
    filename: 'requirements-table.schema.json',
  },
  {
    zodSchema: constantsTableSchema,
    name: 'ConstantsTable',
    filename: 'constants-table.schema.json',
  },
];

const OUTPUT_DIR = join(process.cwd(), 'lib/langchain/schemas/generated');
const MODULE_0_OUTPUT_DIR = join(OUTPUT_DIR, 'module-0');
const MODULE_1_OUTPUT_DIR = join(OUTPUT_DIR, 'module-1');
const MODULE_2_OUTPUT_DIR = join(OUTPUT_DIR, 'module-2');
const MODULE_3_OUTPUT_DIR = join(OUTPUT_DIR, 'module-3');
const MODULE_4_OUTPUT_DIR = join(OUTPUT_DIR, 'module-4');
const MODULE_5_OUTPUT_DIR = join(OUTPUT_DIR, 'module-5');
const MODULE_7_OUTPUT_DIR = join(OUTPUT_DIR, 'module-7-interfaces');
const MODULE_8_RISK_OUTPUT_DIR = join(OUTPUT_DIR, 'module-8-risk');
const ATLAS_OUTPUT_DIR = join(OUTPUT_DIR, 'atlas');
const SYNTHESIS_OUTPUT_DIR = join(OUTPUT_DIR, 'synthesis');

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_0_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_1_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_2_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_3_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_4_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_5_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_7_OUTPUT_DIR, { recursive: true });
  mkdirSync(MODULE_8_RISK_OUTPUT_DIR, { recursive: true });
  mkdirSync(ATLAS_OUTPUT_DIR, { recursive: true });
  mkdirSync(SYNTHESIS_OUTPUT_DIR, { recursive: true });

  // Legacy root-level schemas (pre-module-2)
  for (const { zodSchema, name, filename } of SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const outputPath = join(OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → ${filename}`);
  }

  // Module 0 gate schemas (pre-pipeline: user_profile + project_entry + intake_discriminators)
  for (const { zodSchema, name, slug } of MODULE_0_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_0_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-0/${filename}`);
  }

  // Module 1 phase schemas (Gate B — phase 2.5 data_flows)
  for (const { zodSchema, name, slug } of MODULE_1_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_1_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-1/${filename}`);
  }

  // Module 2 phase schemas (Gate B)
  for (const { zodSchema, name, slug } of MODULE_2_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_2_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-2/${filename}`);
  }

  // Module 3 phase schemas (Gate B: phases 0a, 6, 11 — FFBD → DM bridge precondition)
  for (const { zodSchema, name, slug } of MODULE_3_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_3_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-3/${filename}`);
  }

  // Module 4 phase schemas (Decision Matrix — full A-to-Z sweep, 14 phases)
  for (const { zodSchema, name, slug } of MODULE_4_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_4_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-4/${filename}`);
  }

  // Module 5 Form-Function schemas (7 phases + v1 composite; Q=s·(1-k) cites Stevens/Bass, NOT Crawley)
  for (const { zodSchema, name, slug } of MODULE_5_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_5_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-5/${filename}`);
  }

  // Module 7 Interfaces schemas (N² matrix v1)
  for (const { zodSchema, name, slug } of MODULE_7_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_7_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-7-interfaces/${filename}`);
  }

  // Module 8 Risk schemas (FMEA-early v1)
  for (const { zodSchema, name, slug } of MODULE_8_PHASE_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(MODULE_8_RISK_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → module-8-risk/${filename}`);
  }

  // Module 8 Atlas schemas (KB-8: company entry + priors + result-shape union)
  for (const { zodSchema, name, slug } of MODULE_8_ATLAS_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(ATLAS_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → atlas/${filename}`);
  }

  // Synthesis schemas (capstone architecture_recommendation.v1)
  for (const { zodSchema, name, slug } of SYNTHESIS_SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const filename = `${slug}.schema.json`;
    const outputPath = join(SYNTHESIS_OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(30)} → synthesis/${filename}`);
  }

  const total =
    SCHEMAS.length +
    MODULE_0_PHASE_SCHEMAS.length +
    MODULE_1_PHASE_SCHEMAS.length +
    MODULE_2_PHASE_SCHEMAS.length +
    MODULE_3_PHASE_SCHEMAS.length +
    MODULE_4_PHASE_SCHEMAS.length +
    MODULE_5_PHASE_SCHEMAS.length +
    MODULE_7_PHASE_SCHEMAS.length +
    MODULE_8_PHASE_SCHEMAS.length +
    MODULE_8_ATLAS_SCHEMAS.length +
    SYNTHESIS_SCHEMAS.length;
  console.log(
    `\nGenerated ${total} schemas (${SCHEMAS.length} legacy + ${MODULE_0_PHASE_SCHEMAS.length} module-0 + ${MODULE_1_PHASE_SCHEMAS.length} module-1 + ${MODULE_2_PHASE_SCHEMAS.length} module-2 + ${MODULE_3_PHASE_SCHEMAS.length} module-3 + ${MODULE_4_PHASE_SCHEMAS.length} module-4 + ${MODULE_5_PHASE_SCHEMAS.length} module-5 + ${MODULE_7_PHASE_SCHEMAS.length} module-7 + ${MODULE_8_PHASE_SCHEMAS.length} module-8-risk + ${MODULE_8_ATLAS_SCHEMAS.length} atlas + ${SYNTHESIS_SCHEMAS.length} synthesis) → ${OUTPUT_DIR}`,
  );
}

main();
