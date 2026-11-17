import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("https://mdesume.rohitchouhan.com")).origin;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

  const body = `User-agent: *
Allow: /

Sitemap: ${origin}${base}/sitemap.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
