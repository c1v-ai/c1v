/**
 * CLEO Validator
 *
 * Validation framework for the GSD workflow, implementing the CLEO methodology
 * for reliable task management and error handling.
 *
 * @packageDocumentation
 */

// Export all exit code utilities
export {
  ExitCode,
  type ExitCodeValue,
  type ExitCodeName,
  type ExitCodeResult,
  isSuccess,
  isValidationError,
  isRetryable,
  requiresIntervention,
  getExitCodeName,
  getExitCodeDescription,
  success,
  failure,
  isValidExitCode,
} from './exit-codes';
