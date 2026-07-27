import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR websocket when accessing `next dev` via Cloudflare quick tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
