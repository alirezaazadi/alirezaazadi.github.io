import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { siteConfig } from "../../../../../site.config";
import { pendingPrompts, activeSessions } from "@/lib/deploy-session";

type StepEvent = {
    step: string;
    status: "running" | "done" | "error";
    error?: string;
    sessionId?: string;
    prompt?: { context: string; question: string };
};

function generateSessionId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function execTracked(
    command: string,
    cwd: string,
    sessionId: string,
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const session = activeSessions.get(sessionId);
        if (session?.cancelled) {
            reject(new Error("Deployment cancelled"));
            return;
        }

        const proc = exec(command, { cwd }, (error, stdout, stderr) => {
            if (session) session.process = null;
            if (error) {
                (error as any).stdout = stdout;
                (error as any).stderr = stderr;
                reject(error);
            } else {
                resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
            }
        });

        if (session) session.process = proc;
    });
}

const PROMPT_PATTERN = /\([yYnN]\/[yYnN]\)\s*:?\s*$/;

function spawnInteractive(
    command: string,
    args: string[],
    cwd: string,
    sessionId: string,
    send: (event: StepEvent) => void,
    stepId: string,
): Promise<{ stdout: string; code: number }> {
    return new Promise((resolve, reject) => {
        const session = activeSessions.get(sessionId);
        if (session?.cancelled) {
            reject(new Error("Deployment cancelled"));
            return;
        }

        const proc = spawn(command, args, {
            cwd,
            env: { ...process.env, NON_INTERACTIVE: "1" },
        });

        if (session) session.process = proc;

        let stdout = "";
        let promptBuffer = "";
        let killed = false;

        proc.stdout?.on("data", (data: Buffer) => {
            const text = data.toString();
            stdout += text;
            promptBuffer += text;

            if (PROMPT_PATTERN.test(promptBuffer)) {
                const lines = promptBuffer.trim().split("\n");
                const questionLine = lines[lines.length - 1].trim();
                const contextLines = lines.slice(0, -1).filter(l => l.trim()).join("\n");

                send({
                    step: stepId,
                    status: "running",
                    prompt: { context: contextLines, question: questionLine },
                    sessionId,
                });

                new Promise<string>((res, rej) => {
                    pendingPrompts.set(sessionId, { resolve: res, reject: rej });
                })
                    .then(answer => {
                        pendingPrompts.delete(sessionId);
                        proc.stdin?.write(answer + "\n");
                        promptBuffer = "";
                    })
                    .catch(() => {
                        killed = true;
                        proc.kill("SIGTERM");
                    });
            }
        });

        let stderr = "";
        proc.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        proc.on("close", (code) => {
            if (session) session.process = null;
            if (killed || session?.cancelled) {
                reject(new Error("Deployment cancelled"));
            } else if (code !== 0 && code !== null) {
                const err = new Error(`Process exited with code ${code}: ${stderr}`);
                (err as any).stdout = stdout;
                (err as any).stderr = stderr;
                reject(err);
            } else {
                resolve({ stdout, code: code ?? 0 });
            }
        });

        proc.on("error", (err) => {
            if (session) session.process = null;
            reject(err);
        });
    });
}

export async function POST(req: Request) {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const cwd = process.cwd();
    const encoder = new TextEncoder();
    const sessionId = generateSessionId();
    activeSessions.set(sessionId, { process: null, cancelled: false });

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: StepEvent) => {
                controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
            };

            const checkCancelled = () => {
                const session = activeSessions.get(sessionId);
                if (session?.cancelled) throw new Error("Deployment cancelled");
            };

            send({ step: "session", status: "running", sessionId });

            try {
                checkCancelled();
                send({ step: "git-add", status: "running" });
                await execTracked("git add -A", cwd, sessionId);
                send({ step: "git-add", status: "done" });

                checkCancelled();
                send({ step: "lint-staged", status: "running" });
                try {
                    await execTracked("npx lint-staged", cwd, sessionId);
                } catch (e: any) {
                    if (e.message === "Deployment cancelled") throw e;
                }
                send({ step: "lint-staged", status: "done" });

                checkCancelled();
                send({ step: "fetch-covers", status: "running" });
                await execTracked("node scripts/fetch-covers.mjs", cwd, sessionId);
                send({ step: "fetch-covers", status: "done" });

                checkCancelled();
                send({ step: "remove-dangling", status: "running" });
                await spawnInteractive(
                    "node", ["scripts/remove-dangling-images.mjs"],
                    cwd, sessionId, send, "remove-dangling",
                );
                send({ step: "remove-dangling", status: "done" });

                checkCancelled();
                send({ step: "stage-media", status: "running" });
                try {
                    await execTracked("git add public/media", cwd, sessionId);
                } catch (e: any) {
                    if (e.message === "Deployment cancelled") throw e;
                }
                send({ step: "stage-media", status: "done" });

                checkCancelled();
                send({ step: "git-commit", status: "running" });
                const escapedMessage = message.replace(/"/g, '\\"');
                try {
                    await execTracked(`git commit --no-verify -m "${escapedMessage}"`, cwd, sessionId);
                } catch (e: any) {
                    if (e.message === "Deployment cancelled") throw e;
                    if (!e.stdout?.includes("nothing to commit")) throw e;
                }
                send({ step: "git-commit", status: "done" });

                checkCancelled();
                send({ step: "git-push", status: "running" });
                await execTracked("git push", cwd, sessionId);
                send({ step: "git-push", status: "done" });

                // Process Archive Queue
                const queuePath = path.join(cwd, "content", ".archive-queue.json");
                let archiveScheduled = false;
                try {
                    const q = await fs.readFile(queuePath, "utf-8");
                    const queue: string[] = JSON.parse(q);
                    if (queue.length > 0) {
                        archiveScheduled = true;
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
                        }, 120000);
                        await fs.writeFile(queuePath, "[]", "utf-8");
                    }
                } catch {
                    // queue file may not exist
                }

                send({
                    step: "complete",
                    status: "done",
                    ...(archiveScheduled ? { error: "archive" } : {}),
                });
            } catch (error: any) {
                const isCancelled = error.message === "Deployment cancelled";
                send({
                    step: isCancelled ? "cancelled" : "error",
                    status: "error",
                    error: error.message || "Unknown error",
                });
            }

            activeSessions.delete(sessionId);
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}
