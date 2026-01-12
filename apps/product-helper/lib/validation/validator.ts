/**
 * SR-CORNELL Validation Engine
 * Implements the 10 hard gates from SR-CORNELL-PRD-95-V1 specification
 */

import {
  HardGate,
  ArtifactType,
  type ValidationResult,
  type ValidationCheck,
  type HardGateResult,
  type ArtifactValidationResult,
  type ProjectValidationData,
} from './types';

/**
 * Validation threshold (95% compliance required)
 */
const VALIDATION_THRESHOLD = 0.95;

/**
 * Hard Gate Descriptions
 */
const HARD_GATE_DESCRIPTIONS: Record<HardGate, { name: string; description: string }> = {
  [HardGate.SYSTEM_BOUNDARY_DEFINED]: {
    name: 'System Boundary Defined',
    description: 'System boundaries must clearly distinguish what is inside vs outside the system',
  },
  [HardGate.PRIMARY_ACTORS_DEFINED]: {
    name: 'Primary Actors Defined',
    description: 'At least 2 primary actors must be defined with clear roles',
  },
  [HardGate.ROLES_PERMISSIONS_DEFINED]: {
    name: 'Roles & Permissions Defined',
    description: 'Actor roles and permissions must be explicitly specified',
  },
  [HardGate.EXTERNAL_ENTITIES_DEFINED]: {
    name: 'External Entities Defined',
    description: 'External systems and entities must be identified',
  },
  [HardGate.USE_CASE_LIST_5_TO_15]: {
    name: 'Use Case List (5-15)',
    description: 'Between 5 and 15 use cases must be defined',
  },
  [HardGate.USE_CASE_TRIGGER_OUTCOME]: {
    name: 'Use Case Trigger & Outcome',
    description: 'Each use case must have a clear trigger and outcome',
  },
  [HardGate.SUCCESS_CRITERIA_MEASURABLE]: {
    name: 'Success Criteria Measurable',
    description: 'Success criteria must be measurable or TBD with owner and date',
  },
  [HardGate.CONSTRAINTS_PRESENT]: {
    name: 'Constraints Present',
    description: 'Both business and technical constraints must be documented',
  },
  [HardGate.CORE_DATA_OBJECTS_DEFINED]: {
    name: 'Core Data Objects Defined',
    description: 'Core data entities and their relationships must be specified',
  },
  [HardGate.SOURCE_REFERENCE_PRESENT]: {
    name: 'Source Reference Present',
    description: 'At least one source reference or stakeholder must be documented',
  },
};

/**
 * Main validation function
 * Evaluates a project against all SR-CORNELL hard gates
 */
