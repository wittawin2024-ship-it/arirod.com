import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://arairod.com";

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
  ];

  const brandPages = [
    "toyota", "honda", "isuzu", "mazda", "ford", "mitsubishi"
  ].map((brand) => ({
    url: `${baseUrl}/${brand}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const modelPages = [
    { brand: "toyota", model: "camry" },
    { brand: "toyota", model: "fortuner" },
    { brand: "toyota", model: "hilux-revo" },
    { brand: "honda", model: "civic" },
    { brand: "honda", model: "hrv" },
    { brand: "isuzu", model: "d-max" },
  ].map(({ brand, model }) => ({
    url: `${baseUrl}/${brand}/${model}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const blogPosts = [
    "diy-brake-pad-toyota-camry",
    "shock-absorber-warning-signs",
    "oem-vs-aftermarket-parts",
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...brandPages, ...modelPages, ...blogPosts];
}
