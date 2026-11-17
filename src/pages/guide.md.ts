import type { APIRoute } from "astro";
import { generateGuideMarkdown } from "@/lib/guideMarkdown";

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("https://mdesume.rohitchouhan.com")).origin;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const fullSiteUrl = `${origin}${base}`;

  const body = generateGuideMarkdown(fullSiteUrl);

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
