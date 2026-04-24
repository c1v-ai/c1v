import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';

// TODO: import when runtime types land
// import type { RuleNode, Modifier } from './types';
export interface RuleNode {
  id: string;
  [key: string]: unknown;
}
export interface Modifier {
  id: string;
  [key: string]: unknown;
}

export interface RuleTree {
  decision_id: string;
  version: string;
  auto_fill_threshold: number;
  rules: RuleNode[];
  modifiers: Modifier[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const MAX_RULE_FILE_BYTES = 1_048_576;

const APPROVED_ROOT = path.resolve(
  process.cwd(),
  'apps/product-helper/.planning/phases'
);

const ruleNodeSchema = z
  .object({ id: z.string().min(1) })
  .passthrough();

const modifierSchema = z
  .object({ id: z.string().min(1) })
  .passthrough();

const ruleTreeSchema = z.object({
  decision_id: z.string().min(1),
  version: z.string().min(1),
  auto_fill_threshold: z.number().min(0).max(1),
  rules: z.array(ruleNodeSchema),
  modifiers: z.array(modifierSchema),
});

export class RuleFileSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleFileSecurityError';
  }
}

interface CacheEntry {
  mtimeMs: number;
  tree: RuleTree;
}

export class EngineJsonLoader {
  private cache = new Map<string, CacheEntry>();
  private readonly approvedRoot: string;
  private readonly maxBytes: number;

  constructor(opts?: { approvedRoot?: string; maxBytes?: number }) {
    this.approvedRoot = opts?.approvedRoot
      ? path.resolve(opts.approvedRoot)
      : APPROVED_ROOT;
    this.maxBytes = opts?.maxBytes ?? MAX_RULE_FILE_BYTES;
  }

  async load(ruleFilePath: string): Promise<RuleTree> {
    this.assertSafePath(ruleFilePath);

    const stats = await fs.stat(ruleFilePath);
    if (stats.size > this.maxBytes) {
      throw new Error('rule file exceeds 1MB limit');
    }

    const cached = this.cache.get(ruleFilePath);
    if (cached && cached.mtimeMs === stats.mtimeMs) {
      return cached.tree;
    }

    const raw = await fs.readFile(ruleFilePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    const tree = ruleTreeSchema.parse(parsed) as RuleTree;

    this.cache.set(ruleFilePath, { mtimeMs: stats.mtimeMs, tree });
    return tree;
  }

  validate(tree: RuleTree): ValidationResult {
    const result = ruleTreeSchema.safeParse(tree);
    if (result.success) return { valid: true, errors: [] };
    return {
      valid: false,
      errors: result.error.issues.map(
        (i) => `${i.path.join('.') || '(root)'}: ${i.message}`
      ),
    };
  }

  private assertSafePath(p: string): void {
    if (typeof p !== 'string' || p.length === 0) {
      throw new RuleFileSecurityError('rule file path must be a non-empty string');
    }
    if (p.includes('\0')) {
      throw new RuleFileSecurityError('rule file path contains null byte');
    }
    if (!path.isAbsolute(p)) {
      throw new RuleFileSecurityError('rule file path must be absolute');
    }
    if (p.split(path.sep).includes('..')) {
      throw new RuleFileSecurityError('rule file path contains ".." segment');
    }
    const resolved = path.resolve(p);
    if (
      resolved !== this.approvedRoot &&
      !resolved.startsWith(this.approvedRoot + path.sep)
    ) {
      throw new RuleFileSecurityError(
        'rule file path is outside approved kb root'
      );
    }
  }
}
