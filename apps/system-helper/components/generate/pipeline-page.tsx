'use client';

import { useState, useCallback } from 'react';
import { PipelineCard, type PipelineStage, type PipelineStageStatus, type ReviewStatus } from './pipeline-card';
import { Sparkles } from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface PipelinePageProps {
  projectId: number;
  /** Which PRD artifacts have been generated */
  generatedArtifacts: string[];
  /** Overall PRD completeness 0-100 */
  completeness: number;
  /** Which tech-gen artifacts exist */
  existingGenerations: {
    techStack: boolean;
    guidelines: boolean;
    infrastructure: boolean;
    stories: boolean;
    apiSpec: boolean;
  };
  /** Initial review status per section */
  initialReviewStatus?: Record<string, ReviewStatus>;
}

// ============================================================
// Stage Definitions
// ============================================================

function buildStages(
  generatedArtifacts: string[],
  completeness: number,
  existingGenerations: PipelinePageProps['existingGenerations']
): PipelineStage[] {
  const prdReady = completeness >= 30;

  // Core PRD artifacts (generated via chat intake)
  const coreArtifacts: PipelineStage[] = [
    {
      id: 'context_diagram',
      name: 'Context Diagram',
      description: 'System boundary with actors and external entities',
      status: getArtifactStatus('context_diagram', generatedArtifacts),
      apiEndpoint: '',
      dependsOn: [],
    },
    {
      id: 'use_case_diagram',
      name: 'Use Case Diagram',
      description: 'Actors linked to use case scenarios',
      status: getArtifactStatus('use_case_diagram', generatedArtifacts),
      apiEndpoint: '',
      dependsOn: ['context_diagram'],
    },
    {
      id: 'scope_tree',
      name: 'Scope Tree',
      description: 'In-scope and out-of-scope deliverables',
      status: getArtifactStatus('scope_tree', generatedArtifacts),
      apiEndpoint: '',
      dependsOn: ['use_case_diagram'],
    },
    {
      id: 'ucbd',
      name: 'UCBD',
      description: 'Use case behavior with pre/postconditions and steps',
      status: getArtifactStatus('ucbd', generatedArtifacts),
      apiEndpoint: '',
      dependsOn: ['scope_tree'],
    },
    {
      id: 'requirements_table',
      name: 'Requirements Table',
      description: 'Testable requirements derived from use cases',
      status: getArtifactStatus('requirements_table', generatedArtifacts),
      apiEndpoint: '',
      dependsOn: ['ucbd'],
    },
    {
      id: 'sysml_activity_diagram',
      name: 'SysML Activity Diagram',
      description: 'Activity flow with decision points and parallel paths',
      status: getArtifactStatus('sysml_activity_diagram', generatedArtifacts),
      apiEndpoint: '',
      dependsOn: ['requirements_table'],
    },
  ];

  // Technical generation stages (triggered by API routes)
  const techStages: PipelineStage[] = [
    {
      id: 'tech_stack',
      name: 'Tech Stack',
      description: 'Technology recommendations based on project requirements',
      status: getTechStatus(existingGenerations.techStack, prdReady),
      apiEndpoint: '/tech-stack',
      dependsOn: ['requirements_table'],
    },
    {
      id: 'guidelines',
      name: 'Coding Guidelines',
      description: 'Code style, patterns, and best practices for the project',
      status: getTechStatus(existingGenerations.guidelines, existingGenerations.techStack),
      apiEndpoint: '/guidelines',
      dependsOn: ['tech_stack'],
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Spec',
      description: 'Deployment, hosting, and infrastructure recommendations',
      status: getTechStatus(existingGenerations.infrastructure, existingGenerations.techStack),
      apiEndpoint: '/infrastructure',
      dependsOn: ['tech_stack'],
    },
    {
      id: 'stories',
      name: 'User Stories',
      description: 'Agile user stories with acceptance criteria',
      status: getTechStatus(existingGenerations.stories, prdReady),
      apiEndpoint: '/stories',
      dependsOn: ['requirements_table'],
    },
    {
      id: 'api_spec',
      name: 'API Specification',
      description: 'OpenAPI/REST endpoint definitions',
      status: getTechStatus(existingGenerations.apiSpec, existingGenerations.techStack),
      apiEndpoint: '/api-spec',
      dependsOn: ['tech_stack', 'stories'],
    },
  ];

  return [...coreArtifacts, ...techStages];
}

function getArtifactStatus(
  artifactId: string,
  generatedArtifacts: string[]
): PipelineStageStatus {
  if (generatedArtifacts.includes(artifactId)) return 'completed';
  return 'locked'; // Core artifacts are generated via chat, not manually
}

