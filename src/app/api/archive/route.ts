import { NextResponse } from "next/server";
import { siteConfig } from "@/../site.config";
import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";

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
        try {
            // Try to archive within 8 seconds so the UI can be responsive
            const res = await fetch(`https://web.archive.org/save/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
                body: new URLSearchParams({ url: targetUrl }).toString(),
                signal: AbortSignal.timeout(8000)
            });

            if (res.ok) {
                return NextResponse.json({ success: true, status: res.status });
            }

            const text = await res.text();
            const errorMsg = `Web Archive returned ${res.status}: ${text.substring(0, 100)}`;
            console.warn(`[Archive] Initial attempt: ${errorMsg}`);

            // If it's a 5xx error, throw to move to background retry
            if (res.status >= 500) {
                throw new Error(`Server returned ${res.status}`);
            }

            Sentry.captureMessage(`Web Archive Error: ${res.status}`, {
                extra: { targetUrl, status: res.status, details: text.substring(0, 200) }
            });

            return NextResponse.json({
                error: `Web Archive returned ${res.status}`,
                details: text.substring(0, 100)
            }, { status: res.status });

        } catch (err: any) {
            console.warn(`[Archive] Initial attempt failed or timed out (${err.message}). Scheduling background retries.`);
            
            // Use Next.js after() to run background retries after sending the response
            after(async () => {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        console.log(`[Archive] Background retry attempt ${attempt} for ${targetUrl}`);
                        const bgRes = await fetch(`https://web.archive.org/save/`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                            },
                            body: new URLSearchParams({ url: targetUrl }).toString(),
                            signal: AbortSignal.timeout(15000)
                        });
                        
                        if (bgRes.ok) {
                            console.log(`[Archive] Background archive successful for ${targetUrl}`);
                            return;
                        }
                        console.warn(`[Archive] Background attempt ${attempt} returned ${bgRes.status}`);
                        if (bgRes.status < 500 && bgRes.status !== 429) {
                            return; // Stop retrying on 4xx client errors (except 429)
                        }
                    } catch (bgErr: any) {
                        console.warn(`[Archive] Background attempt ${attempt} failed: ${bgErr.message}`);
                        if (attempt === 3) {
                            Sentry.captureException(bgErr, { extra: { targetUrl, msg: "All background archive attempts failed" } });
                        }
                    }
                    if (attempt < 3) await new Promise(r => setTimeout(r, 5000 * attempt));
                }
            });

            return NextResponse.json({ 
                success: true, 
                triggered: true, 
                message: "Archiving is taking longer than expected and has been moved to the background." 
            });
        }
    } catch (error: any) {
        Sentry.captureException(error);
        return NextResponse.json({ error: error.message || "Archive request failed" }, { status: 500 });
    }
}
