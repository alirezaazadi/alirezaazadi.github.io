import { buildRssFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  return buildRssFeed("fa");
}
