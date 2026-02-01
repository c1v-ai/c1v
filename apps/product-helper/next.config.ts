// Validate environment at build/start time
import '@/lib/config/env';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: '../../',
  },
  // Externalize LangChain packages to fix Turbopack ESM bundling issues
  // Without this, AIMessage.isInstance and other runtime checks fail
  serverExternalPackages: [
    '@langchain/core',
    '@langchain/anthropic',
    '@langchain/langgraph',
    'langchain',
  ],
};

export default nextConfig;
