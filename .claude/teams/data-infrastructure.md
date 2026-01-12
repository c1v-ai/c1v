# 💾 Data & Infrastructure Team

**Version:** 1.0.0
**Last Updated:** 2026-01-12
**Team Size:** 3 Agents

---

## Mission

The Data & Infrastructure team owns the data layer, performance optimization, and observability for the C1V product-helper application. We ensure data flows efficiently, responses are fast, and the system is observable and reliable at scale.

**Core Responsibilities:**
- Vector database management for RAG (Retrieval Augmented Generation)
- Caching strategies for LLM responses and expensive computations
- Performance monitoring and observability
- Data pipeline design and ETL processes
- Search and retrieval optimization
- Redis/Upstash integration for caching
- Application performance monitoring (APM)
- Cost optimization for data operations

---

## Agents

### Agent 4.1: Vector Store Engineer

**Primary Role:** Implement and optimize vector database for RAG capabilities

**Primary Responsibilities:**
- Design vector database schema for document embeddings
- Implement semantic search with OpenAI embeddings
- Build document ingestion pipeline for PRD templates
- Optimize vector similarity search performance
- Implement hybrid search (vector + keyword)
- Manage embedding model updates and migrations
- Build RAG retrieval chains for context injection
- Monitor vector database performance

**Tech Stack:**
- **Vector Database:** Supabase (pgvector), Pinecone (future alternative)
- **Embeddings:** OpenAI text-embedding-3-small, text-embedding-3-large
- **Search:** Cosine similarity, hybrid search with RRF
- **LangChain:** Supabase vector store, retrievers
- **Processing:** RecursiveCharacterTextSplitter for chunking

**Required MCPs:**
- `filesystem` - Reading documents for ingestion
- `postgres` - Direct vector database access
- `sequential-thinking` - Vector search optimization

**Key Files & Directories:**
```
apps/product-helper/
├── lib/
│   ├── vectorstore/
│   │   ├── supabase.ts              # Supabase vector store setup
│   │   ├── embeddings.ts            # Embedding generation
│   │   ├── ingestion.ts             # Document ingestion pipeline
│   │   ├── retriever.ts             # Retriever configuration
│   │   └── hybrid-search.ts         # Hybrid search implementation
│   └── rag/
│       ├── context-builder.ts       # Build context from retrieved docs
│       ├── reranker.ts              # Re-rank search results
│       └── citation-extractor.ts    # Extract source citations
├── app/api/
│   └── retrieval/
│       ├── ingest/
│       │   └── route.ts             # Document ingestion endpoint
│       └── search/
│           └── route.ts             # Semantic search endpoint
├── scripts/
│   └── seed-vector-db.ts            # Seed with PRD templates
└── supabase/
    └── migrations/
        └── 001_enable_pgvector.sql  # Enable pgvector extension
```

**Vector Store Setup:**

**1. Supabase Configuration**
```sql
-- supabase/migrations/001_enable_pgvector.sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with vector embeddings
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**2. Vector Store Initialization**
```typescript
// ✅ GOOD: Supabase vector store setup
// lib/vectorstore/supabase.ts
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PRIVATE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small', // 1536 dimensions, cost-effective
});

export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: 'documents',
  queryName: 'match_documents',
});

// For larger, higher-quality embeddings (optional)
export const largeEmbeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-large', // 3072 dimensions
});
```

**3. Document Ingestion Pipeline**
```typescript
// ✅ GOOD: Document ingestion with chunking
// lib/vectorstore/ingestion.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { vectorStore } from './supabase';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', ' ', ''],
});

export async function ingestDocument(
  content: string,
  metadata: Record<string, any>
) {
  // Split document into chunks
  const chunks = await textSplitter.createDocuments([content], [metadata]);

  // Generate embeddings and store
  await vectorStore.addDocuments(chunks);

  return {
    chunksCreated: chunks.length,
    metadata,
  };
}

