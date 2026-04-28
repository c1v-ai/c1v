/**
 * Uniform I/O contracts for artifact generators.
 * Source of truth: plans/c1v-MIT-Crawley-Cornell.v2.md §15.3.
 *
 * Every generator under scripts/artifact-generators/ accepts an
 * ArtifactGeneratorInput (as JSON file path via argv[1]) and emits an
 * ArtifactGeneratorOutput on stdout, plus one append to the run's
 * artifacts.manifest.jsonl.
 */

export type GeneratorName =
  | 'gen-ffbd'
  | 'gen-qfd'
  | 'gen-n2'
  | 'gen-sequence'
  | 'gen-dfd'
  | 'gen-interfaces'
  | 'gen-fmea'
  | 'gen-ucbd'
  | 'gen-decision-net'
  | 'gen-form-function'
  | 'gen-cost-curves'
  | 'gen-latency-chain'
  | 'gen-arch-recommendation';

export type ArtifactTarget =
  | 'xlsx'
  | 'pptx'
  | 'mmd'
  | 'svg'
  | 'pdf'
  | 'html'
  | 'json-enriched';

export type ArtifactGeneratorInput = {
  generator: GeneratorName;
  /** e.g. "Requirements-table.schema.json" — relative to schemas/generated */
  schemaRef: string;
  /** e.g. "v1" */
  schemaVersion: string;
  /** schema-valid instance (agent must validate before invoke) */
  instanceJson: unknown;
  /** e.g. ".planning/runs/self-application/module-2/" — resolved absolute before spawn */
  outputDir: string;
  targets: ArtifactTarget[];
  options?: {
    title?: string;
    branding?: { logo?: string; theme?: 'light' | 'dark' };
    figureNumbering?: boolean;
    /** gen-interfaces: 'informal-n2' (N2 matrix) | 'formal-specs' (detailed spec rows) */
    variant?: 'informal-n2' | 'formal-specs';
    /** optional instance filename for manifest attribution */
    instanceName?: string;
  };
};

export type GeneratedArtifact = {
  target: string;
  path: string;
  bytes: number;
  sha256: string;
};

export type ArtifactGeneratorOutput =
  | {
      ok: true;
      generated: GeneratedArtifact[];
      warnings: string[];
      elapsedMs: number;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        phase: 'validate' | 'render' | 'write';
        stack?: string;
      };
      partial: Array<{ target: string; path: string }>;
    };

/** Manifest line appended to artifacts.manifest.jsonl. */
export type ManifestEntry = {
  timestamp: string;
  generator: GeneratorName;
  instance: string;
  outputs: Array<{ target: string; path: string; sha256: string; bytes: number }>;
  ok: boolean;
  elapsedMs: number;
  error?: { code: string; message: string; phase: 'validate' | 'render' | 'write' };
};
