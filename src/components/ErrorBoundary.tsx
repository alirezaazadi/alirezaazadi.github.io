"use client";

import React from "react";
import { captureException } from "@/lib/error-reporting";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

const isDev = process.env.NODE_ENV !== "production";

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        captureException(error);
        if (isDev) {
            console.error("ErrorBoundary caught:", error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (isDev) {
                return (
                    <div style={{
                        padding: "24px",
                        margin: "24px",
                        background: "#1a1b26",
                        border: "1px solid #f7768e",
                        borderRadius: "8px",
                        color: "#f7768e",
                        fontFamily: "monospace",
                        fontSize: "13px",
                    }}>
                        <h2 style={{ margin: "0 0 12px", color: "#f7768e" }}>
                            ⚠ Development Error
                        </h2>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {this.state.error?.stack || this.state.error?.message}
                        </pre>
                    </div>
                );
            }

            return (
                <div style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "var(--text-secondary, #888)",
                }}>
                    <p>Something went wrong. Please try refreshing the page.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
