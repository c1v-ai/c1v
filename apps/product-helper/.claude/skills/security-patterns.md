# Security Patterns

Enterprise-grade security patterns for the product-helper codebase. Reference the `/security-guidance` skill for additional security analysis.

## Authentication & Authorization

### JWT Best Practices
```typescript
// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Short-lived access tokens
export async function createAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')  // Short expiry
    .sign(JWT_SECRET);
}

// Refresh tokens with rotation
export async function createRefreshToken(userId: string): Promise<string> {
  const tokenId = crypto.randomUUID();  // Track for revocation
  await db.insert(refreshTokens).values({ id: tokenId, userId });

  return new SignJWT({ sub: userId, jti: tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}
```

### Session Management
```typescript
// Secure cookie settings
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,  // 7 days
};

// Never store sensitive data in cookies
// BAD: Set-Cookie: user_role=admin
// GOOD: Set-Cookie: session_id=abc123 (lookup role server-side)
```

### Authorization Patterns
```typescript
// lib/auth/rbac.ts
type Permission = 'project:read' | 'project:write' | 'project:delete' | 'admin:*';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  viewer: ['project:read'],
  editor: ['project:read', 'project:write'],
  owner: ['project:read', 'project:write', 'project:delete'],
  admin: ['admin:*'],
};

export function hasPermission(userRole: string, required: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] ?? [];
  return permissions.includes(required) || permissions.includes('admin:*');
}

// Usage in API routes
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasPermission(session.role, 'project:delete')) {
    return new Response('Forbidden', { status: 403 });
  }
  // ... proceed with deletion
}
```

## Input Validation

### Zod Schema Validation
```typescript
// lib/validators/project.ts
import { z } from 'zod';

// Strict schemas - whitelist allowed characters
export const projectNameSchema = z.string()
  .min(3, 'Name must be at least 3 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[\w\s\-]+$/, 'Name can only contain letters, numbers, spaces, and hyphens');

export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: z.string().max(5000).optional(),
  // Explicitly define allowed values
  visibility: z.enum(['private', 'team', 'public']).default('private'),
});

// Validate at API boundary
export async function POST(req: Request) {
  const body = await req.json();
  const result = createProjectSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // result.data is now type-safe and sanitized
  const project = await createProject(result.data);
  return NextResponse.json(project, { status: 201 });
}
```

### Path Traversal Prevention
```typescript
// NEVER trust user input for file paths
// BAD
const filePath = `./uploads/${userId}/${filename}`;

// GOOD
import path from 'path';

function sanitizePath(userInput: string): string {
  // Remove any path traversal attempts
  const sanitized = path.basename(userInput);
  // Validate against allowed patterns
  if (!/^[\w\-\.]+$/.test(sanitized)) {
    throw new Error('Invalid filename');
  }
  return sanitized;
}

const filename = sanitizePath(userFilename);
const filePath = path.join(UPLOADS_DIR, userId, filename);

// Verify the resolved path is within allowed directory
if (!filePath.startsWith(UPLOADS_DIR)) {
  throw new Error('Path traversal detected');
}
```

## SQL Injection Prevention

### Always Use Parameterized Queries
```typescript
// Drizzle ORM - inherently safe
const project = await db.query.projects.findFirst({
  where: eq(projects.id, userId),  // Parameterized
});

// If using raw SQL, use parameters
import { sql } from 'drizzle-orm';

// BAD - SQL injection vulnerability
const query = sql`SELECT * FROM projects WHERE name = '${name}'`;

// GOOD - Parameterized
const query = sql`SELECT * FROM projects WHERE name = ${name}`;
```

## XSS Prevention

### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Required for Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://api.openai.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
];
```

### Output Encoding
```tsx
// React automatically escapes by default - GOOD
<p>{userInput}</p>

// DANGEROUS - only use with sanitized HTML
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// Sanitize if you must render HTML
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  ALLOWED_ATTR: [],
});
```

## API Security

### Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),  // 10 requests per 10 seconds
});

export async function rateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}

// Usage in API route
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, headers } = await rateLimit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429, headers });
  }
  // ... proceed
}
```

### CORS Configuration
```typescript
// app/api/[...route]/route.ts
const ALLOWED_ORIGINS = [
  'https://product-helper.vercel.app',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
].filter(Boolean);

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return new Response(null, { status: 403 });
}
```

## Secrets Management

### Environment Variables
```typescript
// lib/config.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
});

// Validate at startup
export const env = envSchema.parse(process.env);

// Never log secrets
console.log('Config loaded:', {
  database: 'connected',  // Don't log DATABASE_URL
  openai: env.OPENAI_API_KEY ? 'configured' : 'missing',
});
```

### Key Rotation
```typescript
// Support multiple keys during rotation
const JWT_SECRETS = [
  process.env.JWT_SECRET_CURRENT,
  process.env.JWT_SECRET_PREVIOUS,  // Still valid during rotation
].filter(Boolean).map(s => new TextEncoder().encode(s));

export async function verifyToken(token: string) {
  for (const secret of JWT_SECRETS) {
    try {
      return await jwtVerify(token, secret);
    } catch {
      continue;
    }
  }
  throw new Error('Invalid token');
}
```

## Logging & Monitoring

### Security Event Logging
```typescript
// lib/logging/security.ts
import { logger } from '@/lib/logging';

export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'permission_denied' | 'suspicious_input';
  userId?: string;
  ip?: string;
  details: Record<string, unknown>;
}) {
  logger.warn({
    category: 'security',
    timestamp: new Date().toISOString(),
    ...event,
  });
}

// Usage
logSecurityEvent({
  type: 'auth_failure',
  ip: request.headers.get('x-forwarded-for'),
  details: { reason: 'invalid_password', attempts: 3 },
});
```

## OWASP Top 10 Quick Reference

| Vulnerability | Prevention |
|---------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | Short-lived tokens, MFA, secure session management |
| Sensitive Data Exposure | HTTPS, encryption at rest, minimize data collection |
| XXE | Disable external entities in XML parsers |
| Broken Access Control | Role-based access, deny by default |
| Security Misconfiguration | Security headers, remove defaults, automated scanning |
| XSS | CSP, output encoding, sanitize HTML |
| Insecure Deserialization | Validate before deserializing, use safe formats (JSON) |
| Vulnerable Components | Dependency scanning, regular updates |
| Insufficient Logging | Log security events, monitor for anomalies |

## Security Checklist for Code Review

- [ ] All user input validated with strict schemas
- [ ] No raw SQL queries (use ORM/parameterized)
- [ ] Authentication checked on all protected routes
- [ ] Authorization checked for resource access
- [ ] Sensitive data not logged
- [ ] Secrets not hardcoded
- [ ] Rate limiting on public endpoints
- [ ] CORS configured restrictively
- [ ] Security headers set
- [ ] Error messages don't leak sensitive info

## Related Skills

- Use `/security-guidance` skill for security vulnerability analysis
- See `api-design.md` for API security patterns
- See `testing-strategies.md` for security testing
