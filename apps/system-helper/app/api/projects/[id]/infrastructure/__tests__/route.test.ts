/**
 * Infrastructure Specification Route Tests (Phase 10.2)
 *
 * Tests for GET and POST endpoints of the infrastructure specification route.
 * Uses mocking for database and agent calls.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { InfrastructureSpec, TechStackModel } from '@/lib/db/schema/v2-types';

// Mock modules before importing route handlers
jest.mock('@/lib/db/queries', () => ({
  getUser: jest.fn(),
  getTeamForUser: jest.fn(),
}));

jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: {
      projects: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/langchain/agents/infrastructure-agent', () => ({
  generateInfrastructureSpec: jest.fn(),
  validateInfrastructureSpec: jest.fn((spec) => spec),
}));

// Import route handlers and mocked modules
import { GET, POST } from '../route';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { generateInfrastructureSpec, validateInfrastructureSpec } from '@/lib/langchain/agents/infrastructure-agent';

// Helper to create mock request
function createMockRequest(url: string, method: string = 'GET', body?: object): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

// Sample infrastructure spec for testing
const mockInfrastructureSpec: InfrastructureSpec = {
  hosting: {
    provider: 'vercel',
    region: 'us-east-1',
    tier: 'pro',
    autoscaling: {
      enabled: true,
      minInstances: 1,
      maxInstances: 10,
      targetCpuUtilization: 70,
    },
    domains: ['example.com', 'www.example.com'],
  },
  database: {
    provider: 'supabase',
    type: 'postgresql',
    version: '16',
    tier: 'pro',
    region: 'us-east-1',
    connectionPooling: {
      enabled: true,
      maxConnections: 100,
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: '30 days',
    },
    replication: {
      enabled: false,
      readReplicas: 0,
    },
  },
  caching: {
    provider: 'upstash',
    strategy: 'cache-aside',
    ttlSeconds: 3600,
    maxMemoryMb: 256,
  },
  cicd: {
    provider: 'github-actions',
    branches: {
      production: 'main',
      staging: 'staging',
      development: 'develop',
    },
    triggers: ['push', 'pull_request'],
    steps: [
      { name: 'Install', type: 'build', command: 'npm ci', required: true },
      { name: 'Test', type: 'test', command: 'npm test', required: true },
    ],
    environments: [
      { name: 'production', url: 'https://example.com', requiredApprovals: 1 },
    ],
  },
  monitoring: {
    provider: 'sentry',
    logging: {
      level: 'info',
      structured: true,
      retention: '30 days',
    },
    metrics: {
      enabled: true,
      customMetrics: ['api_latency'],
    },
    tracing: {
      enabled: true,
      sampleRate: 0.1,
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack'],
    },
  },
  security: {
    ssl: { enabled: true, provider: 'letsencrypt' },
    waf: { enabled: false },
    ddosProtection: { enabled: true, provider: 'cloudflare' },
    secrets: { manager: 'vercel' },
    cors: {
      allowedOrigins: ['https://example.com'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowCredentials: true,
    },
    rateLimit: {
      enabled: true,
      requestsPerMinute: 100,
    },
  },
  estimatedMonthlyCost: '$50-200/month',
  scalabilityNotes: 'Handles auto-scaling automatically.',
  generatedAt: '2026-01-25T00:00:00.000Z',
};

// Mock tech stack
const mockTechStack: TechStackModel = {
  categories: [
    { category: 'frontend', choice: 'Next.js', rationale: 'SSR support', alternatives: [] },
    { category: 'database', choice: 'PostgreSQL', rationale: 'Reliable', alternatives: [] },
  ],
  constraints: [],
  rationale: 'Modern stack',
};

// Mock project data
const mockProject = {
  id: 1,
  name: 'Test Project',
  vision: 'A test project vision',
  teamId: 1,
  projectData: {
    projectId: 1,
    techStack: mockTechStack,
    infrastructureSpec: null,
    completeness: 50,
  },
};

// Type mocks
const mockedGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockedGetTeamForUser = getTeamForUser as jest.MockedFunction<typeof getTeamForUser>;
const mockedFindFirst = db.query.projects.findFirst as jest.MockedFunction<typeof db.query.projects.findFirst>;
const mockedDbUpdate = db.update as jest.MockedFunction<typeof db.update>;
const mockedDbInsert = db.insert as jest.MockedFunction<typeof db.insert>;
const mockedGenerateInfrastructureSpec = generateInfrastructureSpec as jest.MockedFunction<typeof generateInfrastructureSpec>;
const mockedValidateInfrastructureSpec = validateInfrastructureSpec as jest.MockedFunction<typeof validateInfrastructureSpec>;

describe('Infrastructure Specification Route', () => {
  const mockParams = Promise.resolve({ id: '1' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUser.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);
    mockedGetTeamForUser.mockResolvedValue({ id: 1, name: 'Test Team' } as any);
  });

  describe('GET /api/projects/[id]/infrastructure', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockedGetUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/infrastructure');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if team is not found', async () => {
      mockedGetTeamForUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/infrastructure');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Team not found');
    });

    it('should return 400 for invalid project ID', async () => {
      const request = createMockRequest('/api/projects/abc/infrastructure');
      const response = await GET(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid project ID');
    });

    it('should return 404 if project is not found', async () => {
      mockedFindFirst.mockResolvedValue(undefined);

      const request = createMockRequest('/api/projects/1/infrastructure');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });

    it('should return null infrastructure spec when none exists', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, infrastructureSpec: null },
      } as any);

      const request = createMockRequest('/api/projects/1/infrastructure');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projectId).toBe(1);
      expect(data.infrastructureSpec).toBeNull();
      expect(data.hasSpecification).toBe(false);
    });

    it('should return existing infrastructure spec', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, infrastructureSpec: mockInfrastructureSpec },
      } as any);

      const request = createMockRequest('/api/projects/1/infrastructure');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projectId).toBe(1);
      expect(data.infrastructureSpec).toEqual(mockInfrastructureSpec);
      expect(data.hasSpecification).toBe(true);
    });
  });

  describe('POST /api/projects/[id]/infrastructure', () => {
    beforeEach(() => {
      mockedGenerateInfrastructureSpec.mockResolvedValue(mockInfrastructureSpec);
      mockedValidateInfrastructureSpec.mockReturnValue(mockInfrastructureSpec);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockedGetUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if team is not found', async () => {
      mockedGetTeamForUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Team not found');
    });

    it('should return 400 for invalid project ID', async () => {
      const request = createMockRequest('/api/projects/abc/infrastructure', 'POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid project ID');
    });

    it('should return 404 if project is not found', async () => {
      mockedFindFirst.mockResolvedValue(undefined);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });

    it('should generate and save new infrastructure specification', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
      expect(data.projectId).toBe(1);
      expect(data.infrastructureSpec).toBeDefined();
      expect(mockedGenerateInfrastructureSpec).toHaveBeenCalledWith({
        projectName: mockProject.name,
        projectDescription: mockProject.vision,
        techStack: mockTechStack,
        scaleRequirements: undefined,
        complianceRequirements: [],
        budgetConstraints: undefined,
      });
    });

    it('should pass scale requirements to the agent', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const scaleRequirements = {
        expectedUsers: 10000,
        peakConcurrentUsers: 1000,
        dataVolumeGb: 100,
        requestsPerSecond: 500,
        globalDistribution: true,
      };

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST', {
        scaleRequirements,
      });
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockedGenerateInfrastructureSpec).toHaveBeenCalledWith(
        expect.objectContaining({
          scaleRequirements,
        })
      );
    });

    it('should pass compliance requirements to the agent', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST', {
        complianceRequirements: ['GDPR', 'SOC2', 'HIPAA'],
      });
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockedGenerateInfrastructureSpec).toHaveBeenCalledWith(
        expect.objectContaining({
          complianceRequirements: ['GDPR', 'SOC2', 'HIPAA'],
        })
      );
    });

    it('should pass budget constraints to the agent', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST', {
        budgetConstraints: '$500/month maximum',
      });
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockedGenerateInfrastructureSpec).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetConstraints: '$500/month maximum',
        })
      );
    });

    it('should handle empty request body gracefully', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
    });

    it('should update existing project_data when present', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(200);
      expect(mockedDbUpdate).toHaveBeenCalled();
    });

    it('should create project_data when not present', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: null,
      } as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(200);
      expect(mockedDbInsert).toHaveBeenCalled();
    });

    it('should return 500 if validation fails', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);
      mockedValidateInfrastructureSpec.mockReturnValue(null);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to generate valid infrastructure specification');
    });

    it('should handle invalid scale requirements fields', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST', {
        scaleRequirements: {
          expectedUsers: 'not-a-number', // Invalid type
          invalidField: 'should be ignored',
        },
      });
      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(200);
      // Invalid types should be filtered out
      expect(mockedGenerateInfrastructureSpec).toHaveBeenCalledWith(
        expect.objectContaining({
          scaleRequirements: expect.objectContaining({
            expectedUsers: undefined,
          }),
        })
      );
    });

    it('should filter non-string compliance requirements', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/infrastructure', 'POST', {
        complianceRequirements: ['GDPR', 123, null, 'SOC2'],
      });
      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(200);
      expect(mockedGenerateInfrastructureSpec).toHaveBeenCalledWith(
        expect.objectContaining({
          complianceRequirements: ['GDPR', 'SOC2'],
        })
      );
    });
  });
});
