# Next.js Best Practices

Best practices for Next.js 15 App Router development in the product-helper codebase.

## Server vs Client Components

### Default to Server Components
```tsx
// Server Component (default) - no directive needed
export default async function ProjectList() {
  const projects = await db.query.projects.findMany();
  return <ul>{projects.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### Use Client Components Only When Needed
```tsx
'use client';
// Only for: useState, useEffect, onClick, browser APIs

export function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onSend(value)}
    />
  );
}
```

### Composition Pattern
```tsx
// Server Component wrapper
export default async function ChatPage({ params }: { params: { id: string } }) {
  const messages = await getMessages(params.id);
  return <ChatWindow initialMessages={messages} projectId={params.id} />;
}

// Client Component receives server data
'use client';
export function ChatWindow({ initialMessages, projectId }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  // ... client-side state management
}
```

## Data Fetching

### Prefer Server Actions for Mutations
```tsx
// lib/actions/projects.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  await db.insert(projects).values({ name });
  revalidatePath('/projects');
}
```

### Use Route Handlers for API Endpoints
```tsx
// app/api/projects/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await db.query.projects.findMany();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Validate with Zod
  const result = projectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const project = await db.insert(projects).values(result.data).returning();
  return NextResponse.json(project[0], { status: 201 });
}
```

## File Organization

### Route Structure
```
app/
├── (auth)/           # Auth group (no /auth prefix)
│   ├── login/
│   └── register/
├── (dashboard)/      # Dashboard group (layout with sidebar)
│   ├── projects/
│   │   ├── [id]/
│   │   │   ├── chat/
│   │   │   └── artifacts/
│   │   └── page.tsx
│   └── layout.tsx
├── api/              # API routes
│   └── projects/
│       └── route.ts
└── layout.tsx        # Root layout
```

### Component Colocation
```
components/
├── chat/
│   ├── chat-window.tsx
│   ├── chat-input.tsx
│   ├── chat-messages.tsx
│   └── index.ts      # Re-exports
├── projects/
│   ├── project-card.tsx
│   └── project-form.tsx
└── ui/               # shadcn/ui components
    ├── button.tsx
    └── input.tsx
```

## Error Handling

### Error Boundaries
```tsx
// app/projects/[id]/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Loading States
```tsx
// app/projects/[id]/loading.tsx
export default function Loading() {
  return <Skeleton className="h-96 w-full" />;
}
```

### Not Found
```tsx
// app/projects/[id]/not-found.tsx
export default function NotFound() {
  return <div>Project not found</div>;
}

// Usage in page
import { notFound } from 'next/navigation';

export default async function ProjectPage({ params }: Props) {
  const project = await getProject(params.id);
  if (!project) notFound();
  return <ProjectView project={project} />;
}
```

## Metadata

### Static Metadata
```tsx
// app/projects/page.tsx
export const metadata = {
  title: 'Projects | Product Helper',
  description: 'Manage your PRD projects',
};
```

### Dynamic Metadata
```tsx
// app/projects/[id]/page.tsx
export async function generateMetadata({ params }: Props) {
  const project = await getProject(params.id);
  return {
    title: `${project?.name} | Product Helper`,
  };
}
```

## Performance

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/diagram.png"
  alt="Context Diagram"
  width={800}
  height={600}
  priority  // For above-the-fold images
/>
```

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic';

const DiagramViewer = dynamic(() => import('@/components/diagram-viewer'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false, // For client-only components like Mermaid
});
```

### Caching
```tsx
// Revalidate every hour
export const revalidate = 3600;

// Or disable caching for dynamic data
export const dynamic = 'force-dynamic';
```

## Common Patterns in This Codebase

### Auth Check
```tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/login');
  // ...
}
```

### Database Access in Server Components
```tsx
import { db } from '@/lib/db';

export default async function ProjectsPage() {
  const projects = await db.query.projects.findMany({
    where: eq(projects.userId, session.user.id),
    orderBy: desc(projects.updatedAt),
  });
  return <ProjectList projects={projects} />;
}
```

### Form Handling with Server Actions
```tsx
'use client';

import { useFormStatus } from 'react-dom';
import { createProject } from '@/lib/actions/projects';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending ? 'Creating...' : 'Create'}</Button>;
}

export function CreateProjectForm() {
  return (
    <form action={createProject}>
      <input name="name" required />
      <SubmitButton />
    </form>
  );
}
```
