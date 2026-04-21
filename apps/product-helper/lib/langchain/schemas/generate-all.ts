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

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const { zodSchema, name, filename } of SCHEMAS) {
    const json = zodToStrictJsonSchema(zodSchema, name);
    const outputPath = join(OUTPUT_DIR, filename);
    writeFileSync(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(`✔ ${name.padEnd(20)} → ${filename}`);
  }

  console.log(`\nGenerated ${SCHEMAS.length} schemas → ${OUTPUT_DIR}`);
}

main();
