/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static. `next build` writes the finished site to ./out and
  // scripts/verify.ts inspects those HTML files directly.
  // NOT a static export, on purpose. The Flyra slot lookup and the booking
  // write are server route handlers under app/api/, and `output: 'export'`
  // cannot host one: the Flyra key would have to be shipped to the browser.
  //
  // Every page is still prerendered at build time, so the gate still reads
  // finished HTML: scripts/collect-out.ts copies it from .next/server/app back
  // to ./out, which is why scripts/verify.ts needed no change at all.
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  // Images are pre-processed by scripts/process-images.ts into WebP with
  // explicit srcsets, so the Next image optimizer is not used.
  images: { unoptimized: true },
  transpilePackages: ['next-mdx-remote'],
}

export default nextConfig
