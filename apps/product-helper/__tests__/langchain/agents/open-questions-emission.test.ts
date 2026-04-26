/**
 * open-questions-emission.test — TA1 EC-V21-A.4 fixture replay.
 *
 * Confirms each of M2 (nfr-resynth) / M6 (hoq) / M8 (fmea-residual) fires
 * an OpenQuestion event via its `maybeSurface*` decision-point hook when
 * the upstream evaluation lands below the confidence threshold.
 *
 * No DB / no live LLM — the emitter is a jest.fn() the tests inspect.
 */

import { describe, it, expect, jest } from '@jest/globals';

import {
  maybeSurfaceNfrOpenQuestion,
  NFR_OPEN_QUESTION_CONFIDENCE_THRESHOLD,
} from '@/lib/langchain/agents/system-design/nfr-resynth-agent';
import {
  maybeSurfaceHoqOpenQuestion,
  HOQ_OPEN_QUESTION_CONFIDENCE_THRESHOLD,
} from '@/lib/langchain/agents/system-design/hoq-agent';
import {
  maybeSurfaceResidualOpenQuestion,
  FMEA_RESIDUAL_OPEN_QUESTION_CONFIDENCE_THRESHOLD,
} from '@/lib/langchain/agents/system-design/fmea-residual-agent';

describe('M2 nfr-resynth-agent — open-question emission', () => {
  it('fires emit when final_confidence < threshold', async () => {
    const emit = jest.fn(async () => undefined);
    const fired = await maybeSurfaceNfrOpenQuestion({
      emit,
      project_id: 11,
      final_confidence: 0.4,
      question: 'NFR.07 — pick p95 vs p99 latency target',
      computed_options: [{ id: 'p95', target: 800 }, { id: 'p99', target: 1500 }],
      math_trace: 'fmea_early.FM.05 mitigation_class=performance',
    });
    expect(fired).toBe(true);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit.mock.calls[0][0]).toMatchObject({
      project_id: 11,
      question: 'NFR.07 — pick p95 vs p99 latency target',
    });
  });

  it('no-ops when confidence >= threshold', async () => {
    const emit = jest.fn(async () => undefined);
    const fired = await maybeSurfaceNfrOpenQuestion({
      emit,
      project_id: 11,
      final_confidence: NFR_OPEN_QUESTION_CONFIDENCE_THRESHOLD,
      question: 'q',
    });
    expect(fired).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });

  it('no-ops when emit is not provided', async () => {
    const fired = await maybeSurfaceNfrOpenQuestion({
      project_id: 11,
      final_confidence: 0.0,
      question: 'q',
    });
    expect(fired).toBe(false);
  });
});

describe('M6 hoq-agent — open-question emission', () => {
  it('fires emit on low-confidence relationship-matrix decision', async () => {
    const emit = jest.fn(async () => undefined);
    const fired = await maybeSurfaceHoqOpenQuestion({
      emit,
      project_id: 22,
      final_confidence: 0.5,
      question: 'PC.03 ↔ EC2 strength symbol?',
      computed_options: ['weak', 'medium', 'strong'],
      math_trace: 'derivation: M2.NFR.04 -> EC.04',
    });
    expect(fired).toBe(true);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit.mock.calls[0][0].project_id).toBe(22);
  });

  it('no-ops when confidence >= threshold', async () => {
    const emit = jest.fn(async () => undefined);
    const fired = await maybeSurfaceHoqOpenQuestion({
      emit,
      project_id: 22,
      final_confidence: HOQ_OPEN_QUESTION_CONFIDENCE_THRESHOLD + 0.05,
      question: 'q',
    });
    expect(fired).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });
});

describe('M8 fmea-residual-agent — open-question emission', () => {
  it('fires emit on ambiguous detectability score', async () => {
    const emit = jest.fn(async () => undefined);
    const fired = await maybeSurfaceResidualOpenQuestion({
      emit,
      project_id: 33,
      final_confidence: 0.3,
      question: 'FM.12 detectability on Sonnet+pgvector queue?',
      computed_options: [3, 5, 7],
      math_trace: 'predecessor=FM.05 surviving; chosen AV.01 queue=pg-listen',
    });
    expect(fired).toBe(true);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('no-ops when confidence >= threshold', async () => {
    const emit = jest.fn(async () => undefined);
    const fired = await maybeSurfaceResidualOpenQuestion({
      emit,
      project_id: 33,
      final_confidence: FMEA_RESIDUAL_OPEN_QUESTION_CONFIDENCE_THRESHOLD,
      question: 'q',
    });
    expect(fired).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });
});
