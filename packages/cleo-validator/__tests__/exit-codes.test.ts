/**
 * Tests for the CLEO Exit Codes module
 */

import { describe, it, expect } from 'vitest';
import {
  ExitCode,
  isSuccess,
  isValidationError,
  isRetryable,
  requiresIntervention,
  getExitCodeName,
  getExitCodeDescription,
  success,
  failure,
  isValidExitCode,
  type ExitCodeResult,
} from '../src/exit-codes';

describe('CLEO Exit Codes', () => {
  describe('ExitCode constants', () => {
    it('should have SUCCESS equal to 0', () => {
      expect(ExitCode.SUCCESS).toBe(0);
    });

    it('should have GENERAL_ERROR equal to 1', () => {
      expect(ExitCode.GENERAL_ERROR).toBe(1);
    });

    it('should have INVALID_ARGUMENTS equal to 2', () => {
      expect(ExitCode.INVALID_ARGUMENTS).toBe(2);
    });

    it('should have TASK_NOT_FOUND equal to 3', () => {
      expect(ExitCode.TASK_NOT_FOUND).toBe(3);
    });

    it('should have DEPENDENCY_CYCLE equal to 4', () => {
      expect(ExitCode.DEPENDENCY_CYCLE).toBe(4);
    });

    it('should have VALIDATION_SCHEMA equal to 5', () => {
      expect(ExitCode.VALIDATION_SCHEMA).toBe(5);
    });

    it('should have VALIDATION_SEMANTIC equal to 6', () => {
      expect(ExitCode.VALIDATION_SEMANTIC).toBe(6);
    });

    it('should have VALIDATION_REFERENTIAL equal to 7', () => {
      expect(ExitCode.VALIDATION_REFERENTIAL).toBe(7);
    });

    it('should have VALIDATION_STATE_MACHINE equal to 8', () => {
      expect(ExitCode.VALIDATION_STATE_MACHINE).toBe(8);
    });

    it('should have LOCK_TIMEOUT equal to 9', () => {
      expect(ExitCode.LOCK_TIMEOUT).toBe(9);
    });

    it('should have PERMISSION_DENIED equal to 10', () => {
      expect(ExitCode.PERMISSION_DENIED).toBe(10);
    });

    it('should have RESOURCE_NOT_FOUND equal to 11', () => {
      expect(ExitCode.RESOURCE_NOT_FOUND).toBe(11);
    });

    it('should have CONFLICT equal to 12', () => {
      expect(ExitCode.CONFLICT).toBe(12);
    });

    it('should have TIMEOUT equal to 13', () => {
      expect(ExitCode.TIMEOUT).toBe(13);
    });

    it('should have RATE_LIMITED equal to 14', () => {
      expect(ExitCode.RATE_LIMITED).toBe(14);
    });

    it('should have EXTERNAL_SERVICE_ERROR equal to 15', () => {
      expect(ExitCode.EXTERNAL_SERVICE_ERROR).toBe(15);
    });

    it('should have HALLUCINATION_DETECTED equal to 16', () => {
      expect(ExitCode.HALLUCINATION_DETECTED).toBe(16);
    });

    it('should have MANUAL_INTERVENTION_REQUIRED equal to 17', () => {
      expect(ExitCode.MANUAL_INTERVENTION_REQUIRED).toBe(17);
    });
  });

  describe('isSuccess', () => {
    it('should return true only for SUCCESS (0)', () => {
      expect(isSuccess(0)).toBe(true);
      expect(isSuccess(ExitCode.SUCCESS)).toBe(true);
    });

    it('should return false for all other codes', () => {
      expect(isSuccess(1)).toBe(false);
      expect(isSuccess(5)).toBe(false);
      expect(isSuccess(17)).toBe(false);
      expect(isSuccess(-1)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for validation codes 5-8', () => {
      expect(isValidationError(5)).toBe(true);
      expect(isValidationError(6)).toBe(true);
      expect(isValidationError(7)).toBe(true);
      expect(isValidationError(8)).toBe(true);
      expect(isValidationError(ExitCode.VALIDATION_SCHEMA)).toBe(true);
      expect(isValidationError(ExitCode.VALIDATION_SEMANTIC)).toBe(true);
      expect(isValidationError(ExitCode.VALIDATION_REFERENTIAL)).toBe(true);
      expect(isValidationError(ExitCode.VALIDATION_STATE_MACHINE)).toBe(true);
    });

    it('should return false for non-validation codes', () => {
      expect(isValidationError(0)).toBe(false);
      expect(isValidationError(1)).toBe(false);
      expect(isValidationError(4)).toBe(false);
      expect(isValidationError(9)).toBe(false);
      expect(isValidationError(17)).toBe(false);
    });
  });

  describe('isRetryable', () => {
    it('should return true for retryable error codes', () => {
      expect(isRetryable(ExitCode.LOCK_TIMEOUT)).toBe(true);
      expect(isRetryable(ExitCode.TIMEOUT)).toBe(true);
      expect(isRetryable(ExitCode.RATE_LIMITED)).toBe(true);
      expect(isRetryable(ExitCode.EXTERNAL_SERVICE_ERROR)).toBe(true);
    });

    it('should return false for non-retryable codes', () => {
      expect(isRetryable(ExitCode.SUCCESS)).toBe(false);
      expect(isRetryable(ExitCode.VALIDATION_SCHEMA)).toBe(false);
      expect(isRetryable(ExitCode.PERMISSION_DENIED)).toBe(false);
      expect(isRetryable(ExitCode.HALLUCINATION_DETECTED)).toBe(false);
    });
  });

  describe('requiresIntervention', () => {
    it('should return true for codes requiring human intervention', () => {
      expect(requiresIntervention(ExitCode.MANUAL_INTERVENTION_REQUIRED)).toBe(true);
      expect(requiresIntervention(ExitCode.HALLUCINATION_DETECTED)).toBe(true);
      expect(requiresIntervention(ExitCode.PERMISSION_DENIED)).toBe(true);
    });

    it('should return false for codes not requiring intervention', () => {
      expect(requiresIntervention(ExitCode.SUCCESS)).toBe(false);
      expect(requiresIntervention(ExitCode.VALIDATION_SCHEMA)).toBe(false);
      expect(requiresIntervention(ExitCode.TIMEOUT)).toBe(false);
      expect(requiresIntervention(ExitCode.GENERAL_ERROR)).toBe(false);
    });
  });

  describe('getExitCodeName', () => {
    it('should return correct names for all exit codes', () => {
      expect(getExitCodeName(0)).toBe('SUCCESS');
      expect(getExitCodeName(1)).toBe('GENERAL_ERROR');
      expect(getExitCodeName(2)).toBe('INVALID_ARGUMENTS');
      expect(getExitCodeName(3)).toBe('TASK_NOT_FOUND');
      expect(getExitCodeName(4)).toBe('DEPENDENCY_CYCLE');
      expect(getExitCodeName(5)).toBe('VALIDATION_SCHEMA');
      expect(getExitCodeName(6)).toBe('VALIDATION_SEMANTIC');
      expect(getExitCodeName(7)).toBe('VALIDATION_REFERENTIAL');
      expect(getExitCodeName(8)).toBe('VALIDATION_STATE_MACHINE');
      expect(getExitCodeName(9)).toBe('LOCK_TIMEOUT');
      expect(getExitCodeName(10)).toBe('PERMISSION_DENIED');
      expect(getExitCodeName(11)).toBe('RESOURCE_NOT_FOUND');
      expect(getExitCodeName(12)).toBe('CONFLICT');
      expect(getExitCodeName(13)).toBe('TIMEOUT');
      expect(getExitCodeName(14)).toBe('RATE_LIMITED');
      expect(getExitCodeName(15)).toBe('EXTERNAL_SERVICE_ERROR');
      expect(getExitCodeName(16)).toBe('HALLUCINATION_DETECTED');
      expect(getExitCodeName(17)).toBe('MANUAL_INTERVENTION_REQUIRED');
    });

    it('should return UNKNOWN for unrecognized codes', () => {
      expect(getExitCodeName(99)).toBe('UNKNOWN');
      expect(getExitCodeName(-1)).toBe('UNKNOWN');
      expect(getExitCodeName(100)).toBe('UNKNOWN');
    });
  });

  describe('getExitCodeDescription', () => {
    it('should return descriptions for all exit codes', () => {
      expect(getExitCodeDescription(0)).toBe('Operation completed successfully');
      expect(getExitCodeDescription(1)).toBe('An unspecified error occurred');
      expect(getExitCodeDescription(5)).toBe('Schema validation failed');
      expect(getExitCodeDescription(16)).toBe('AI hallucination was detected');
      expect(getExitCodeDescription(17)).toBe('Manual intervention is required to proceed');
    });

    it('should return default message for unknown codes', () => {
      expect(getExitCodeDescription(99)).toBe('Unknown exit code: 99');
      expect(getExitCodeDescription(-1)).toBe('Unknown exit code: -1');
    });
  });

  describe('success', () => {
    it('should create a success result with code 0', () => {
      const result = success();
      expect(result.code).toBe(ExitCode.SUCCESS);
      expect(result.message).toBeUndefined();
      expect(result.details).toBeUndefined();
    });

    it('should include message when provided', () => {
      const result = success('Task completed');
      expect(result.code).toBe(ExitCode.SUCCESS);
      expect(result.message).toBe('Task completed');
    });

    it('should include details when provided', () => {
      const details = { taskId: 'T001', duration: 1500 };
      const result = success('Task completed', details);
      expect(result.code).toBe(ExitCode.SUCCESS);
      expect(result.message).toBe('Task completed');
      expect(result.details).toEqual(details);
    });
  });

  describe('failure', () => {
    it('should create a failure result with specified error code', () => {
      const result = failure(ExitCode.VALIDATION_SCHEMA);
      expect(result.code).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.message).toBe('Schema validation failed'); // Default description
    });

    it('should use custom message when provided', () => {
      const result = failure(ExitCode.VALIDATION_SCHEMA, 'Invalid JSON structure');
      expect(result.code).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.message).toBe('Invalid JSON structure');
    });

    it('should include details when provided', () => {
      const errors = [{ path: '/name', message: 'Required field' }];
      const result = failure(ExitCode.VALIDATION_SCHEMA, 'Validation failed', errors);
      expect(result.code).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.message).toBe('Validation failed');
      expect(result.details).toEqual(errors);
    });

    it('should work with all error codes', () => {
      const generalError = failure(ExitCode.GENERAL_ERROR);
      expect(generalError.code).toBe(1);

      const timeout = failure(ExitCode.TIMEOUT);
      expect(timeout.code).toBe(13);

      const hallucination = failure(ExitCode.HALLUCINATION_DETECTED);
      expect(hallucination.code).toBe(16);
    });
  });

  describe('isValidExitCode', () => {
    it('should return true for valid exit codes 0-17', () => {
      for (let i = 0; i <= 17; i++) {
        expect(isValidExitCode(i)).toBe(true);
      }
    });

    it('should return false for codes outside valid range', () => {
      expect(isValidExitCode(-1)).toBe(false);
      expect(isValidExitCode(18)).toBe(false);
      expect(isValidExitCode(100)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(isValidExitCode(1.5)).toBe(false);
      expect(isValidExitCode(0.1)).toBe(false);
    });

    it('should return false for non-number values', () => {
      expect(isValidExitCode('0')).toBe(false);
      expect(isValidExitCode(null)).toBe(false);
      expect(isValidExitCode(undefined)).toBe(false);
      expect(isValidExitCode({})).toBe(false);
      expect(isValidExitCode([])).toBe(false);
    });
  });

  describe('ExitCodeResult type', () => {
    it('should allow well-formed result objects', () => {
      const result: ExitCodeResult = {
        code: ExitCode.SUCCESS,
        message: 'All good',
        details: { count: 5 },
      };
      expect(result.code).toBe(0);
      expect(result.message).toBe('All good');
      expect(result.details).toEqual({ count: 5 });
    });

    it('should allow minimal result objects', () => {
      const result: ExitCodeResult = {
        code: ExitCode.GENERAL_ERROR,
      };
      expect(result.code).toBe(1);
      expect(result.message).toBeUndefined();
      expect(result.details).toBeUndefined();
    });
  });
});
