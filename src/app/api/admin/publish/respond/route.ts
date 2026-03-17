import { NextResponse } from "next/server";
import { pendingPrompts, activeSessions } from "@/lib/deploy-session";

export async function POST(req: Request) {
    const { sessionId, answer, cancel } = await req.json();

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    if (cancel) {
        const session = activeSessions.get(sessionId);
        if (session) {
            session.cancelled = true;
            session.process?.kill("SIGTERM");
        }
        const pending = pendingPrompts.get(sessionId);
        if (pending) {
            pending.reject(new Error("Deployment cancelled"));
            pendingPrompts.delete(sessionId);
        }
        return NextResponse.json({ ok: true });
    }

    const pending = pendingPrompts.get(sessionId);
    if (!pending) {
        return NextResponse.json({ error: "No pending prompt" }, { status: 404 });
    }

    pending.resolve(answer || "n");
    pendingPrompts.delete(sessionId);
    return NextResponse.json({ ok: true });
}
