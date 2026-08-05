import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed at inhouse.morphosis.ec (no basePath needed)
  images: { unoptimized: true },
};

export default nextConfig;
