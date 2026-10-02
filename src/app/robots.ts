import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/de/dashboard/",
        "/en/dashboard/",
        "/tr/dashboard/",
        "/pl/dashboard/",
        "/ar/dashboard/",
        "/fr/dashboard/",
        "/es/dashboard/",
        "/it/dashboard/",
      ],
    },
    sitemap: "https://www.mioseg-qr.com/sitemap.xml",
    host: "https://www.mioseg-qr.com",
  };
}
