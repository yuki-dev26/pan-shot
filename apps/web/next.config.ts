import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/",
  },
});

const nextConfig: NextConfig = {
  transpilePackages: ["@panshot/shared"],
  async redirects() {
    return [{ source: "/ja", destination: "/", permanent: true }];
  },
};

export default withPWA(nextConfig);