export async function ingestPRDTemplate(
  templateName: string,
  templateContent: string
) {
  const metadata = {
    type: 'prd_template',
    name: templateName,
    source: 'internal',
    ingested_at: new Date().toISOString(),
  };

  return ingestDocument(templateContent, metadata);
}

// Batch ingestion for initial seed
export async function ingestMultipleDocuments(
  documents: Array<{ content: string; metadata: Record<string, any> }>
) {
  const allChunks: Document[] = [];

  for (const doc of documents) {
    const chunks = await textSplitter.createDocuments(
      [doc.content],
      [doc.metadata]
    );
    allChunks.push(...chunks);
  }

  // Batch insert for performance
  await vectorStore.addDocuments(allChunks);

  return {
    documentsIngested: documents.length,
    totalChunks: allChunks.length,
  };
}
```

**4. Semantic Search Implementation**
```typescript
// ✅ GOOD: Semantic search with filtering
// lib/vectorstore/retriever.ts
import { vectorStore } from './supabase';

export async function semanticSearch(
  query: string,
  options: {
    k?: number;
    filter?: Record<string, any>;
    scoreThreshold?: number;
  } = {}
) {
  const { k = 5, filter, scoreThreshold = 0.7 } = options;

  const retriever = vectorStore.asRetriever({
    k,
    filter,
    searchType: 'similarity',
    searchKwargs: {
      scoreThreshold,
    },
  });

  const results = await retriever.getRelevantDocuments(query);

  return results.map((doc) => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    // Extract similarity score if available
    score: doc.metadata.score,
  }));
}

// Context-aware retrieval for PRD generation
export async function retrievePRDContext(
  projectVision: string,
  currentContext: string,
  k: number = 3
) {
  // Combine vision and current context for better retrieval
  const query = `${projectVision}\n\nCurrent context: ${currentContext}`;

  const results = await semanticSearch(query, {
    k,
    filter: { type: 'prd_template' },
    scoreThreshold: 0.75,
  });

  return results;
}
```

**5. Hybrid Search (Vector + Keyword)**
```typescript
// ✅ GOOD: Hybrid search with RRF (Reciprocal Rank Fusion)
// lib/vectorstore/hybrid-search.ts
import { supabase } from './supabase';
import { semanticSearch } from './retriever';

interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  score: number;
}

export async function hybridSearch(
  query: string,
  options: {
    k?: number;
    vectorWeight?: number;
    keywordWeight?: number;
  } = {}
) {
  const { k = 10, vectorWeight = 0.7, keywordWeight = 0.3 } = options;

  // 1. Vector search
  const vectorResults = await semanticSearch(query, { k: k * 2 });

  // 2. Keyword search (PostgreSQL full-text search)
  const { data: keywordResults } = await supabase
    .from('documents')
    .select('*')
    .textSearch('content', query)
    .limit(k * 2);

  // 3. Reciprocal Rank Fusion (RRF)
  const fusedScores = new Map<string, number>();

  vectorResults.forEach((result, index) => {
    const score = vectorWeight * (1 / (index + 1));
    fusedScores.set(result.metadata.id, score);
  });

  keywordResults?.forEach((result, index) => {
    const score = keywordWeight * (1 / (index + 1));
    const currentScore = fusedScores.get(result.id) || 0;
    fusedScores.set(result.id, currentScore + score);
  });

  // 4. Sort by fused score and return top k
  const sortedResults = Array.from(fusedScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k);

  // 5. Fetch full documents
  const resultIds = sortedResults.map(([id]) => id);
  const { data: fullDocuments } = await supabase
    .from('documents')
    .select('*')
    .in('id', resultIds);

  return sortedResults.map(([id, score]) => {
    const doc = fullDocuments?.find((d) => d.id === id);
    return {
      id,
      content: doc?.content || '',
      metadata: doc?.metadata || {},
      score,
    };
  });
}
```

**6. RAG Chain with Retrieved Context**
```typescript
// ✅ GOOD: RAG chain for context-aware responses
// lib/rag/context-builder.ts
import { retrievePRDContext } from '../vectorstore/retriever';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

