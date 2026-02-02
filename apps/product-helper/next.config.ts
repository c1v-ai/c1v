// Validate environment at build/start time
import '@/lib/config/env';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: '../../',
  },
  // Externalize LangChain packages for server-side rendering
  // This prevents bundling which causes duplicate module instances and
  // breaks isInstance/prototype checks. The packages use Node.js native ESM.
  serverExternalPackages: [
    // Core LangChain packages - externalized to use Node.js native resolution
    '@langchain/core',
    '@langchain/anthropic',
    '@langchain/langgraph',
    '@langchain/community',
    'langchain',
    // Transitive dependencies
    'zod-to-json-schema',
    '@anthropic-ai/sdk',
    '@langchain/textsplitters',
    '@langchain/openai',
  ],
};

export default nextConfig;
