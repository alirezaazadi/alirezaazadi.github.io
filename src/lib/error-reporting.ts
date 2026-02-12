/**
 * Lightweight error reporting.
 * In production: sends errors to Sentry (if DSN configured).
 * In development: logs errors to console.
 */

const isDev = process.env.NODE_ENV !== "production";

let sentryInitialized = false;

/**
 * Initialize Sentry error reporting (no-op in dev or if DSN not set).
 */
export function initErrorReporting() {
    if (isDev || sentryInitialized) return;
    if (typeof window === "undefined") return;

    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    try {
        // Set up global error handler that sends to Sentry
        window.addEventListener("error", (event) => {
            sendToSentry(dsn, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
            });
        });

        window.addEventListener("unhandledrejection", (event) => {
            sendToSentry(dsn, {
                message: `Unhandled promise rejection: ${event.reason}`,
                stack: event.reason?.stack,
            });
        });

        sentryInitialized = true;
    } catch {
        // If Sentry init fails, just continue silently
    }
}

/**
 * Send an error event to Sentry using the Envelope API.
 */
function sendToSentry(
    dsn: string,
    error: { message: string; filename?: string; lineno?: number; colno?: number; stack?: string }
) {
    try {
        const url = new URL(dsn);
        const projectId = url.pathname.replace("/", "");
        const publicKey = url.username;
        const host = url.host;

        const envelope = JSON.stringify({
            event_id: crypto.randomUUID().replace(/-/g, ""),
            sent_at: new Date().toISOString(),
            sdk: { name: "custom", version: "1.0.0" },
        }) + "\n" +
            JSON.stringify({ type: "event" }) + "\n" +
            JSON.stringify({
                exception: {
                    values: [{
                        type: "Error",
                        value: error.message,
                        stacktrace: error.stack ? { frames: [{ filename: error.filename || "unknown", function: "unknown", lineno: error.lineno, colno: error.colno }] } : undefined,
                    }],
                },
                platform: "javascript",
                environment: process.env.NODE_ENV || "production",
                request: {
                    url: window.location.href,
                    headers: { "User-Agent": navigator.userAgent },
                },
                timestamp: Date.now() / 1000,
            });

        fetch(`https://${host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`, {
            method: "POST",
            body: envelope,
        }).catch(() => {
            // Silently fail if Sentry is unreachable
        });
    } catch {
        // Silently fail
    }
}

/**
 * Capture and report an exception.
 * In dev: logs to console. In prod: sends to Sentry.
 */
export function captureException(error: unknown) {
    if (isDev) {
        console.error("[Dev Error]", error);
        return;
    }

    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    sendToSentry(dsn, { message, stack });
}
