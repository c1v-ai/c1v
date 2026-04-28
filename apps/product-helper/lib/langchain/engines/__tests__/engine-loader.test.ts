import { join } from 'node:path';
import { describe, it, expect } from '@jest/globals';

import {
  loadEngine,
  loadDecision,
  getDecision,
  loadEngines,
  DEFAULT_ENGINES_DIR,
  EngineLoadError,
  EngineValidationError,
  EngineNotFoundError,
  DecisionNotFoundError,
} from '../engine-loader';

const FIXTURES_DIR = join(__dirname, 'fixtures/engines');

describe('engine-loader', () => {
  describe('loadEngine', () => {
    it('loads and validates a well-formed engine.json', async () => {
      const doc = await loadEngine('story-response-latency', {
        basePath: FIXTURES_DIR,
      });
      expect(doc.story_id).toBe('story-response-latency');
      expect(doc.version).toBe('1.0.0');
      expect(doc.decisions).toHaveLength(1);
      expect(doc.decisions[0].decision_id).toBe('RESPONSE_BUDGET_MS');
      expect(doc.decisions[0].inputs).toHaveLength(3);
      expect(doc.decisions[0].function.rules).toHaveLength(3);
    });

    it('throws EngineNotFoundError when file is missing', async () => {
      await expect(
        loadEngine('story-does-not-exist', { basePath: FIXTURES_DIR }),
      ).rejects.toThrow(EngineNotFoundError);
    });

    it('throws EngineLoadError on unsafe slugs (path traversal defense)', async () => {
      await expect(
        loadEngine('../../etc/passwd', { basePath: FIXTURES_DIR }),
      ).rejects.toThrow(EngineLoadError);
      await expect(
        loadEngine('UPPERCASE-NOT-ALLOWED', { basePath: FIXTURES_DIR }),
      ).rejects.toThrow(EngineLoadError);
      await expect(
        loadEngine('ab', { basePath: FIXTURES_DIR }),
      ).rejects.toThrow(EngineLoadError);
    });

    it('throws EngineValidationError for duplicate decision_ids', async () => {
      await expect(
        loadEngine('story-malformed', { basePath: FIXTURES_DIR }),
      ).rejects.toThrow(EngineValidationError);
    });

    it('throws EngineLoadError when filename slug != story_id', async () => {
      await expect(
        loadEngine('story-slug-mismatch', { basePath: FIXTURES_DIR }),
      ).rejects.toThrow(/story_id mismatch/);
    });

    it('exposes default engines dir constant', () => {
      expect(DEFAULT_ENGINES_DIR).toMatch(/\.planning\/engines$/);
    });
  });

  describe('getDecision', () => {
    it('returns matching decision by id', async () => {
      const doc = await loadEngine('story-response-latency', {
        basePath: FIXTURES_DIR,
      });
      const decision = getDecision(doc, 'RESPONSE_BUDGET_MS');
      expect(decision.target_field).toBe('constants_table.RESPONSE_BUDGET_MS');
    });

    it('throws DecisionNotFoundError for unknown id', async () => {
      const doc = await loadEngine('story-response-latency', {
        basePath: FIXTURES_DIR,
      });
      expect(() => getDecision(doc, 'NOT_A_DECISION')).toThrow(
        DecisionNotFoundError,
      );
    });
  });

  describe('loadDecision', () => {
    it('loads story + resolves a single decision', async () => {
      const { doc, decision } = await loadDecision(
        'story-response-latency',
        'RESPONSE_BUDGET_MS',
        { basePath: FIXTURES_DIR },
      );
      expect(doc.story_id).toBe('story-response-latency');
      expect(decision.decision_id).toBe('RESPONSE_BUDGET_MS');
    });

    it('throws when decision_id is absent', async () => {
      await expect(
        loadDecision('story-response-latency', 'MISSING', {
          basePath: FIXTURES_DIR,
        }),
      ).rejects.toThrow(DecisionNotFoundError);
    });
  });

  describe('loadEngines', () => {
    it('batch-loads by slug list', async () => {
      const bag = await loadEngines(['story-response-latency'], {
        basePath: FIXTURES_DIR,
      });
      expect(Object.keys(bag)).toEqual(['story-response-latency']);
      expect(bag['story-response-latency'].decisions).toHaveLength(1);
    });

    it('fails fast on first bad slug', async () => {
      await expect(
        loadEngines(['story-response-latency', 'story-malformed'], {
          basePath: FIXTURES_DIR,
        }),
      ).rejects.toThrow(EngineValidationError);
    });
  });
});
