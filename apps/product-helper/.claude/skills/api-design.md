# API Design Patterns

Best practices for designing and implementing API routes in the product-helper codebase using Next.js App Router.

## Route Handler Structure

### Basic Route Handler
```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, session.user.id),
    });

    return NextResponse.json(userProjects);
  } catch (error) {
    console.error('[GET /api/projects]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Handler
```typescript
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, id),
      eq(projects.userId, session.user.id)
    ),
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}
```

## Request Validation

### Using Zod for Validation
```typescript
// lib/validators/project.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

### Validating Request Body
```typescript
// app/api/projects/route.ts
import { createProjectSchema } from '@/lib/validators/project';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const project = await createProject({
      ...result.data,
      userId: session.user.id,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('[POST /api/projects]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Validating Query Parameters
```typescript
// app/api/projects/route.ts
import { z } from 'zod';

const querySchema = z.object({
  status: z.enum(['draft', 'active', 'completed']).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const result = querySchema.safeParse({
    status: searchParams.get('status'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { status, limit, offset } = result.data;
  // ... use validated params
}
```

## Error Handling

### Consistent Error Response Format
```typescript
// lib/api/errors.ts
export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export function createErrorResponse(
  message: string,
  status: number,
  options?: { code?: string; details?: unknown }
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      code: options?.code,
      details: options?.details,
    },
    { status }
  );
}

// Usage
return createErrorResponse('Project not found', 404, { code: 'PROJECT_NOT_FOUND' });
```

### Error Codes
```typescript
// lib/api/error-codes.ts
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### Try-Catch Pattern
```typescript
export async function POST(request: NextRequest) {
  try {
    // ... handler logic
  } catch (error) {
    // Log with context
    console.error('[POST /api/projects]', {
      error,
      userId: session?.user?.id,
      requestId: request.headers.get('x-request-id'),
    });

    // Return generic error to client
    return createErrorResponse('Internal server error', 500, {
      code: ErrorCodes.INTERNAL_ERROR,
    });
  }
}
```

## Authentication & Authorization

### Auth Middleware Pattern
```typescript
// lib/api/with-auth.ts
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Record<string, string>; session: Session }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context: { params: Record<string, string> }) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, { ...context, session });
  };
}

// Usage
export const GET = withAuth(async (request, { params, session }) => {
  // session.user is guaranteed to exist
  const projects = await getProjectsByUser(session.user.id);
  return NextResponse.json(projects);
});
```

### Resource Authorization
```typescript
// lib/api/authorize.ts
export async function authorizeProjectAccess(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.userId, userId)
    ),
  });
  return project;
}

// Usage in route handler
const project = await authorizeProjectAccess(params.id, session.user.id);
if (!project) {
  return createErrorResponse('Project not found', 404);
}
```

## Response Formatting

### Success Responses
```typescript
// Single resource
return NextResponse.json(project);

// Created resource
return NextResponse.json(project, { status: 201 });

// List with pagination
return NextResponse.json({
  data: projects,
  pagination: {
    total,
    limit,
    offset,
    hasMore: offset + projects.length < total,
  },
});

// No content (for DELETE)
return new NextResponse(null, { status: 204 });
```

### Filtering Sensitive Data
```typescript
// Never expose sensitive fields
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, params.id),
  });

  if (!user) {
    return createErrorResponse('User not found', 404);
  }

  // Exclude sensitive fields
  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}
```

## Rate Limiting

### Using Upstash Ratelimit
```typescript
// lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  return { success, limit, reset, remaining };
}
```

### Applying Rate Limits
```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 401);
  }

  // Rate limit by user ID
  const { success, reset } = await checkRateLimit(`chat:${session.user.id}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // ... handle request
}
```

## Streaming Responses

### Server-Sent Events
```typescript
// app/api/chat/stream/route.ts
export async function POST(request: NextRequest) {
  const { messages, projectId } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      for await (const chunk of generateResponse(messages)) {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

## Testing API Routes

### Unit Testing Route Handlers
```typescript
// app/api/projects/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      projects: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return user projects when authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    });
    vi.mocked(db.query.projects.findMany).mockResolvedValue([
      { id: 'proj-1', name: 'Test Project' },
    ]);

    const request = new NextRequest('http://localhost:3000/api/projects');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Test Project');
  });
});
```

## API Documentation

### JSDoc for Route Handlers
```typescript
/**
 * GET /api/projects
 *
 * Retrieves all projects for the authenticated user.
 *
 * @auth Required
 *
 * @query {string} [status] - Filter by status (draft|active|completed)
 * @query {number} [limit=10] - Number of results (1-100)
 * @query {number} [offset=0] - Pagination offset
 *
 * @returns {Project[]} 200 - List of projects
 * @returns {ApiError} 401 - Unauthorized
 * @returns {ApiError} 500 - Internal server error
 */
export async function GET(request: NextRequest) {
  // ...
}
```

## Quick Reference

### HTTP Status Codes
| Code | Use Case |
|------|----------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Rate Limited |
| 500 | Internal Server Error |

### Route File Locations
```
app/api/
├── auth/
│   └── [...nextauth]/route.ts    # Auth routes
├── projects/
│   ├── route.ts                   # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts               # GET, PUT, DELETE
│       └── validate/route.ts      # POST (validate project)
├── chat/
│   └── route.ts                   # POST (send message)
└── user/
    └── route.ts                   # GET (current user)
```

## References

- See `app/api/` for route implementations
- See `lib/validators/` for Zod schemas
- See `lib/api/` for shared utilities
