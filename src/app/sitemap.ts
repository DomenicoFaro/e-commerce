import type { MetadataRoute } from "next";
import { getBrands, getCategories, getPublishedSlugs } from "@/lib/catalog";
import { PAGINE } from "@/lib/settings";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, brands] = await Promise.all([getPublishedSlugs(), getCategories(), getBrands()]);
  const url = (path: string, priority: number) => ({ url: `${SITE}${path}`, priority });
  return [
    url("/", 1),
    url("/offerte", 0.8),
    ...categories.map((c) => url(`/c/${c.slug}`, c.parent_id ? 0.7 : 0.8)),
    ...slugs.map((s) => url(`/p/${s}`, 0.9)),
    ...brands.map((b) => url(`/marca/${b.slug}`, 0.5)),
    ...Object.keys(PAGINE).map((p) => url(`/${p}`, 0.3)),
  ];
}
