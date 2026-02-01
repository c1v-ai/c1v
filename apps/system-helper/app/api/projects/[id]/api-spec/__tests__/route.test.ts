/**
 * API Specification Route Tests (Phase 10.1)
 *
 * Tests for GET and POST endpoints of the API specification route.
 * Uses mocking for database and agent calls.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { APISpecification } from '@/lib/types/api-specification';

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
  },
}));

jest.mock('@/lib/langchain/agents/api-spec-agent', () => ({
  generateAPISpecification: jest.fn(),
  validateAPISpecification: jest.fn(() => ({ valid: true, errors: [] })),
}));

jest.mock('@/lib/langchain/agents/api-spec-openapi-export', () => ({
  convertToOpenAPI: jest.fn((spec: APISpecification) => ({
    openapi: '3.0.3',
    info: { title: 'Test API', version: spec.version },
    paths: {},
    components: {},
  })),
  exportToOpenAPIYAML: jest.fn(() => 'openapi: "3.0.3"\ninfo:\n  title: Test API'),
}));

// Import route handlers and mocked modules
import { GET, POST } from '../route';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { generateAPISpecification, validateAPISpecification } from '@/lib/langchain/agents/api-spec-agent';

// Helper to create mock request
function createMockRequest(url: string, method: string = 'GET'): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), { method });
}

// Sample API specification for testing
const mockAPISpec: APISpecification = {
  baseUrl: '/api/v1',
  version: '1.0.0',
  authentication: {
    type: 'bearer',
    description: 'JWT Bearer token',
    headerName: 'Authorization',
    tokenPrefix: 'Bearer',
  },
  endpoints: [
    {
      path: '/users',
      method: 'GET',
      description: 'List all users',
      authentication: true,
      operationId: 'listUsers',
      tags: ['Users'],
      responseBody: { type: 'array' },
      errorCodes: [
        { code: 401, name: 'Unauthorized', description: 'Not authenticated' },
      ],
    },
  ],
  responseFormat: {
    wrapped: true,
    contentType: 'application/json',
  },
  errorHandling: {
    format: { type: 'object' },
    commonErrors: [],
  },
  metadata: {
    generatedAt: '2026-01-25T00:00:00.000Z',
    endpointCount: 1,
    useCasesCovered: ['UC1'],
    entitiesReferenced: ['User'],
  },
};

// Mock project data
const mockProject = {
  id: 1,
  name: 'Test Project',
  vision: 'A test project vision',
  teamId: 1,
  projectData: {
    projectId: 1,
    useCases: [
      {
        id: 'UC1',
        name: 'List Users',
        description: 'View list of users',
        actor: 'Admin',
      },
    ],
    dataEntities: [
      {
        name: 'User',
        attributes: ['id', 'email', 'name'],
        relationships: [],
      },
    ],
    techStack: {
      backend: 'Next.js',
      database: 'PostgreSQL',
      auth: 'JWT',
    },
    apiSpecification: null,
  },
};

// Type mocks
const mockedGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockedGetTeamForUser = getTeamForUser as jest.MockedFunction<typeof getTeamForUser>;
const mockedFindFirst = db.query.projects.findFirst as jest.MockedFunction<typeof db.query.projects.findFirst>;
const mockedDbUpdate = db.update as jest.MockedFunction<typeof db.update>;
const mockedGenerateAPISpec = generateAPISpecification as jest.MockedFunction<typeof generateAPISpecification>;
const mockedValidateAPISpec = validateAPISpecification as jest.MockedFunction<typeof validateAPISpecification>;

describe('API Specification Route', () => {
  const mockParams = Promise.resolve({ id: '1' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUser.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);
    mockedGetTeamForUser.mockResolvedValue({ id: 1, name: 'Test Team' } as any);
  });

  describe('GET /api/projects/[id]/api-spec', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockedGetUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/api-spec');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if team is not found', async () => {
      mockedGetTeamForUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/api-spec');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Team not found');
    });

    it('should return 400 for invalid project ID', async () => {
      const request = createMockRequest('/api/projects/abc/api-spec');
      const response = await GET(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid project ID');
    });

    it('should return 404 if project is not found', async () => {
      mockedFindFirst.mockResolvedValue(undefined);

      const request = createMockRequest('/api/projects/1/api-spec');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });

    it('should return 404 if no API spec exists', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, apiSpecification: null },
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('No API specification found');
    });

    it('should return existing API spec in JSON format', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, apiSpecification: mockAPISpec },
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projectId).toBe(1);
      expect(data.apiSpecification).toEqual(mockAPISpec);
      expect(data.format).toBe('json');
    });

    it('should return OpenAPI JSON format when requested', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, apiSpecification: mockAPISpec },
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec?format=openapi');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.openapi).toBe('3.0.3');
    });

    it('should return OpenAPI YAML format when requested', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, apiSpecification: mockAPISpec },
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec?format=openapi-yaml');
      const response = await GET(request, { params: mockParams });
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/x-yaml');
      expect(text).toContain('openapi:');
    });
  });

  describe('POST /api/projects/[id]/api-spec', () => {
    beforeEach(() => {
      mockedGenerateAPISpec.mockResolvedValue(mockAPISpec);
      mockedValidateAPISpec.mockReturnValue({ valid: true, errors: [] });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockedGetUser.mockResolvedValue(null as any);

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if no project data exists', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: null,
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No project data available');
    });

    it('should return 400 if no use cases exist', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, useCases: [] },
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No use cases available');
    });

    it('should return 400 if no data entities exist', async () => {
      mockedFindFirst.mockResolvedValue({
        ...mockProject,
        projectData: { ...mockProject.projectData, dataEntities: [] },
      } as any);

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No data entities available');
    });

    it('should generate and save new API specification', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
      expect(data.projectId).toBe(1);
      expect(data.apiSpecification).toBeDefined();
      expect(mockedGenerateAPISpec).toHaveBeenCalledWith({
        projectName: mockProject.name,
        projectVision: mockProject.vision,
        useCases: mockProject.projectData.useCases,
        dataEntities: mockProject.projectData.dataEntities,
        techStack: mockProject.projectData.techStack,
      });
    });

    it('should return OpenAPI format when format=openapi', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/api-spec?format=openapi', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
      expect(data.openapi).toBeDefined();
      expect(data.openapi.openapi).toBe('3.0.3');
    });

    it('should return YAML format when format=openapi-yaml', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);

      const request = createMockRequest('/api/projects/1/api-spec?format=openapi-yaml', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
      expect(data.format).toBe('yaml');
      expect(data.openapi).toContain('openapi:');
    });

    it('should include validation errors in response if any', async () => {
      mockedFindFirst.mockResolvedValue(mockProject as any);
      mockedValidateAPISpec.mockReturnValue({
        valid: false,
        errors: ['No endpoints defined'],
      });

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
      expect(data.validationErrors).toContain('No endpoints defined');
    });

    it('should update existing API specification', async () => {
      const projectWithExistingSpec = {
        ...mockProject,
        projectData: {
          ...mockProject.projectData,
          apiSpecification: { ...mockAPISpec, version: '0.9.0' },
        },
      };
      mockedFindFirst.mockResolvedValue(projectWithExistingSpec as any);

      const request = createMockRequest('/api/projects/1/api-spec', 'POST');
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.generated).toBe(true);
      // Should have called db.update to save the new spec
      expect(mockedDbUpdate).toHaveBeenCalled();
    });
  });
});
