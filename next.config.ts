import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // vercel builds en gru1, el api corre en fly.io (gru1 tambien). mando las
  // llamadas por /api/proxy para que no se vean en el bundle del cliente y
  // para evitar CORS en preview deploys.
  async rewrites() {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return [];
    return [
      {
        source: "/api/proxy/graphql",
        destination: `${apiUrl}/graphql`,
      },
    ];
  },
};

export default nextConfig;
