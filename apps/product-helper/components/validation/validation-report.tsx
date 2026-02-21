'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
              <CardTitle>
                PRD-SPEC Validation
              </CardTitle>
              <CardDescription>
                Validate project against PRD-SPEC-PRD-95-V1 specification
              </CardDescription>
            </div>
            <Button
              onClick={handleRunValidation}
              disabled={isValidating}
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
              <CardTitle>
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-foreground">
                    {validationResult.overallScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
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
              <div className="mt-4 h-2 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    validationResult.passed ? 'bg-green-500' : 'bg-yellow-500'
                  )}
                  style={{ width: `${validationResult.overallScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hard Gates */}
          <Card>
            <CardHeader>
              <CardTitle>
                Hard Gates (10 Required)
              </CardTitle>
              <CardDescription>
                Mandatory validation checks from PRD-SPEC specification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResult.hardGates.map((gate) => (
                  <div
                    key={gate.gate}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {gate.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {gate.gate.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="mt-2 space-y-2">
                            {gate.checks.map((check) => (
                              <div
                                key={check.id}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
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
                <CardTitle className="text-red-600">
                  Errors ({validationResult.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-600"
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
                <CardTitle className="text-yellow-600">
                  Warnings ({validationResult.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {validationResult.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-sm text-yellow-600"
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
                <CardTitle>
                  Artifacts
                </CardTitle>
                <CardDescription>
                  Diagram and document validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResult.artifacts.map((artifact) => (
                    <div
                      key={artifact.artifactType}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <span className="text-sm text-foreground">
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
              <p className="text-lg mb-2 text-foreground">
                No validation results yet
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Run Validation" to validate this project against PRD-SPEC-PRD-95-V1
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
