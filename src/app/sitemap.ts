import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://mdesume.example.com";
    return [
        { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/builder`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ];
}
