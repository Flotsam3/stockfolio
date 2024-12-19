import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    // Increase the timeout for chunk loading
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
    };

    return config;
  },
};

export default nextConfig;
