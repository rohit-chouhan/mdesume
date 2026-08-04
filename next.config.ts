import type { NextConfig } from "next";

// Optional GitHub Pages support. Leave NEXT_PUBLIC_BASE_PATH unset for a root-domain
// or custom-domain deploy (no basePath). For project pages (user.github.io/<repo>),
// set it to the repo name — the CI workflow sets this automatically.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH
  ? `/${process.env.NEXT_PUBLIC_BASE_PATH}`
  : "";

// Turbopack infers the project root by walking UP the tree looking for a lockfile.
// If a stray package.json/package-lock.json exists in a parent directory (e.g. the
// user's home folder), Turbopack picks THAT as the root and starts watching every
// file underneath it — which pegs the disk and CPU during `next dev`. Pinning the
// root to this directory keeps the file watcher scoped to the project.
// `next dev`/`next build` always run from the project root (see package.json scripts).
const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },

  turbopack: {
    root: projectRoot,
  },

  // Keep fewer compiled pages resident in the dev server's memory.
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },

  // Source maps are the single largest contributor to dev-server memory and to
  // the size of the on-disk Turbopack cache. They stay off for production too.
  productionBrowserSourceMaps: false,

  experimental: {
    // Don't eagerly load every route's modules into memory when the server boots.
    preloadEntriesOnStart: false,
    // Tree-shake barrel-file imports so the compiler handles far fewer modules.
    optimizePackageImports: ["lucide-react", "react-select", "react-markdown"],
  },
};

export default nextConfig;
