/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable Turbopack for build
  experimental: {
    turbotrace: false,
    turbo: false,
  },

  // Force Webpack (safe & stable)
  webpack: (config: import('webpack').Configuration, { isServer }: { isServer: boolean }) => {
    // Optional: Fix any known issues
    if (isServer) {
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.fallback) {
        config.resolve.fallback = {};
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Optional: Improve build stability
  output: "standalone", // if using Docker
};

export default nextConfig;