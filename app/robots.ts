import type { MetadataRoute } from "next";

// Los previews de vercel pasan por una URL *.vercel.app que no quiero
// que aparezca en Google. En prod habilito todo.
export default function robots(): MetadataRoute.Robots {
  const isProdEnv = process.env.VERCEL_ENV === "production";

  if (!isProdEnv) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login"],
      },
    ],
    sitemap: "https://pulso.vercel.app/sitemap.xml",
  };
}
