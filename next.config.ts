import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed at inhouse.morphosis.ec (no basePath needed)
  images: { unoptimized: true },
  // node-forge uses Node.js internals — tell Turbopack not to bundle it
  serverExternalPackages: ['node-forge'],
};

export default nextConfig;
