/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://enat-backend-2jlo.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;