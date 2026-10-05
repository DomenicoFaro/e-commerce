import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Indicizzazione attiva solo con SITE_INDEXABLE=true (da impostare al lancio, mai sulle anteprime). */
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== "true") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/carrello", "/api", "/auth", "/s"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
