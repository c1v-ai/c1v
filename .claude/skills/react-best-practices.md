# React Best Practices Agent Skill

> Source: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
> 
> This skill codifies 10+ years of React and Next.js performance work into 40+ actionable rules.

---

## Overview

Apply these rules when reviewing, writing, or refactoring React/Next.js code. Rules are ordered by **impact level** from CRITICAL to LOW.

---

## Category 1: Eliminating Async Waterfalls

**Impact: CRITICAL**

### Rule 1.1: Parallel Data Fetching

**Bad:**
```typescript
// Sequential fetches - waterfall!
async function Page() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  return <Dashboard user={user} posts={posts} comments={comments} />;
}
```

**Good:**
```typescript
// Parallel fetches - no waterfall
async function Page() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  
  const [user, posts] = await Promise.all([userPromise, postsPromise]);
  const comments = await fetchComments(posts[0].id); // Only this depends on posts
  
  return <Dashboard user={user} posts={posts} comments={comments} />;
}
```

### Rule 1.2: Avoid Fetch-Then-Render in Components

**Bad:**
```typescript
// Parent fetches, then child fetches - waterfall
function Parent() {
  const { data: user } = useSWR('/api/user');
  if (!user) return <Loading />;
  return <Child userId={user.id} />;
}

function Child({ userId }) {
  const { data: posts } = useSWR(`/api/posts/${userId}`);
  // ...
}
```

**Good:**
```typescript
// Parallel fetching with Suspense
function Parent() {
  return (
    <Suspense fallback={<Loading />}>
      <UserWithPosts />
    </Suspense>
  );
}

async function UserWithPosts() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
  return <Dashboard user={user} posts={posts} />;
}
```

### Rule 1.3: Early Conditional Returns Before Fetches

**Bad:**
```typescript
async function handler(req) {
  const data = await fetchExpensiveData(); // Always fetches
  
  if (req.skipProcessing) {
    return { skipped: true };
  }
  
  return processData(data);
}
```

**Good:**
```typescript
async function handler(req) {
  if (req.skipProcessing) {
    return { skipped: true }; // Early return, no fetch
  }
  
  const data = await fetchExpensiveData();
  return processData(data);
}
```

---

## Category 2: Bundle Size Optimization

**Impact: CRITICAL**

### Rule 2.1: Use Dynamic Imports for Heavy Components

**Bad:**
```typescript
import HeavyChart from 'heavy-chart-library'; // Always in bundle

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  return showChart ? <HeavyChart /> : <Button onClick={() => setShowChart(true)} />;
}
```

**Good:**
```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('heavy-chart-library'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Skip server rendering for client-only charts
});

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  return showChart ? <HeavyChart /> : <Button onClick={() => setShowChart(true)} />;
}
```

### Rule 2.2: Tree-Shake Icon Libraries

**Bad:**
```typescript
import * as Icons from 'lucide-react'; // Imports ALL icons

function Nav() {
  return <Icons.Home />;
}
```

**Good:**
```typescript
import { Home, Settings, User } from 'lucide-react'; // Only imports used icons

function Nav() {
  return <Home />;
}
```

### Rule 2.3: Prefer Server Components for Static Content

**Bad:**
```typescript
'use client'; // Unnecessary client component

function StaticContent() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>This is static content that never changes.</p>
    </div>
  );
}
```

**Good:**
```typescript
// No 'use client' - renders on server, zero JS shipped
function StaticContent() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>This is static content that never changes.</p>
    </div>
  );
}
```

---

## Category 3: Server-Side Performance

**Impact: HIGH**

### Rule 3.1: Use React Server Components for Data Fetching

**Bad:**
```typescript
'use client';

function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(setUser);
  }, []);
  
  if (!user) return <Loading />;
  return <Profile user={user} />;
}
```

**Good:**
```typescript
// Server Component - data fetched on server
async function UserProfile() {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  return <Profile user={user} />;
}
```

### Rule 3.2: Cache Expensive Computations with `cache()`

