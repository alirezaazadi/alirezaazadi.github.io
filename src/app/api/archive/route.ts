import { NextResponse } from "next/server";
import { siteConfig } from "@/../site.config";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
    try {
        const { slug } = await req.json();

        if (!slug || typeof slug !== "string") {
            return NextResponse.json({ error: "Slug is required." }, { status: 400 });
        }

        // Check if running on localhost
        if (siteConfig.url.includes("localhost") || siteConfig.url.includes("127.0.0.1")) {
            console.warn(`[Archive] Skipping for ${siteConfig.url} (localhost)`);
            return NextResponse.json({
                warning: "Archiving is disabled for localhost. Web Archive cannot crawl local URLs.",
                success: true
            });
        }

        const targetUrl = `${siteConfig.url}/post/${slug}`;
        console.log(`[Archive] Manually triggering for ${targetUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const res = await fetch(`https://web.archive.org/save/${targetUrl}`, {
                signal: controller.signal,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
                }
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                return NextResponse.json({ success: true, status: res.status });
            } else {
                const text = await res.text();
                const errorMsg = `Web Archive returned ${res.status}: ${text.substring(0, 100)}`;
                console.error(`[Archive] Error: ${errorMsg}`);
                
                Sentry.captureMessage(`Web Archive Error: ${res.status}`, {
                    extra: { targetUrl, status: res.status, details: text.substring(0, 200) }
                });

                return NextResponse.json({
                    error: `Web Archive returned ${res.status}`,
                    details: text.substring(0, 100)
                }, { status: res.status });
            }
        } catch (err: any) {
            clearTimeout(timeoutId);
            const isTimeout = err.name === 'AbortError';
            const message = isTimeout ? "Request timed out after 15s" : err.message;
            
            console.error(`[Archive] Connection failed: ${message}`);
            Sentry.captureException(err, {
                extra: { targetUrl, isTimeout }
            });

            return NextResponse.json({ 
                error: isTimeout ? "Web Archive is taking too long to respond." : "Failed to connect to Web Archive", 
                details: message 
            }, { status: isTimeout ? 504 : 502 });
        }
    } catch (error: any) {
        Sentry.captureException(error);
        return NextResponse.json({ error: error.message || "Archive request failed" }, { status: 500 });
    }
}
