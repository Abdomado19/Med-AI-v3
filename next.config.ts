import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'med-ai.com',
        pathname: '/Med-AI-PRJCT-*/**'
      }
    ]
  },
  reactCompiler: true,
};

export default nextConfig;
