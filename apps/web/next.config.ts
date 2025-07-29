import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  webpack: (config, { isServer }) => {
    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Copy WASM files to the output directory
    if (!isServer) {
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });
    }

    return config;
  },
};

export default nextConfig;
