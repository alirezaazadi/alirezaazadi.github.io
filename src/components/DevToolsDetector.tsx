"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/error-reporting";

/**
 * DevTools detection and anti-inspection measures.
 * Deterrent only — determined developers can bypass these.
 *
 * Features:
 * - Detects DevTools via debugger timing heuristic
 * - Blocks right-click context menu
 * - Blocks keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * - Disables text selection via CSS
 * - Reports detection events to Sentry
 */
export function DevToolsDetector() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;

        let devToolsAlerted = false;

        // ── Debugger timing detection ──
        // The `debugger` statement pauses execution when DevTools are open,
        // causing measurable delay. We check every 3 seconds.
        const detectionInterval = setInterval(() => {
            const start = performance.now();
            // eslint-disable-next-line no-debugger
            debugger;
            const elapsed = performance.now() - start;

            if (elapsed > 100 && !devToolsAlerted) {
                devToolsAlerted = true;
                reportDevToolsOpen();
            }
        }, 3000);

        // ── Report to Sentry ──
        function reportDevToolsOpen() {
            captureException(
                new Error(`[Security] DevTools opened — UA: ${navigator.userAgent}, URL: ${location.href}`)
            );
        }

        // ── Block right-click ──
        function handleContextMenu(e: MouseEvent) {
            e.preventDefault();
        }

        // ── Block DevTools keyboard shortcuts ──
        function handleKeyDown(e: KeyboardEvent) {
            // F12
            if (e.key === "F12") {
                e.preventDefault();
                return;
            }
            // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools panels)
            if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
                e.preventDefault();
                return;
            }
            // Ctrl+U (View source)
            if (e.ctrlKey && e.key.toUpperCase() === "U") {
                e.preventDefault();
                return;
            }
            // Cmd variants for Mac
            if (e.metaKey && e.altKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
                e.preventDefault();
                return;
            }
            if (e.metaKey && e.key.toUpperCase() === "U") {
                e.preventDefault();
                return;
            }
        }

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        // ── Disable text selection via CSS ──
        const style = document.createElement("style");
        style.textContent = `
            body {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            /* Allow selection in code blocks and inputs */
            pre, code, input, textarea, [contenteditable] {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
        `;
        document.head.appendChild(style);

        return () => {
            clearInterval(detectionInterval);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    }, []);

    return null;
}
