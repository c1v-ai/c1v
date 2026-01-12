'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import type { ValidationResult } from '@/lib/validation/types';

interface ValidationReportProps {
  projectId: number;
  projectName: string;
  initialValidationScore?: number;
}

export function ValidationReport({
  projectId,
  projectName,
  initialValidationScore = 0,
}: ValidationReportProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Validation failed');
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);

      if (result.passed) {
        toast.success('Validation Passed!', {
          description: `Project meets ${result.threshold * 100}% compliance threshold`,
        });
      } else {
        toast.warning('Validation Incomplete', {
          description: `Score: ${result.overallScore}% (need ${result.threshold * 100}%)`,
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation Error', {
        description: error instanceof Error ? error.message : 'Failed to run validation',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
                SR-CORNELL Validation
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
                Validate project against SR-CORNELL-PRD-95-V1 specification
              </CardDescription>
            </div>
            <Button
              onClick={handleRunValidation}
              disabled={isValidating}
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                    {validationResult.overallScore}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {validationResult.passedChecks} of {validationResult.totalChecks} checks passed
                  </div>
                </div>
                <Badge
                  className={
                    validationResult.passed
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }
                >
                  {validationResult.passed ? 'PASSED' : 'INCOMPLETE'}
                </Badge>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${validationResult.overallScore}%`,
                    backgroundColor: validationResult.passed ? '#10b981' : '#f59e0b',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hard Gates */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
                Hard Gates (10 Required)
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
                Mandatory validation checks from SR-CORNELL specification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResult.hardGates.map((gate) => (
                  <div
                    key={gate.gate}
                    className="rounded-lg border p-4"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {gate.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <div className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                            {gate.gate.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="mt-2 space-y-2">
                            {gate.checks.map((check) => (
                              <div
                                key={check.id}
                                className="flex items-start gap-2 text-sm"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {check.passed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                ) : check.severity === 'error' ? (
                                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                )}
                                <span>{check.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-red-600"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Errors ({validationResult.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-600"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-yellow-600"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Warnings ({validationResult.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {validationResult.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-sm text-yellow-600"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Artifacts */}
          {validationResult.artifacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
                  Artifacts
                </CardTitle>
                <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
                  Diagram and document validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResult.artifacts.map((artifact) => (
                    <div
                      key={artifact.artifactType}
                      className="flex items-center justify-between rounded-lg border p-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span
                        className="text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {artifact.artifactType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {artifact.present ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Initial state - no validation run yet */}
      {!validationResult && initialValidationScore === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <p
                className="text-lg mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                No validation results yet
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Click "Run Validation" to validate this project against SR-CORNELL-PRD-95-V1
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
