import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

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

        return NextResponse.json({ success: true, stdout: pushResult.stdout });
    } catch (error: any) {
        console.error("Publish error:", error);
        return NextResponse.json({ error: error.message || "Failed to publish" }, { status: 500 });
    }
}
