// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     // Disable ESLint during production builds
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force all pages to be dynamic
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Disable static generation for problematic routes
  async headers() {
    return [
      {
        source: '/sales/pos-sale',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;