export async function generateWithRAG(
  projectVision: string,
  userQuestion: string,
  conversationHistory: string
) {
  // Retrieve relevant PRD templates and examples
  const relevantDocs = await retrievePRDContext(
    projectVision,
    `${conversationHistory}\nUser: ${userQuestion}`,
    3
  );

  // Build context from retrieved documents
  const context = relevantDocs
    .map((doc, i) => `[Source ${i + 1}]\n${doc.content}`)
    .join('\n\n');

  // Prompt with injected context
  const prompt = PromptTemplate.fromTemplate(`
You are a PRD assistant. Use the following examples and templates to guide your response.

## Retrieved Context
{context}

## Project Vision
{projectVision}

## Conversation History
{conversationHistory}

## User Question
{userQuestion}

## Your Response
Provide a helpful response based on the context and examples above. Cite sources when relevant.
  `);

  const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo', temperature: 0.7 });

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    context,
    projectVision,
    conversationHistory,
    userQuestion,
  });

  return {
    response: response.content,
    sources: relevantDocs.map((doc) => ({
      content: doc.content.substring(0, 200) + '...',
      metadata: doc.metadata,
    })),
  };
}
```

**Anti-Patterns to Avoid:**
❌ Not using indexes (slow similarity search)
❌ Storing full documents without chunking (poor retrieval quality)
❌ Using wrong embedding dimensions
❌ No metadata filtering (irrelevant results)
❌ Not tracking embedding costs
❌ Missing error handling for embedding API failures
❌ Not deduplicating documents before ingestion

**Documentation Duties:**
- Document vector database schema and migrations
- Create ingestion pipeline runbooks
- Maintain embedding model changelog
- Document search optimization strategies
- Create performance benchmarks for retrieval

**Testing Requirements:**
- **Unit tests:** Chunking logic, search functions
- **Integration tests:** End-to-end ingestion and retrieval
- **Performance tests:** Search latency < 200ms
- **Quality tests:** Retrieval relevance (precision@k)
- Golden datasets for regression testing

**Handoff Points:**
- **Receives from:**
  - AI/Agent team: RAG requirements, context needs
  - Backend: Document sources for ingestion
  - Product Planning: PRD templates to ingest
- **Delivers to:**
  - AI/Agent team: Retrieved context, similarity scores
  - Frontend: Search results for display
  - Backend: Ingestion status and metadata

---

### Agent 4.2: Cache Engineer

**Primary Role:** Design and implement caching strategies for performance optimization

**Primary Responsibilities:**
- Design Redis/Upstash caching architecture
- Implement LLM response caching
- Build prompt caching for repeated queries
- Cache expensive computations (embeddings, validation)
- Implement cache invalidation strategies
- Monitor cache hit rates and performance
- Optimize time-to-live (TTL) settings
- Reduce LLM API costs via caching

**Tech Stack:**
- **Cache:** Upstash Redis (serverless), Vercel KV
- **Strategy:** LRU, TTL-based expiration
- **Client:** @upstash/redis, ioredis
- **Monitoring:** Cache metrics dashboard

**Required MCPs:**
- `filesystem` - Cache configuration
- `sequential-thinking` - Cache strategy design

**Key Files:**
```
lib/cache/
├── redis.ts                    # Redis client setup
├── llm-cache.ts               # LLM response caching
├── embedding-cache.ts         # Embedding caching
├── validation-cache.ts        # Validation result caching
├── strategies/
│   ├── ttl-strategy.ts
│   └── lru-strategy.ts
└── monitoring/
    └── cache-metrics.ts       # Hit rate tracking
```

**Cache Implementation:**

**1. Redis Setup**
```typescript
// ✅ GOOD: Upstash Redis configuration
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper for JSON caching
export async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached as T | null;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
}