**Bad:**
```typescript
// Called multiple times per request
async function getUser(id: string) {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
}

async function Page() {
  const user = await getUser(id); // DB call 1
  return <Header user={await getUser(id)} />; // DB call 2 (duplicate!)
}
```

**Good:**
```typescript
import { cache } from 'react';

// Cached - only one DB call per request
const getUser = cache(async (id: string) => {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
});

async function Page() {
  const user = await getUser(id); // DB call
  return <Header user={await getUser(id)} />; // Cached, no extra call
}
```

### Rule 3.3: Use Streaming with Suspense

**Bad:**
```typescript
// Blocks entire page until all data loads
async function Page() {
  const [user, posts, analytics] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchAnalytics() // Slow!
  ]);
  
  return (
    <div>
      <Header user={user} />
      <Posts posts={posts} />
      <Analytics data={analytics} />
    </div>
  );
}
```

**Good:**
```typescript
// Stream slow content separately
async function Page() {
  const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
  
  return (
    <div>
      <Header user={user} />
      <Posts posts={posts} />
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsSection /> {/* Streams in when ready */}
      </Suspense>
    </div>
  );
}

async function AnalyticsSection() {
  const analytics = await fetchAnalytics(); // Slow, but doesn't block page
  return <Analytics data={analytics} />;
}
```

---

## Category 4: Client-Side Data Fetching

**Impact: HIGH**

### Rule 4.1: Use SWR/React Query with Proper Keys

**Bad:**
```typescript
// Missing dependency in key - stale data bug
function Posts({ userId }) {
  const { data } = useSWR('/api/posts', fetcher); // Key doesn't include userId!
  // ...
}
```

**Good:**
```typescript
function Posts({ userId }) {
  const { data } = useSWR(`/api/posts?userId=${userId}`, fetcher);
  // or
  const { data } = useSWR(['posts', userId], ([_, id]) => fetchPosts(id));
}
```

### Rule 4.2: Prefetch Data on Hover/Focus

**Bad:**
```typescript
function ProjectCard({ project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      {project.name}
    </Link>
  );
}
```

**Good:**
```typescript
function ProjectCard({ project }) {
  const { prefetch } = useSWRConfig();
  
  const handleMouseEnter = () => {
    prefetch(`/api/projects/${project.id}`, fetcher);
  };
  
  return (
    <Link 
      href={`/projects/${project.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {project.name}
    </Link>
  );
}
```

---

## Category 5: Re-render Optimization

**Impact: MEDIUM**

### Rule 5.1: Memoize Expensive Computations

**Bad:**
```typescript
function DataTable({ items, filter }) {
  // Recalculates on EVERY render
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return <Table data={filteredItems} />;
}
```

**Good:**
```typescript
function DataTable({ items, filter }) {
  const filteredItems = useMemo(() => 
    items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    ),
    [items, filter] // Only recalculate when these change
  );
  
  return <Table data={filteredItems} />;
}
```

### Rule 5.2: Use `useCallback` for Event Handlers Passed as Props

**Bad:**
```typescript
function Parent() {
  const [count, setCount] = useState(0);
  
  // New function on every render - causes child re-renders
  const handleClick = () => setCount(c => c + 1);
  
  return <ExpensiveChild onClick={handleClick} />;
}
```

**Good:**
```typescript
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Stable reference
  
  return <ExpensiveChild onClick={handleClick} />;
}

const ExpensiveChild = memo(function ExpensiveChild({ onClick }) {
  // Only re-renders when onClick actually changes
  return <button onClick={onClick}>Click me</button>;
});
```

### Rule 5.3: Lift State Up or Colocate

**Bad:**
```typescript
function App() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div>
      <Header /> {/* Re-renders on every keystroke! */}
      <Sidebar /> {/* Re-renders on every keystroke! */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <SearchResults query={searchQuery} />
    </div>
  );
}
```

**Good:**
```typescript
function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <SearchSection /> {/* State colocated here */}
    </div>
  );
}

