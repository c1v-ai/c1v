// Validate environment at build/start time
import '@/lib/config/env';

import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

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
  // pptxgenjs declares `browser` stubs for `node:fs` etc., but Next.js webpack
  // doesn't auto-resolve `node:` protocol prefixes. Use IgnorePlugin to skip
  // any `node:` import in client bundles — pptxgenjs's browser code paths never
  // touch them at runtime (the export is invoked behind a click handler in a
  // 'use client' component).
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        https: false,
        os: false,
        path: false,
        stream: false,
        zlib: false,
      };
      config.plugins = config.plugins ?? [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^node:/,
        }),
      );
    }
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  silent: !process.env.CI,
});
