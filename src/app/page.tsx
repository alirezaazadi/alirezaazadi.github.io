import { Suspense } from "react";
import { getAllPostsMeta } from "@/lib/posts";
import { extractCategories, extractPostDates } from "@/lib/post-utils";
import { PostList } from "@/components/PostList";
import { siteConfig } from "../../site.config";

import { getLanguage } from "@/lib/i18n";

export default async function HomePage() {
  const lang = await getLanguage();
  const allMeta = await getAllPostsMeta(false, lang);

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
          key={lang}
          initialPosts={firstPagePosts}
          allCategories={allCategories}
          allDates={allDates}
          totalPosts={allMeta.length}
        />
      </Suspense>
    </div>
  );
}
