import { NextResponse } from "next/server";
import { siteConfig } from "@/../site.config";

export async function POST(req: Request) {
    try {
        const { slug } = await req.json();

        if (!slug || typeof slug !== "string") {
            return NextResponse.json({ error: "Slug is required." }, { status: 400 });
        }

        // If site is running on localhost, archive.org won't be able to crawl it
        if (siteConfig.url.includes("localhost") || siteConfig.url.includes("127.0.0.1")) {
            console.warn(`[Archive] Skipping for ${siteConfig.url} (localhost)`);
            return NextResponse.json({
                warning: "Archiving is disabled for localhost. Web Archive cannot crawl local URLs.",
                success: true
            });
        }

        const targetUrl = `${siteConfig.url}/post/${slug}`;
        console.log(`[Archive] Manually triggering for ${targetUrl}`);

        try {
            const res = await fetch(`https://web.archive.org/save/${targetUrl}`);

            if (res.ok) {
                return NextResponse.json({ success: true, status: res.status });
            } else {
                const text = await res.text();
                return NextResponse.json({
                    error: `Web Archive returned ${res.status}`,
                    details: text.substring(0, 100)
                }, { status: res.status });
            }
        } catch (err: any) {
            return NextResponse.json({ error: "Failed to connect to Web Archive", details: err.message }, { status: 502 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Archive request failed" }, { status: 500 });
    }
}
