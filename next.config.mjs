/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static. `next build` writes the finished site to ./out and
  // scripts/verify.ts inspects those HTML files directly.
  output: 'export',
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  // Images are pre-processed by scripts/process-images.ts into WebP with
  // explicit srcsets, so the Next image optimizer is not used.
  images: { unoptimized: true },
  transpilePackages: ['next-mdx-remote'],
}

export default nextConfig
