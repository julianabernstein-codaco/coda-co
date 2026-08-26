import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // /where-to-start is temporarily retired — /guidance covers the same
  // ground for now. Every internal link was repointed at /guidance, so this
  // only catches bookmarks, search results, and the welcome emails already
  // out in the world. `permanent: false` (307, uncached) so bringing the
  // page back is just deleting this block; the route still lives at
  // app/where-to-start/page.tsx and redirects win over the filesystem.
  async redirects() {
    return [
      { source: "/where-to-start", destination: "/guidance", permanent: false },
    ];
  },
  // Site-wide security headers. Defined here rather than in vercel.json so
  // they also apply under `next dev` and `next start`, and so the policy
  // sits next to the code it describes. See lib/security-headers.ts.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(process.env.NODE_ENV === "development"),
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Book cover images on /books, keyed by ISBN.
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/b/isbn/**",
      },
    ],
  },
  experimental: {
    // Default is 1 MB. Image uploads pass through server actions, and our
    // 5 MB file cap plus multipart overhead needs more headroom than the
    // default. Keep this just above MAX_IMAGE_BYTES in lib/images.ts.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