function getTechStatus(
  exists: boolean,
  prerequisiteMet: boolean
): PipelineStageStatus {
  if (exists) return 'completed';
  if (prerequisiteMet) return 'ready';
  return 'locked';
}

// ============================================================
// Component
// ============================================================

export function PipelinePage({
  projectId,
  generatedArtifacts,
  completeness,
  existingGenerations,
  initialReviewStatus,
}: PipelinePageProps) {
  const [stages, setStages] = useState<PipelineStage[]>(() => {
    const built = buildStages(generatedArtifacts, completeness, existingGenerations);
    // Apply initial review status to completed stages
    if (initialReviewStatus) {
      return built.map(s => {
        const rs = initialReviewStatus[s.id];
        return rs ? { ...s, reviewStatus: rs } : s;
      });
    }
    return built;
  });

  const updateStageStatus = useCallback((stageId: string, status: PipelineStageStatus) => {
    setStages(prev =>
      prev.map(s => (s.id === stageId ? { ...s, status } : s))
    );
  }, []);

  const handleGenerate = useCallback(async (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    updateStageStatus(stageId, 'in_progress');

    try {
      const endpoint = `/api/projects/${projectId}${stage.apiEndpoint}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      updateStageStatus(stageId, 'completed');

      // Set review status to awaiting-review after generation
      setStages(prev =>
        prev.map(s => (s.id === stageId ? { ...s, reviewStatus: 'awaiting-review' as ReviewStatus } : s))
      );
      // Persist review status
      fetch(`/api/projects/${projectId}/review-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKey: stageId, status: 'awaiting-review' }),
      }).catch(() => { /* non-critical */ });

      // Unlock dependent stages
      setStages(prev =>
        prev.map(s => {
          if (s.dependsOn.includes(stageId) && s.status === 'locked') {
            const allDepsCompleted = s.dependsOn.every(
              dep => dep === stageId || prev.find(p => p.id === dep)?.status === 'completed'
            );
            if (allDepsCompleted) {
              return { ...s, status: 'ready' as PipelineStageStatus };
            }
          }
          return s;
        })
      );
    } catch (error) {
      updateStageStatus(stageId, 'error');
      throw error;
    }
  }, [stages, projectId, updateStageStatus]);

  const handleRegenerate = useCallback(async (stageId: string) => {
    await handleGenerate(stageId);
  }, [handleGenerate]);

  const handleReviewStatusChange = useCallback((stageId: string, status: ReviewStatus) => {
    setStages(prev =>
      prev.map(s => (s.id === stageId ? { ...s, reviewStatus: status } : s))
    );
    fetch(`/api/projects/${projectId}/review-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionKey: stageId, status }),
    }).catch(() => { /* non-critical */ });
  }, [projectId]);

  // Split into sections
  const coreStages = stages.filter(s =>
    ['context_diagram', 'use_case_diagram', 'scope_tree', 'ucbd', 'requirements_table', 'sysml_activity_diagram'].includes(s.id)
  );
  const techStages = stages.filter(s =>
    ['tech_stack', 'guidelines', 'infrastructure', 'stories', 'api_spec'].includes(s.id)
  );

  const coreCompleted = coreStages.filter(s => s.status === 'completed').length;
  const techCompleted = techStages.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <h1
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Generation Pipeline
          </h1>
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Generate artifacts step by step. Core PRD artifacts are created through the chat intake. Technical artifacts can be triggered here.
        </p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          <span>Overall Progress</span>
          <span>{coreCompleted + techCompleted} / {coreStages.length + techStages.length} stages</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((coreCompleted + techCompleted) / (coreStages.length + techStages.length)) * 100}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Core PRD Artifacts */}
      <section>
        <h2
          className="text-sm font-medium mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Core PRD Artifacts ({coreCompleted}/{coreStages.length})
        </h2>
        <p
          className="text-xs mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Generated through the chat-based intake flow. Use the chat panel to generate these.
        </p>
        <div className="grid gap-3">
          {coreStages.map(stage => (
            <PipelineCard
              key={stage.id}
              stage={stage}
              projectId={projectId}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
              onReviewStatusChange={handleReviewStatusChange}
            />
          ))}
        </div>
      </section>

      {/* Technical Artifacts */}
      <section>
        <h2
          className="text-sm font-medium mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Technical Artifacts ({techCompleted}/{techStages.length})
        </h2>
        <p
          className="text-xs mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          AI-generated technical specifications based on your PRD data. Each uses AI tokens.
        </p>
        <div className="grid gap-3">
          {techStages.map(stage => (
            <PipelineCard
              key={stage.id}
              stage={stage}
              projectId={projectId}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
              onReviewStatusChange={handleReviewStatusChange}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
