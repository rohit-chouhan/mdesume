import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("https://mdesume.rohitchouhan.com")).origin;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const paths = ["/", "/guide/", "/dashboard/"];

  const urls = paths
    .map((path) => {
      const absolute = `${origin}${base}${path === "/" ? "/" : path}`;
      return `  <url><loc>${absolute}</loc></url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
