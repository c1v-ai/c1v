// Validate environment at build/start time
import '@/lib/config/env';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true
  }
};

export default nextConfig;
