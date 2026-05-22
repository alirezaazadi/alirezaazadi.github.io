import "server-only";
import { getAllPostsMeta } from "./posts";
import { siteConfig } from "../../site.config";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function buildRssFeed(lang: "fa" | "en"): Promise<Response> {
  const posts = await getAllPostsMeta(false, lang);

  // For English feed, only include posts that have an English translation
  const filteredPosts =
    lang === "en"
      ? posts.filter((p) => p.availableLanguages?.includes("en"))
      : posts;

  const feedUrl =
    lang === "en"
      ? `${siteConfig.url}/feed-en.xml`
      : `${siteConfig.url}/feed.xml`;

  const feedTitle =
    lang === "en"
      ? `${siteConfig.title} (English)`
      : siteConfig.title;

  const items = filteredPosts
    .map((post) => {
      const url = `${siteConfig.url}/post/${post.slug}`;
      const pubDate = post.date
        ? new Date(post.date).toUTCString()
        : new Date().toUTCString();

      const categories = post.categories
        .map((cat) => `<category>${escapeXml(cat)}</category>`)
        .join("\n        ");

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.summary)}</description>
      ${categories}
    </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${lang}</language>
    <managingEditor>${escapeXml(siteConfig.email)} (${escapeXml(siteConfig.author)})</managingEditor>
    <webMaster>${escapeXml(siteConfig.email)} (${escapeXml(siteConfig.author)})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
