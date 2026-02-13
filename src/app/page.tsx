import { Suspense } from "react";
import { getAllPostsMeta } from "@/lib/posts";
import { extractCategories, extractPostDates } from "@/lib/post-utils";
import { PostList } from "@/components/PostList";
import { siteConfig } from "../../site.config";

// Use ISR: revalidate every 5 minutes for CDN caching
export const revalidate = 300;

export default async function HomePage() {
  const allMeta = await getAllPostsMeta();

  // Extract filter data server-side (for SEO and first paint)
  const allCategories = extractCategories(allMeta);
  const allDates = extractPostDates(allMeta);

  // First page only (server-rendered)
  const firstPagePosts = allMeta.slice(0, siteConfig.postsPerPage);

  return (
    <div>
      {/* <h1 className="page-title">{siteConfig.author}</h1> -- Removed per user request */}
      <p className="page-subtitle" style={{ marginTop: 0 }}>{siteConfig.description}</p>
      <Suspense fallback={<div className="empty-state"><span className="spinner" /></div>}>
        <PostList
          initialPosts={firstPagePosts}
          allCategories={allCategories}
          allDates={allDates}
          totalPosts={allMeta.length}
        />
      </Suspense>
    </div>
  );
}
