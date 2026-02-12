"use client";

import { useState, useEffect } from "react";
import { TerminalSquare, ChevronUp } from "lucide-react";
import { Terminal } from "./Terminal";

export function TerminalButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            // Ctrl+` or Cmd+` to toggle terminal
            if ((e.ctrlKey || e.metaKey) && e.key === "`") {
                e.preventDefault();
                if (isMinimized) {
                    setIsMinimized(false);
                    setIsOpen(true);
                } else {
                    setIsOpen((prev) => !prev);
                }
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isMinimized]);

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsOpen(false);
        setIsMinimized(true);
    };

    const handleRestore = () => {
        setIsMinimized(false);
        setIsOpen(true);
    };

    return (
        <>
            <button
                className="terminal-toggle-btn"
                onClick={() => setIsOpen(true)}
                title="Open terminal (Ctrl+`)"
                aria-label="Open terminal"
            >
                <TerminalSquare size={18} />
            </button>
            <Terminal
                isOpen={isOpen}
                onClose={handleClose}
                onMinimize={handleMinimize}
            />
            {isMinimized && (
                <button
                    className="terminal-minimized-bar"
                    onClick={handleRestore}
                    title="Restore terminal"
                    aria-label="Restore terminal"
                >
                    <TerminalSquare size={14} />
                    <span>Terminal</span>
                    <ChevronUp size={14} />
                </button>
            )}
        </>
    );
}
