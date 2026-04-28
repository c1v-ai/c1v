import { describe, it, expect } from '@jest/globals';
import { mathDerivationMatrixSchema } from '../_matrix';
import { roundTrip } from '../../__tests__/crawley-fixtures';

function fixture() {
  return {
    formula: 'PO = F · O',
    inputs: { f_count: 3, o_count: 2 },
    kb_source: 'crawley-ch5',
    result_kind: 'matrix' as const,
    result_matrix: [
      [1, 0],
      [0, 1],
      ["c'", 'a'],
    ],
    result_shape: [3, 2] as [number, number],
    result_is_square: false,
  };
}

describe('mathDerivationMatrixSchema (Option Y keystone)', () => {
  it('parses a valid 3×2 matrix derivation', () => {
    const parsed = mathDerivationMatrixSchema.parse(fixture());
    expect(parsed.result_shape).toEqual([3, 2]);
    expect(parsed.result_kind).toBe('matrix');
  });

  it('round-trips through JSON', () => {
    const parsed = mathDerivationMatrixSchema.parse(fixture());
    const restored = mathDerivationMatrixSchema.parse(roundTrip(parsed));
    expect(restored).toEqual(parsed);
  });

  it('rejects shape[0] mismatch with matrix.length', () => {
    const bad = fixture();
    bad.result_shape = [4, 2];
    expect(() => mathDerivationMatrixSchema.parse(bad)).toThrow();
  });

  it('rejects shape[1] mismatch with matrix[0].length', () => {
    const bad = fixture();
    bad.result_shape = [3, 5];
    expect(() => mathDerivationMatrixSchema.parse(bad)).toThrow();
  });

  it('accepts square 2×2 matrix', () => {
    const parsed = mathDerivationMatrixSchema.parse({
      formula: 'I',
      inputs: {},
      kb_source: 'inline',
      result_kind: 'matrix' as const,
      result_matrix: [
        [1, 0],
        [0, 1],
      ],
      result_shape: [2, 2] as [number, number],
      result_is_square: true,
    });
    expect(parsed.result_is_square).toBe(true);
  });
});
