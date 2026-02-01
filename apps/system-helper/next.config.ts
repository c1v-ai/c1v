// Validate environment at build/start time
import '@/lib/config/env';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: '../../',
  },
};

export default nextConfig;