function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <SearchResults query={searchQuery} />
    </>
  );
}
```

---

## Category 6: Rendering Performance

**Impact: MEDIUM**

### Rule 6.1: Virtualize Long Lists

**Bad:**
```typescript
function MessageList({ messages }) {
  return (
    <div>
      {messages.map(msg => ( // Renders ALL 10,000 messages!
        <Message key={msg.id} message={msg} />
      ))}
    </div>
  );
}
```

**Good:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function MessageList({ messages }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <Message 
            key={messages[virtualRow.index].id}
            message={messages[virtualRow.index]}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Rule 6.2: Use CSS for Animations, Not JS State

**Bad:**
```typescript
function AnimatedBox() {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(p => p + 1); // 60 state updates per second!
    }, 16);
    return () => clearInterval(interval);
  }, []);
  
  return <div style={{ transform: `translateX(${position}px)` }} />;
}
```

**Good:**
```typescript
function AnimatedBox() {
  return <div className="animate-slide" />;
}

// In CSS
.animate-slide {
  animation: slide 2s ease-in-out infinite;
}

@keyframes slide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(100px); }
}
```

---

## Category 7: JavaScript Performance

**Impact: LOW**

### Rule 7.1: Avoid Multiple Array Iterations

**Bad:**
```typescript
function processItems(items) {
  const names = items.map(item => item.name);
  const filtered = items.filter(item => item.active);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  // 3 iterations over the array!
}
```

**Good:**
```typescript
function processItems(items) {
  const names = [];
  const filtered = [];
  let total = 0;
  
  for (const item of items) {
    names.push(item.name);
    if (item.active) filtered.push(item);
    total += item.value;
  }
  // Single iteration!
}
```

### Rule 7.2: Use Object Lookup Instead of Array.find for Frequent Access

**Bad:**
```typescript
function UserList({ users, selectedId }) {
  // O(n) lookup on every render
  const selectedUser = users.find(u => u.id === selectedId);
}
```

**Good:**
```typescript
function UserList({ users, selectedId }) {
  // O(1) lookup
  const usersById = useMemo(() => 
    Object.fromEntries(users.map(u => [u.id, u])),
    [users]
  );
  
  const selectedUser = usersById[selectedId];
}
```

---

## Category 8: Advanced Patterns

**Impact: LOW (Incremental Optimization)**

### Rule 8.1: Use `startTransition` for Non-Urgent Updates

```typescript
import { startTransition, useState } from 'react';

function SearchWithResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  function handleChange(e) {
    const value = e.target.value;
    setQuery(value); // Urgent: update input immediately
    
    startTransition(() => {
      setResults(filterResults(value)); // Non-urgent: can be interrupted
    });
  }
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      <Results items={results} />
    </>
  );
}
```

### Rule 8.2: Use `useDeferredValue` for Expensive Derived State

```typescript
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  
  // Uses deferred value - won't block typing
  const results = useMemo(() => 
    expensiveFilter(items, deferredQuery),
    [deferredQuery]
  );
  
  return <List items={results} />;
}
```

---

## Quick Reference: Impact Levels

| Impact | Category | Key Rules |
|--------|----------|-----------|
| **CRITICAL** | Async Waterfalls | Parallel fetches, early returns |
| **CRITICAL** | Bundle Size | Dynamic imports, tree-shaking |
| **HIGH** | Server Performance | RSC, caching, streaming |
| **HIGH** | Client Fetching | SWR keys, prefetching |
| **MEDIUM** | Re-renders | useMemo, useCallback, state colocation |
| **MEDIUM** | Rendering | Virtualization, CSS animations |
| **LOW** | JS Performance | Single iterations, object lookups |
| **LOW** | Advanced | Transitions, deferred values |

---

## Installation

This skill is installed via:

```bash
npx add-skill vercel-labs/agent-skills
```

Or reference directly in agent configuration.

---

**Source:** [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)

**Last Updated:** 2026-01-15
