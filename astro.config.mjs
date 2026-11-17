import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

/**
 * GitHub Pages support.
 *
 * - User/org page or custom domain (public/CNAME present): leave
 *   PUBLIC_BASE_PATH unset -> site is served from "/".
 * - Project page (user.github.io/<repo>): set PUBLIC_BASE_PATH=/<repo>.
 *
 * The deploy workflow sets this automatically for project pages.
 */
const base = process.env.PUBLIC_BASE_PATH?.replace(/\/+$/, "") || "";

// Additional dev-server hostnames (comma separated). The cloud preview injects
// its own hostname here instead of allowing every host.
const allowedHosts = (process.env.ALLOWED_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://mdesume.rohitchouhan.com",
  base: base || "/",
  output: "static",
  trailingSlash: "ignore",
  integrations: [react()],
  // The toolbar floats over the builder's mobile tab bar in development.
  devToolbar: { enabled: false },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 4321),
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts,
    },
  },
});