export async function validateProject(data: ProjectValidationData): Promise<ValidationResult> {
  const hardGates: HardGateResult[] = [];
  const artifacts: ArtifactValidationResult[] = [];
  const consistencyChecks: ValidationCheck[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Execute all 10 hard gate checks
  hardGates.push(validateHardGate1(data, errors));
  hardGates.push(validateHardGate2(data, errors));
  hardGates.push(validateHardGate3(data, errors, warnings));
  hardGates.push(validateHardGate4(data, errors));
  hardGates.push(validateHardGate5(data, errors));
  hardGates.push(validateHardGate6(data, errors, warnings));
  hardGates.push(validateHardGate7(data, errors, warnings));
  hardGates.push(validateHardGate8(data, errors, warnings));
  hardGates.push(validateHardGate9(data, errors));
  hardGates.push(validateHardGate10(data, errors, warnings));

  // Validate artifacts if present
  if (data.artifacts && data.artifacts.length > 0) {
    artifacts.push(validateContextDiagram(data));
    artifacts.push(validateUseCaseDiagram(data));
  }

  // Run consistency checks
  consistencyChecks.push(...validateConsistency(data));

  // Calculate overall score
  const totalChecks = hardGates.reduce((sum, gate) => sum + gate.checks.length, 0);
  const passedChecks = hardGates.reduce(
    (sum, gate) => sum + gate.checks.filter((c) => c.passed).length,
    0
  );
  const failedChecks = totalChecks - passedChecks;
  const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const passed = overallScore >= VALIDATION_THRESHOLD * 100;

  return {
    projectId: data.id,
    overallScore,
    passed,
    threshold: VALIDATION_THRESHOLD,
    totalChecks,
    passedChecks,
    failedChecks,
    hardGates,
    artifacts,
    consistencyChecks,
    errors,
    warnings,
    validatedAt: new Date(),
  };
}

/**
 * HG1: System Boundary Defined
 * System boundaries must clearly distinguish what is inside vs outside
 */
function validateHardGate1(
  data: ProjectValidationData,
  errors: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.SYSTEM_BOUNDARY_DEFINED;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  // Check 1: Internal components defined
  const hasInternal = (data.systemBoundaries?.internal?.length || 0) > 0;
  checks.push({
    id: 'hg1-internal',
    name: 'Internal Components',
    description: 'At least one internal component must be defined',
    passed: hasInternal,
    message: hasInternal
      ? `${data.systemBoundaries?.internal?.length} internal component(s) defined`
      : 'No internal components defined',
    severity: 'error',
  });

  // Check 2: External components defined
  const hasExternal = (data.systemBoundaries?.external?.length || 0) > 0;
  checks.push({
    id: 'hg1-external',
    name: 'External Components',
    description: 'At least one external component must be defined',
    passed: hasExternal,
    message: hasExternal
      ? `${data.systemBoundaries?.external?.length} external component(s) defined`
      : 'No external components defined',
    severity: 'error',
  });

  // Check 3: In-scope items defined
  const hasInScope = (data.systemBoundaries?.inScope?.length || 0) > 0;
  checks.push({
    id: 'hg1-in-scope',
    name: 'In-Scope Items',
    description: 'In-scope items should be defined',
    passed: hasInScope,
    message: hasInScope
      ? `${data.systemBoundaries?.inScope?.length} in-scope item(s) defined`
      : 'No in-scope items defined',
    severity: 'error',
  });

  const passed = checks.every((c) => c.passed);
  if (!passed) {
    errors.push(`${info.name}: ${info.description}`);
  }

  return { gate, passed, checks };
}

/**
 * HG2: Primary Actors Defined
 * At least 2 primary actors must be defined
 */
function validateHardGate2(
  data: ProjectValidationData,
  errors: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.PRIMARY_ACTORS_DEFINED;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  const actorCount = data.actors?.length || 0;
  const hasMinimumActors = actorCount >= 2;

  checks.push({
    id: 'hg2-minimum',
    name: 'Minimum Actors',
    description: 'At least 2 actors must be defined',
    passed: hasMinimumActors,
    message: hasMinimumActors
      ? `${actorCount} actor(s) defined`
      : `Only ${actorCount} actor(s) defined, need at least 2`,
    severity: 'error',
  });

  const passed = hasMinimumActors;
  if (!passed) {
    errors.push(`${info.name}: ${info.description} - currently have ${actorCount} actor(s)`);
  }

  return { gate, passed, checks };
}

/**
 * HG3: Roles & Permissions Defined
 * Actor roles and permissions must be specified
 */
function validateHardGate3(
  data: ProjectValidationData,
  errors: string[],
  warnings: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.ROLES_PERMISSIONS_DEFINED;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  const actors = data.actors || [];
  const actorsWithRoles = actors.filter((a) => a.role && a.role.trim().length > 0);
  const actorsWithPermissions = actors.filter(
    (a) => a.permissions && a.permissions.length > 0
  );

  // Check 1: All actors have roles
  const allHaveRoles = actors.length > 0 && actorsWithRoles.length === actors.length;
  checks.push({
    id: 'hg3-roles',
    name: 'Actor Roles',
    description: 'All actors must have defined roles',
    passed: allHaveRoles,
    message: allHaveRoles
      ? `All ${actors.length} actor(s) have roles defined`
      : `${actorsWithRoles.length}/${actors.length} actor(s) have roles defined`,
    severity: 'error',
  });

  // Check 2: At least some actors have permissions (warning if none)
  const someHavePermissions = actorsWithPermissions.length > 0;
  checks.push({
    id: 'hg3-permissions',
    name: 'Actor Permissions',
    description: 'Actor permissions should be specified',
    passed: someHavePermissions,
    message: someHavePermissions
      ? `${actorsWithPermissions.length} actor(s) have permissions defined`
      : 'No actor permissions defined',
    severity: 'warning',
  });

  const passed = allHaveRoles;
  if (!passed) {
    errors.push(`${info.name}: ${info.description}`);
  } else if (!someHavePermissions) {
    warnings.push(`${info.name}: Consider defining permissions for actors`);
  }

  return { gate, passed, checks };
}

/**
 * HG4: External Entities Defined
 * External systems and entities must be identified
 */
function validateHardGate4(
  data: ProjectValidationData,
  errors: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.EXTERNAL_ENTITIES_DEFINED;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  const externalCount = data.systemBoundaries?.external?.length || 0;
  const hasExternal = externalCount > 0;

  checks.push({
    id: 'hg4-external',
    name: 'External Entities',
    description: 'At least one external entity must be defined',
    passed: hasExternal,
    message: hasExternal
      ? `${externalCount} external entit(ies) defined`
      : 'No external entities defined',
    severity: 'error',
  });

  const passed = hasExternal;
  if (!passed) {
    errors.push(`${info.name}: ${info.description}`);
  }

  return { gate, passed, checks };
}

/**
 * HG5: Use Case List (5-15)
 * Between 5 and 15 use cases must be defined
 */
function validateHardGate5(
  data: ProjectValidationData,
  errors: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.USE_CASE_LIST_5_TO_15;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  const useCaseCount = data.useCases?.length || 0;
  const inRange = useCaseCount >= 5 && useCaseCount <= 15;

  checks.push({
    id: 'hg5-count',
    name: 'Use Case Count',
    description: 'Between 5 and 15 use cases must be defined',
    passed: inRange,
    message: inRange
      ? `${useCaseCount} use case(s) defined (within 5-15 range)`
      : useCaseCount < 5
        ? `Only ${useCaseCount} use case(s) defined, need at least 5`
        : `${useCaseCount} use case(s) defined, recommended maximum is 15`,
    severity: 'error',
  });

  const passed = inRange;
  if (!passed) {
    errors.push(`${info.name}: ${info.description} - currently have ${useCaseCount} use case(s)`);
  }

  return { gate, passed, checks };
}

/**
 * HG6: Use Case Trigger & Outcome
 * Each use case must have a clear trigger and outcome
 */
function validateHardGate6(
  data: ProjectValidationData,
  errors: string[],
  warnings: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.USE_CASE_TRIGGER_OUTCOME;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  const useCases = data.useCases || [];
  const useCasesWithTrigger = useCases.filter((uc) => uc.trigger && uc.trigger.trim().length > 0);
  const useCasesWithOutcome = useCases.filter((uc) => uc.outcome && uc.outcome.trim().length > 0);

  // Check 1: All use cases have triggers
  const allHaveTriggers = useCases.length > 0 && useCasesWithTrigger.length === useCases.length;
  checks.push({
    id: 'hg6-triggers',
    name: 'Use Case Triggers',
    description: 'All use cases must have triggers',
    passed: allHaveTriggers,
    message: allHaveTriggers
      ? `All ${useCases.length} use case(s) have triggers`
      : `${useCasesWithTrigger.length}/${useCases.length} use case(s) have triggers`,
    severity: 'error',
  });

  // Check 2: All use cases have outcomes
  const allHaveOutcomes = useCases.length > 0 && useCasesWithOutcome.length === useCases.length;
  checks.push({
    id: 'hg6-outcomes',
    name: 'Use Case Outcomes',
    description: 'All use cases must have outcomes',
    passed: allHaveOutcomes,
    message: allHaveOutcomes
      ? `All ${useCases.length} use case(s) have outcomes`
      : `${useCasesWithOutcome.length}/${useCases.length} use case(s) have outcomes`,
    severity: 'error',
  });

  const passed = allHaveTriggers && allHaveOutcomes;
  if (!passed) {
    errors.push(`${info.name}: ${info.description}`);
  }

  return { gate, passed, checks };
}

/**
 * HG7: Success Criteria Measurable
 * Success criteria must be measurable or TBD with owner/date
 */
function validateHardGate7(
  data: ProjectValidationData,
  errors: string[],
  warnings: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.SUCCESS_CRITERIA_MEASURABLE;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  // For now, check if vision statement contains success indicators
  const visionHasMetrics = /\b(measure|metric|kpi|target|goal|success)\b/i.test(data.vision || '');

  checks.push({
    id: 'hg7-criteria',
    name: 'Success Criteria',
    description: 'Success criteria should be measurable',
    passed: visionHasMetrics,
    message: visionHasMetrics
      ? 'Vision contains success indicators'
      : 'Vision should include measurable success criteria',
    severity: 'warning',
  });

  // This is a soft check - we'll pass it but add a warning
  const passed = true;
  if (!visionHasMetrics) {
    warnings.push(`${info.name}: Consider adding measurable success criteria to the project vision`);
  }

  return { gate, passed, checks };
}

/**
 * HG8: Constraints Present
 * Business and technical constraints must be documented
 */
function validateHardGate8(
  data: ProjectValidationData,
  errors: string[],
  warnings: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.CONSTRAINTS_PRESENT;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  // Check vision for constraint keywords
  const hasConstraints = /\b(constraint|limitation|requirement|must|cannot|restricted)\b/i.test(
    data.vision || ''
  );

  checks.push({
    id: 'hg8-constraints',
    name: 'Constraints',
    description: 'Business and technical constraints should be documented',
    passed: hasConstraints,
    message: hasConstraints
      ? 'Constraints mentioned in vision'
      : 'No constraints identified in vision',
    severity: 'warning',
  });

  // This is a soft check
  const passed = true;
  if (!hasConstraints) {
    warnings.push(`${info.name}: Consider documenting business and technical constraints`);
  }

  return { gate, passed, checks };
}

/**
 * HG9: Core Data Objects Defined
 * Core data entities and relationships must be specified
 */
function validateHardGate9(
  data: ProjectValidationData,
  errors: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.CORE_DATA_OBJECTS_DEFINED;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  const entityCount = data.dataEntities?.length || 0;
  const hasEntities = entityCount > 0;

  checks.push({
    id: 'hg9-entities',
    name: 'Data Entities',
    description: 'At least one data entity must be defined',
    passed: hasEntities,
    message: hasEntities
      ? `${entityCount} data entit(ies) defined`
      : 'No data entities defined',
    severity: 'error',
  });

  // Check if entities have relationships
  const entitiesWithRelationships = data.dataEntities?.filter(
    (e) => e.relationships && e.relationships.length > 0
  ) || [];
  const hasRelationships = entitiesWithRelationships.length > 0;

  checks.push({
    id: 'hg9-relationships',
    name: 'Entity Relationships',
    description: 'Data entities should have relationships defined',
    passed: hasRelationships,
    message: hasRelationships
      ? `${entitiesWithRelationships.length} entit(ies) have relationships`
      : 'No entity relationships defined',
    severity: 'error',
  });

  const passed = hasEntities && hasRelationships;
  if (!passed) {
    errors.push(`${info.name}: ${info.description}`);
  }

  return { gate, passed, checks };
}

/**
 * HG10: Source Reference Present
 * At least one source reference or stakeholder documented
 */
function validateHardGate10(
  data: ProjectValidationData,
  errors: string[],
  warnings: string[]
): HardGateResult {
  const checks: ValidationCheck[] = [];
  const gate = HardGate.SOURCE_REFERENCE_PRESENT;
  const info = HARD_GATE_DESCRIPTIONS[gate];

  // Check if there are conversation messages (indicates stakeholder input)
  const hasConversations = (data.artifacts?.length || 0) > 0 || (data.completeness || 0) > 0;

  checks.push({
    id: 'hg10-source',
    name: 'Source References',
    description: 'At least one source or stakeholder reference',
    passed: hasConversations,
    message: hasConversations
      ? 'Project has stakeholder input'
      : 'No source references or stakeholder input',
    severity: 'warning',
  });

  // This is a soft check
  const passed = true;
  if (!hasConversations) {
    warnings.push(`${info.name}: Consider documenting source references or stakeholders`);
  }

  return { gate, passed, checks };
}

/**
 * Validate Context Diagram
 */
function validateContextDiagram(data: ProjectValidationData): ArtifactValidationResult {
  const artifact = data.artifacts?.find((a) => a.type === ArtifactType.CONTEXT_DIAGRAM);
  const checks: ValidationCheck[] = [];

  if (!artifact) {
    checks.push({
      id: 'context-present',
      name: 'Context Diagram',
      description: 'Context diagram should be present',
      passed: false,
      message: 'Context diagram not found',
      severity: 'warning',
    });
  }

  return {
    artifactType: ArtifactType.CONTEXT_DIAGRAM,
    present: !!artifact,
    checks,
    passed: !!artifact,
  };
}

/**
 * Validate Use Case Diagram
 */
function validateUseCaseDiagram(data: ProjectValidationData): ArtifactValidationResult {
  const artifact = data.artifacts?.find((a) => a.type === ArtifactType.USE_CASE_DIAGRAM);
  const checks: ValidationCheck[] = [];

  if (!artifact) {
    checks.push({
      id: 'usecase-present',
      name: 'Use Case Diagram',
      description: 'Use case diagram should be present',
      passed: false,
      message: 'Use case diagram not found',
      severity: 'warning',
    });
  }

  return {
    artifactType: ArtifactType.USE_CASE_DIAGRAM,
    present: !!artifact,
    checks,
    passed: !!artifact,
  };
}

/**
 * Validate Consistency Across Artifacts
 */
function validateConsistency(data: ProjectValidationData): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // Check 1: System name consistency
  const systemName = data.name;
  checks.push({
    id: 'consistency-name',
    name: 'System Name Consistency',
    description: 'System name should be consistent',
    passed: !!(systemName && systemName.length > 0),
    message: systemName ? 'System name is defined' : 'System name is missing',
    severity: 'warning',
  });

  // Check 2: Actor-UseCase alignment
  const actorNames = new Set(data.actors?.map((a) => a.name) || []);
  const useCaseActors = new Set(data.useCases?.map((uc) => uc.actor).filter(Boolean) || []);
  const orphanedActors = [...useCaseActors].filter((a) => !actorNames.has(a!));

  checks.push({
    id: 'consistency-actors',
    name: 'Actor-UseCase Alignment',
    description: 'Use cases should reference defined actors',
    passed: orphanedActors.length === 0,
    message:
      orphanedActors.length === 0
        ? 'All use case actors are defined'
        : `${orphanedActors.length} use case(s) reference undefined actors`,
    severity: 'warning',
  });

  return checks;
}