export async function cacheExists(key: string): Promise<boolean> {
  const exists = await redis.exists(key);
  return exists === 1;
}
```

**2. LLM Response Caching**
```typescript
// ✅ GOOD: Cache LLM responses to reduce costs
// lib/cache/llm-cache.ts
import { cacheGet, cacheSet } from './redis';
import crypto from 'crypto';

interface CachedLLMResponse {
  response: string;
  model: string;
  timestamp: number;
  tokenCount: number;
}

function generateCacheKey(
  prompt: string,
  model: string,
  temperature: number
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${prompt}:${model}:${temperature}`)
    .digest('hex');
  return `llm:${hash}`;
}

export async function getCachedLLMResponse(
  prompt: string,
  model: string,
  temperature: number
): Promise<string | null> {
  // Only cache deterministic responses (temperature = 0)
  if (temperature > 0) return null;

  const key = generateCacheKey(prompt, model, temperature);
  const cached = await cacheGet<CachedLLMResponse>(key);

  if (cached) {
    console.log('✓ LLM cache hit:', key.substring(0, 20));
    return cached.response;
  }

  return null;
}

export async function cacheLLMResponse(
  prompt: string,
  model: string,
  temperature: number,
  response: string,
  tokenCount: number
): Promise<void> {
  // Only cache deterministic responses
  if (temperature > 0) return;

  const key = generateCacheKey(prompt, model, temperature);
  const value: CachedLLMResponse = {
    response,
    model,
    timestamp: Date.now(),
    tokenCount,
  };

  // Cache for 7 days (604800 seconds)
  await cacheSet(key, value, 604800);
}

// Usage in LLM call
export async function callLLMWithCache(
  prompt: string,
  model: string = 'gpt-4-turbo',
  temperature: number = 0
): Promise<string> {
  // Check cache first
  const cached = await getCachedLLMResponse(prompt, model, temperature);
  if (cached) return cached;

  // Call LLM
  const llm = new ChatOpenAI({ modelName: model, temperature });
  const response = await llm.invoke(prompt);

  // Cache response
  await cacheLLMResponse(
    prompt,
    model,
    temperature,
    response.content,
    response.usage?.totalTokens || 0
  );

  return response.content;
}
```

**3. Embedding Caching**
```typescript
// ✅ GOOD: Cache embeddings (expensive to generate)
// lib/cache/embedding-cache.ts
import { cacheGet, cacheSet } from './redis';
import { OpenAIEmbeddings } from '@langchain/openai';
import crypto from 'crypto';

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
});

function generateEmbeddingCacheKey(text: string): string {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return `embedding:${hash}`;
}

export async function getEmbeddingWithCache(
  text: string
): Promise<number[]> {
  const key = generateEmbeddingCacheKey(text);
  const cached = await cacheGet<number[]>(key);

  if (cached) {
    console.log('✓ Embedding cache hit');
    return cached;
  }

  // Generate embedding
  const embedding = await embeddings.embedQuery(text);

  // Cache for 30 days (embeddings are deterministic)
  await cacheSet(key, embedding, 2592000);

  return embedding;
}

// Batch embedding with cache
export async function getBatchEmbeddingsWithCache(
  texts: string[]
): Promise<number[][]> {
  const results: number[][] = [];

  for (const text of texts) {
    const embedding = await getEmbeddingWithCache(text);
    results.push(embedding);
  }

  return results;
}
```

**4. Validation Result Caching**
```typescript
// ✅ GOOD: Cache validation results (expensive computation)
// lib/cache/validation-cache.ts
import { cacheGet, cacheSet, cacheDelete } from './redis';
import type { ValidationResult } from '../validators/sr-cornell';

function getValidationCacheKey(projectId: number): string {
  return `validation:project:${projectId}`;
}

export async function getCachedValidationResult(
  projectId: number
): Promise<ValidationResult | null> {
  const key = getValidationCacheKey(projectId);
  return cacheGet<ValidationResult>(key);
}

export async function cacheValidationResult(
  projectId: number,
  result: ValidationResult
): Promise<void> {
  const key = getValidationCacheKey(projectId);
  // Cache for 1 hour (validation can change as project updates)
  await cacheSet(key, result, 3600);
}

export async function invalidateValidationCache(
  projectId: number
): Promise<void> {
  const key = getValidationCacheKey(projectId);
  await cacheDelete(key);
}

// Usage: Invalidate cache when project data changes
export async function onProjectDataUpdate(projectId: number) {
  await invalidateValidationCache(projectId);
  // Also invalidate related caches
  await cacheDelete(`project:${projectId}:extracted-data`);
}
```

**5. Cache Monitoring**
```typescript
// ✅ GOOD: Track cache performance
// lib/cache/monitoring/cache-metrics.ts
import { redis } from '../redis';

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsed: string;
}

export async function getCacheMetrics(): Promise<CacheMetrics> {
  const info = await redis.info();

  // Parse Redis INFO response
  const stats = parseRedisInfo(info);

  const hits = parseInt(stats.keyspace_hits || '0');
  const misses = parseInt(stats.keyspace_misses || '0');
  const total = hits + misses;
  const hitRate = total > 0 ? (hits / total) * 100 : 0;

  return {
    hits,
    misses,
    hitRate: Math.round(hitRate * 100) / 100,
    totalKeys: parseInt(stats.db0?.keys || '0'),
    memoryUsed: stats.used_memory_human || 'N/A',
  };
}

function parseRedisInfo(info: string): Record<string, any> {
  const lines = info.split('\n');
  const stats: Record<string, any> = {};

  for (const line of lines) {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      stats[key.trim()] = value.trim();
    }
  }

  return stats;
}

// Endpoint to expose metrics
// app/api/admin/cache/metrics/route.ts
export async function GET() {
  const metrics = await getCacheMetrics();
  return Response.json(metrics);
}
```

**Anti-Patterns to Avoid:**
❌ Caching non-deterministic LLM responses (temperature > 0)
❌ Not invalidating cache when data changes
❌ Using cache without TTL (memory leak)
❌ Caching PII or sensitive data
❌ Not monitoring cache hit rates
❌ Over-caching (diminishing returns)
❌ Missing error handling for cache failures

**Documentation Duties:**
- Document cache key naming conventions
- Maintain TTL strategy documentation
- Create cache invalidation runbooks
- Document cost savings from caching
- Maintain cache performance benchmarks

**Testing Requirements:**
- **Unit tests:** Cache get/set/delete operations
- **Integration tests:** Cache invalidation flows
- **Performance tests:** Cache lookup latency < 10ms
- **Load tests:** Cache under high concurrent access
- Monitor cache hit rate > 70% in production

**Handoff Points:**
- **Receives from:**
  - AI/Agent team: LLM responses to cache
  - Vector Store Engineer: Embeddings to cache
  - Backend: Data update events for invalidation
- **Delivers to:**
  - All teams: Cached data for performance
  - Backend: Cache metrics for monitoring
  - DevOps: Cache configuration and scaling needs

---

### Agent 4.3: Observability Engineer

**Primary Role:** Implement monitoring, logging, and performance tracking

**Primary Responsibilities:**
- Set up application performance monitoring (APM)
- Implement structured logging
- Build dashboards for key metrics
- Set up error tracking and alerting
- Monitor LLM API usage and costs
- Track database query performance
- Implement tracing for distributed requests
- Create SLO (Service Level Objective) tracking

**Tech Stack:**
- **APM:** Vercel Analytics, Sentry for errors
- **Logging:** Pino (structured logging), Vercel Logs
- **Metrics:** Custom metrics with Vercel Analytics
- **Tracing:** OpenTelemetry (optional)
- **Dashboards:** Vercel Dashboard, custom analytics

**Required MCPs:**
- `filesystem` - Logging configuration
- `sequential-thinking` - Observability architecture

**Key Files:**
```
lib/observability/
├── logger.ts                  # Structured logging setup
├── metrics.ts                 # Custom metrics
├── tracing.ts                 # Distributed tracing
├── error-tracking.ts          # Sentry setup
└── monitoring/
    ├── llm-costs.ts          # LLM cost tracking
    ├── database-metrics.ts   # DB performance
    └── api-latency.ts        # API response times
```

**Observability Implementation:**

**1. Structured Logging**
```typescript
// ✅ GOOD: Structured logging with Pino
// lib/observability/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    service: 'product-helper',
  },
});

// Helper functions for different log levels
export function logInfo(message: string, context?: Record<string, any>) {
  logger.info(context, message);
}

export function logError(
  message: string,
  error: Error,
  context?: Record<string, any>
) {
  logger.error({ ...context, err: error }, message);
}

export function logLLMCall(
  model: string,
  prompt: string,
  tokens: number,
  latency: number
) {
  logger.info({
    type: 'llm_call',
    model,
    promptLength: prompt.length,
    tokens,
    latency,
  }, 'LLM API call completed');
}

// Usage
logInfo('Project created', { projectId: 123, userId: 'user_abc' });
logError('Failed to generate diagram', error, { projectId: 123 });
```

**2. LLM Cost Tracking**
```typescript
// ✅ GOOD: Track LLM API costs
// lib/observability/monitoring/llm-costs.ts
import { logger } from '../logger';
import { redis } from '../../cache/redis';

const MODEL_COSTS = {
  'gpt-4-turbo': {
    input: 0.01 / 1000, // $0.01 per 1K input tokens
    output: 0.03 / 1000, // $0.03 per 1K output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000,
    output: 0.0015 / 1000,
  },
  'text-embedding-3-small': {
    input: 0.00002 / 1000,
    output: 0,
  },
};

export async function trackLLMCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  userId: string
) {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['gpt-4-turbo'];
  const cost = (inputTokens * costs.input) + (outputTokens * costs.output);

  logger.info({
    type: 'llm_cost',
    model,
    inputTokens,
    outputTokens,
    cost,
    userId,
  }, 'LLM cost tracked');

  // Store in Redis for daily aggregation
  const dateKey = new Date().toISOString().split('T')[0];
  const key = `costs:${dateKey}`;
  await redis.incrbyfloat(key, cost);

  // Per-user cost tracking
  const userKey = `costs:user:${userId}:${dateKey}`;
  await redis.incrbyfloat(userKey, cost);

  return cost;
}

export async function getDailyCosts(date: string): Promise<number> {
  const key = `costs:${date}`;
  const cost = await redis.get(key);
  return parseFloat(cost as string) || 0;
}

export async function getUserCosts(
  userId: string,
  date: string
): Promise<number> {
  const key = `costs:user:${userId}:${date}`;
  const cost = await redis.get(key);
  return parseFloat(cost as string) || 0;
}
```

**3. Error Tracking with Sentry**
```typescript
// ✅ GOOD: Sentry error tracking
// lib/observability/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Filter out low-priority errors
    if (event.level === 'warning') {
      return null;
    }
    return event;
  },
});

export function captureError(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.captureMessage(message, level);
}

// Wrap async functions with error tracking
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(error as Error, {
        ...context,
        functionName: fn.name,
        arguments: args,
      });
      throw error;
    }
  }) as T;
}
```

**4. API Latency Monitoring**
```typescript
// ✅ GOOD: Track API response times
// lib/observability/monitoring/api-latency.ts
import { logger } from '../logger';

export function trackAPILatency(
  endpoint: string,
  method: string,
  startTime: number,
  statusCode: number
) {
  const latency = Date.now() - startTime;

  logger.info({
    type: 'api_request',
    endpoint,
    method,
    latency,
    statusCode,
  }, 'API request completed');

  // Alert if latency > 2 seconds
  if (latency > 2000) {
    logger.warn({
      type: 'slow_api_request',
      endpoint,
      latency,
    }, 'Slow API request detected');
  }

  return latency;
}

// Middleware for Next.js API routes
export function withLatencyTracking(handler: Function) {
  return async (req: any, res: any) => {
    const startTime = Date.now();

    // Intercept response to track latency
    const originalJson = res.json;
    res.json = function (data: any) {
      trackAPILatency(
        req.url,
        req.method,
        startTime,
        res.statusCode
      );
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
}
```

**5. Database Query Monitoring**
```typescript
// ✅ GOOD: Monitor slow database queries
// lib/observability/monitoring/database-metrics.ts
import { logger } from '../logger';
import { db } from '../../db/drizzle';

const SLOW_QUERY_THRESHOLD = 100; // ms

export async function executeWithMetrics<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;

    logger.info({
      type: 'db_query',
      queryName,
      duration,
    }, 'Database query executed');

    if (duration > SLOW_QUERY_THRESHOLD) {
      logger.warn({
        type: 'slow_db_query',
        queryName,
        duration,
      }, 'Slow database query detected');
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error({
      type: 'db_query_error',
      queryName,
      duration,
      error,
    }, 'Database query failed');

    throw error;
  }
}

// Usage
const projects = await executeWithMetrics(
  'getProjectsForTeam',
  () => db.query.projects.findMany({ where: eq(projects.teamId, teamId) })
);
```

**Anti-Patterns to Avoid:**
❌ Logging sensitive data (passwords, tokens, PII)
❌ No structured logging (hard to query)
❌ Not tracking business metrics (only technical)
❌ Missing error context (can't reproduce bugs)
❌ Over-logging (noise, storage costs)
❌ Not alerting on critical errors
❌ Missing performance baselines

**Documentation Duties:**
- Document logging conventions and best practices
- Maintain runbooks for common alerts
- Create observability dashboards
- Document SLOs and SLIs
- Write incident response playbooks

**Testing Requirements:**
- **Unit tests:** Logging functions, metric tracking
- **Integration tests:** Error tracking end-to-end
- **Load tests:** Logging performance under load
- Verify alerts trigger correctly

**Handoff Points:**
- **Receives from:**
  - All teams: Events to log and track
  - Backend: Database metrics
  - AI/Agent: LLM usage and costs
- **Delivers to:**
  - DevOps: Monitoring dashboards and alerts
  - Product Planning: Usage analytics
  - All teams: Performance insights

---

## Team Workflows

### Data Pipeline
1. **Vector Store Engineer** ingests documents
2. **Cache Engineer** caches embeddings
3. **Observability Engineer** monitors ingestion performance
4. **Vector Store Engineer** optimizes based on metrics

### Performance Optimization
1. **Observability Engineer** identifies slow queries/APIs
2. **Cache Engineer** implements caching strategy
3. **Vector Store Engineer** optimizes vector search
4. **Observability Engineer** validates improvements

---

## Testing Requirements

### Vector Store Tests
- Test ingestion pipeline with various document types
- Verify search relevance with golden datasets
- Performance test: search latency < 200ms
- **Target:** 90% coverage

### Cache Tests
- Test cache hit/miss scenarios
- Verify invalidation logic
- Test TTL expiration
- **Target:** 95% coverage

### Observability Tests
- Verify logs are structured and queryable
- Test error tracking captures context
- Validate metrics are accurate
- **Target:** 85% coverage

---

## Success Metrics

**Vector Store Engineer:**
- Search latency p95 < 200ms
- Retrieval relevance (precision@3) > 80%
- Document ingestion throughput > 100 docs/sec

**Cache Engineer:**
- Cache hit rate > 70%
- LLM API cost reduction > 40% via caching
- Cache lookup latency < 10ms

**Observability Engineer:**
- Error detection rate 100% (all errors tracked)
- Alert response time < 5 minutes
- Dashboard query time < 3 seconds

---

**Questions or Issues?** Tag `@data-infrastructure-team` in GitHub discussions or issues.
