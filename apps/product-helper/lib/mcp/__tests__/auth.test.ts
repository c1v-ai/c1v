import { describe, it, expect } from '@jest/globals';
import {
  generateApiKey,
  hashApiKey,
  isValidKeyFormat,
  extractKeyPrefix,
  extractProjectIdFromKey,
} from '../auth';

describe('MCP Auth Utilities', () => {
  describe('generateApiKey', () => {
    it('should generate a key with correct format', async () => {
      const result = await generateApiKey(1);
      expect(result.key).toMatch(/^ph_00000001_[A-Za-z0-9_-]{24}$/);
      expect(result.prefix).toBe('ph_00000001');
      expect(result.hash).toBeDefined();
      expect(result.hash.length).toBe(64); // SHA-256 hex
    });

    it('should pad project ID to 8 digits', async () => {
      const result = await generateApiKey(42);
      expect(result.key).toMatch(/^ph_00000042_/);
    });

    it('should handle large project IDs', async () => {
      const result = await generateApiKey(12345678);
      expect(result.key).toMatch(/^ph_12345678_/);
    });

    it('should generate unique keys', async () => {
      const key1 = await generateApiKey(1);
      const key2 = await generateApiKey(1);
      expect(key1.key).not.toBe(key2.key);
    });
  });

  describe('hashApiKey', () => {
    it('should produce consistent hashes for same input', () => {
      const hash1 = hashApiKey('test_key');
      const hash2 = hashApiKey('test_key');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('key1');
      const hash2 = hashApiKey('key2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-char hex string (SHA-256)', () => {
      const hash = hashApiKey('test_key');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('isValidKeyFormat', () => {
    it('should accept valid key format', () => {
      expect(isValidKeyFormat('ph_00000001_AbCdEfGhIjKlMnOpQrStUvWx')).toBe(true);
    });

    it('should accept keys with url-safe base64 chars', () => {
      expect(isValidKeyFormat('ph_00000001_AbCd-fGhIjKl_nOpQrStUvWx')).toBe(true);
    });

    it('should reject invalid prefix', () => {
      expect(isValidKeyFormat('xx_00000001_AbCdEfGhIjKlMnOpQrStUvWx')).toBe(false);
    });

    it('should reject wrong project ID length', () => {
      expect(isValidKeyFormat('ph_0001_AbCdEfGhIjKlMnOpQrStUvWx')).toBe(false);
    });

    it('should reject non-numeric project ID', () => {
      expect(isValidKeyFormat('ph_abcdefgh_AbCdEfGhIjKlMnOpQrStUvWx')).toBe(false);
    });

    it('should reject wrong random part length', () => {
      expect(isValidKeyFormat('ph_00000001_AbCdEf')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidKeyFormat('')).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isValidKeyFormat(null as unknown as string)).toBe(false);
      expect(isValidKeyFormat(undefined as unknown as string)).toBe(false);
    });
  });

  describe('extractKeyPrefix', () => {
    it('should extract prefix from valid key', () => {
      const prefix = extractKeyPrefix('ph_00000001_AbCdEfGhIjKlMnOpQrStUvWx');
      expect(prefix).toBe('ph_00000001');
    });

    it('should return null for short key', () => {
      expect(extractKeyPrefix('ph_0001')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(extractKeyPrefix('')).toBeNull();
    });

    it('should return null for null', () => {
      expect(extractKeyPrefix(null as unknown as string)).toBeNull();
    });
  });

  describe('extractProjectIdFromKey', () => {
    it('should extract project ID from valid key', () => {
      const projectId = extractProjectIdFromKey('ph_00000042_AbCdEfGhIjKlMnOpQrStUvWx');
      expect(projectId).toBe(42);
    });

    it('should extract large project ID', () => {
      const projectId = extractProjectIdFromKey('ph_12345678_AbCdEfGhIjKlMnOpQrStUvWx');
      expect(projectId).toBe(12345678);
    });

    it('should return null for invalid key', () => {
      expect(extractProjectIdFromKey('invalid')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(extractProjectIdFromKey('')).toBeNull();
    });
  });
});
