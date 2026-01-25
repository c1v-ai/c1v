import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
  getRateLimitHeaders,
  MAX_REQUESTS,
} from '../rate-limit';

describe('Rate Limiting', () => {
  const testPrefix = 'ph_00000001';

  beforeEach(() => {
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit(testPrefix);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(MAX_REQUESTS - 1);
    });

    it('should track request count', () => {
      checkRateLimit(testPrefix);
      checkRateLimit(testPrefix);
      const result = checkRateLimit(testPrefix);
      expect(result.remaining).toBe(MAX_REQUESTS - 3);
    });

    it('should block after limit exceeded', () => {
      for (let i = 0; i < MAX_REQUESTS; i++) {
        checkRateLimit(testPrefix);
      }
      const result = checkRateLimit(testPrefix);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track separate keys independently', () => {
      // Exhaust limit for first key
      for (let i = 0; i < MAX_REQUESTS; i++) {
        checkRateLimit(testPrefix);
      }
      const result1 = checkRateLimit(testPrefix);
      const result2 = checkRateLimit('ph_00000002');

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });

    it('should include resetAt timestamp', () => {
      const result = checkRateLimit(testPrefix);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for a key', () => {
      // Use up some requests
      for (let i = 0; i < 50; i++) {
        checkRateLimit(testPrefix);
      }

      resetRateLimit(testPrefix);
      const result = checkRateLimit(testPrefix);
      expect(result.remaining).toBe(MAX_REQUESTS - 1);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return null for unknown key', () => {
      const status = getRateLimitStatus('unknown_key');
      expect(status).toBeNull();
    });

    it('should return status for known key', () => {
      checkRateLimit(testPrefix);
      const status = getRateLimitStatus(testPrefix);
      expect(status).not.toBeNull();
      expect(status?.remaining).toBe(MAX_REQUESTS - 1);
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should return correct headers', () => {
      const result = checkRateLimit(testPrefix);
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe(MAX_REQUESTS.toString());
      expect(headers['X-RateLimit-Remaining']).toBe(result.remaining.toString());
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });
  });
});
