/**
 * SR-CORNELL Validation Types
 * Based on SR-CORNELL-PRD-95-V1 specification
 */

/**
 * Hard Gate IDs
 * These are the 10 mandatory checks that must be validated
 */
export enum HardGate {
  SYSTEM_BOUNDARY_DEFINED = 'system_boundary_defined',
  PRIMARY_ACTORS_DEFINED = 'primary_actors_defined',
  ROLES_PERMISSIONS_DEFINED = 'roles_permissions_defined',
  EXTERNAL_ENTITIES_DEFINED = 'external_entities_defined',
  USE_CASE_LIST_5_TO_15 = 'use_case_list_5_to_15_defined',
  USE_CASE_TRIGGER_OUTCOME = 'each_use_case_has_trigger_and_outcome',
  SUCCESS_CRITERIA_MEASURABLE = 'success_criteria_measurable_or_tbd_with_owner_date',
  CONSTRAINTS_PRESENT = 'constraints_business_and_technical_present',
  CORE_DATA_OBJECTS_DEFINED = 'core_data_objects_defined',
  SOURCE_REFERENCE_PRESENT = 'at_least_one_source_reference_present',
}

/**
 * Artifact Types
 * Diagrams and documents that can be validated
 */
export enum ArtifactType {
  CONTEXT_DIAGRAM = 'context_diagram',
  USE_CASE_DIAGRAM = 'use_case',
  SCOPE_TREE = 'scope_tree',
  UCBD = 'ucbd',
  REQUIREMENTS_TABLE = 'requirements_table',
  CONSTANTS_TABLE = 'constants_table',
  ACTIVITY_DIAGRAM = 'activity_diagram',
}

/**
 * Result for a single validation check
 */
export interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Results for a hard gate validation
 */
export interface HardGateResult {
  gate: HardGate;
  passed: boolean;
  checks: ValidationCheck[];
}

/**
 * Results for artifact-specific validation
 */
export interface ArtifactValidationResult {
  artifactType: ArtifactType;
  present: boolean;
  checks: ValidationCheck[];
  passed: boolean;
}

/**
 * Complete validation result for a project
 */
export interface ValidationResult {
  // Overall status
  projectId: number;
  overallScore: number; // 0-100
  passed: boolean; // true if score >= threshold (95)
  threshold: number; // 0.95 = 95%

  // Counts
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;

  // Detailed results
  hardGates: HardGateResult[];
  artifacts: ArtifactValidationResult[];
  consistencyChecks: ValidationCheck[];

  // Messages
  errors: string[];
  warnings: string[];

  // Metadata
  validatedAt: Date;
}

/**
 * Project data structure for validation
 * This is what we extract from the database for validation
 */
export interface ProjectValidationData {
  id: number;
  name: string;
  vision: string;
  status: string;

  // From projectData table
  actors?: Array<{
    name: string;
    role?: string;
    description?: string;
    permissions?: string[];
  }>;

  useCases?: Array<{
    id: string;
    name: string;
    description?: string;
    actor?: string;
    trigger?: string;
    outcome?: string;
    preconditions?: string[];
    postconditions?: string[];
  }>;

  systemBoundaries?: {
    internal?: string[];
    external?: string[];
    inScope?: string[];
    outOfScope?: string[];
  };

  dataEntities?: Array<{
    name: string;
    attributes?: string[];
    relationships?: string[];
  }>;

  // From artifacts table
  artifacts?: Array<{
    id: number;
    type: string;
    content: any;
    status: string;
  }>;

  // Additional metadata
  completeness?: number;
  validationScore?: number;
}
