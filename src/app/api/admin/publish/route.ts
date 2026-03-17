import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { siteConfig } from "../../../../../site.config";

const execAsync = promisify(exec);

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        
        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required." }, { status: 400 });
        }

        const cwd = process.cwd();

        // 1. Git Add
        await execAsync("git add -A", { cwd });

        // 2. Git Commit
        // Escape the message to prevent command injection
        const escapedMessage = message.replace(/"/g, '\\"');
        try {
            await execAsync(`git commit -m "${escapedMessage}"`, { cwd });
        } catch (e: any) {
             // If nothing to commit, git returns an error code. We can still try to push.
             if (!e.stdout.includes("nothing to commit")) {
                 throw e;
             }
        }

        // 3. Git Push
        const pushResult = await execAsync("git push", { cwd });

        // 4. Process Archive Queue
        const queuePath = path.join(cwd, "content", ".archive-queue.json");
        try {
            const q = await fs.readFile(queuePath, "utf-8");
            const queue: string[] = JSON.parse(q);
            if (queue.length > 0) {
                // Wait 60 seconds to allow for Vercel/GitHub pages deployment
                setTimeout(async () => {
                    for (const slug of queue) {
                        const targetUrl = `${siteConfig.url}/post/${slug}`;
                        try {
                            const r = await fetch(`https://web.archive.org/save/${targetUrl}`);
                            console.log(`[Archive] Triggered for ${targetUrl}: ${r.status}`);
                        } catch (err) {
                            console.error(`[Archive] Failed:`, err);
                        }
                    }
                }, 60000);
                // Clear the queue
                await fs.writeFile(queuePath, "[]", "utf-8");
            }
        } catch (e) {
            // Ignore if queue file doesn't exist
        }

        return NextResponse.json({ success: true, stdout: pushResult.stdout });
    } catch (error: any) {
        console.error("Publish error:", error);
        return NextResponse.json({ error: error.message || "Failed to publish" }, { status: 500 });
    }
}
