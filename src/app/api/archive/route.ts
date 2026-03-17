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
        console.log(`[Archive] Checking availability and triggering for ${targetUrl}`);

        // 1. Check Availability API first to see if it was archived recently
        try {
            const availRes = await fetch(`https://archive.org/wayback/available?url=${targetUrl}`, {
                next: { revalidate: 0 }
            });
            if (availRes.ok) {
                const data = await availRes.json();
                const snapshot = data.archived_snapshots?.closest;
                if (snapshot && snapshot.available) {
                    // If archived in the last hour, consider it "done"
                    const timestamp = snapshot.timestamp; // YYYYMMDDhhmmss
                    const year = parseInt(timestamp.substring(0, 4));
                    const month = parseInt(timestamp.substring(4, 6)) - 1;
                    const day = parseInt(timestamp.substring(6, 8));
                    const hour = parseInt(timestamp.substring(8, 10));
                    const archiveDate = new Date(Date.UTC(year, month, day, hour));
                    const now = new Date();
                    
                    if (now.getTime() - archiveDate.getTime() < 3600000) {
                        return NextResponse.json({ 
                            success: true, 
                            alreadyArchived: true, 
                            url: snapshot.url 
                        });
                    }
                }
            }
        } catch (e) {
            console.warn("[Archive] Availability check failed, proceeding anyway", e);
        }

        // 2. Trigger Archival via SPN 2.0 (POST)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000); // Server-side timeout (50s)

        // We'll return to the client after 10s if IA is still pending
        const clientTimeoutId = setTimeout(() => {}, 10000); 

        try {
            // Start the fetch but don't strictly await it if it takes too long for the client
            const archivePromise = fetch(`https://web.archive.org/save/`, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
                body: new URLSearchParams({ url: targetUrl }).toString()
            });

            // Race the archive promise against a 10s "slow connection" timer
            const result = await Promise.race([
                archivePromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("SLOW_CONNECTION")), 10000))
            ]) as Response;

            clearTimeout(timeoutId);

            if (result.ok) {
                return NextResponse.json({ success: true, status: result.status });
            } else {
                const text = await result.text();
                const errorMsg = `Web Archive returned ${result.status}: ${text.substring(0, 100)}`;
                console.error(`[Archive] Error: ${errorMsg}`);
                
                Sentry.captureMessage(`Web Archive Error: ${result.status}`, {
                    extra: { targetUrl, status: result.status, details: text.substring(0, 200) }
                });

                return NextResponse.json({
                    error: `Web Archive returned ${result.status}`,
                    details: text.substring(0, 100)
                }, { status: result.status });
            }
        } catch (err: any) {
            if (err.message === "SLOW_CONNECTION") {
                console.log(`[Archive] Slow connection for ${targetUrl}, returning 'triggered' to client`);
                return NextResponse.json({ 
                    success: true, 
                    triggered: true, 
                    message: "Archiving has been triggered and is running in the background." 
                });
            }

            clearTimeout(timeoutId);
            const isTimeout = err.name === 'AbortError';
            const message = isTimeout ? "Request timed out after 50s" : err.message;
            
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
