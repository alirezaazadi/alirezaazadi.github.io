"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "../../site.config";

interface PostEntry {
    slug: string;
    title: string;
    summary: string;
    date: string;
    categories: string[];
}

interface FavItem {
    title: string;
    subtitle: string;
    url: string;
}

interface FSData {
    posts: PostEntry[];
    favorites: {
        books: FavItem[];
        music: FavItem[];
        podcasts: FavItem[];
        movies: FavItem[];
        playlists: FavItem[];
        magazines: FavItem[];
    };
    about: string;
    contact: Record<string, string>;
}

interface OutputLine {
    text: string;
    type: "output" | "command" | "error" | "info";
}

const WELCOME = [
    "Welcome to Alireza's terminal. Type 'help' for available commands.",
    "",
];

export function Terminal({ isOpen, onClose, onMinimize }: { isOpen: boolean; onClose: () => void; onMinimize: () => void }) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<OutputLine[]>(
        WELCOME.map((t) => ({ text: t, type: "info" as const }))
    );
    const [cwd, setCwd] = useState("~");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const [fsData, setFsData] = useState<FSData | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch FS data when terminal opens
    useEffect(() => {
        if (isOpen && !fsData) {
            fetch("/api/terminal")
                .then((r) => r.json())
                .then(setFsData)
                .catch(() =>
                    setOutput((prev) => [
                        ...prev,
                        { text: "Error: failed to load file system data.", type: "error" },
                    ])
                );
        }
    }, [isOpen, fsData]);

    // Focus input when terminal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Scroll to bottom on new output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // Global Keydown for Escape (to close terminal even if input not focused)
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const getDirEntries = useCallback((): string[] => {
        if (cwd === "~") return ["posts/", "favorites/", "about/", "contact/"];
        if (cwd === "~/posts") return (fsData?.posts || []).map((p) => p.slug + ".md");
        if (cwd === "~/favorites") return ["books/", "music/", "podcasts/", "movies/", "playlists/", "magazines/"];
        if (cwd.startsWith("~/favorites/")) {
            const sub = cwd.split("/").pop() as keyof FSData["favorites"];
            const items = fsData?.favorites?.[sub];
            if (items) return items.map((i) => i.title);
        }
        return [];
    }, [cwd, fsData]);

    const enabledCmds = siteConfig.terminalCommands?.length
        ? siteConfig.terminalCommands
        : ["help", "ls", "cd", "cat", "grep", "favs", "whoami", "clear", "exit"];

    const handleCommand = useCallback(
        (raw: string) => {
            const trimmed = raw.trim();
            if (!trimmed) return;

            setHistory((prev) => [...prev, trimmed]);
            setHistoryIdx(-1);
            setOutput((prev) => [...prev, { text: `${cwd} $ ${trimmed}`, type: "command" }]);

            const [cmd, ...args] = trimmed.split(/\s+/);
            const arg = args.join(" ");
            const cmdLower = cmd.toLowerCase();

            if (cmdLower !== "help" && !enabledCmds.includes(cmdLower)) {
                setOutput((prev) => [
                    ...prev,
                    { text: `Command disabled: ${cmd}. Type 'help' for available commands.`, type: "error" },
                ]);
                return;
            }

            switch (cmdLower) {
                case "help": {
                    const allHelp: Record<string, string> = {
                        ls: "  ls             List directory contents",
                        cd: "  cd <dir>       Change directory (cd .., cd posts)",
                        cat: "  cat <file>     Open a post or show file contents",
                        grep: "  grep <term>    Search posts by keyword",
                        favs: "  favs [section] List favorites (all or by section)",
                        whoami: "  whoami         Display user info",
                        clear: "  clear          Clear terminal",
                        exit: "  exit           Close terminal",
                    };
                    const lines = [
                        "Available commands:",
                        ...enabledCmds.filter(c => c !== "help").map(c => allHelp[c]).filter(Boolean),
                        "",
                        "Tab to autocomplete. ↑/↓ for command history.",
                    ];
                    setOutput((prev) => [...prev, ...lines.map((t) => ({ text: t, type: "output" as const }))]);
                    break;
                }

                case "ls": {
                    const entries = getDirEntries();
                    if (entries.length === 0) {
                        setOutput((prev) => [...prev, { text: "(empty)", type: "output" }]);
                    } else {
                        const formatted = entries.join("  ");
                        setOutput((prev) => [...prev, { text: formatted, type: "output" }]);
                    }
                    break;
                }

                case "cd": {
                    if (!arg || arg === "~") {
                        setCwd("~");
                    } else if (arg === "..") {
                        if (cwd === "~") {
                            setOutput((prev) => [...prev, { text: "Already at root.", type: "info" }]);
                        } else {
                            const parts = cwd.split("/");
                            parts.pop();
                            setCwd(parts.join("/") || "~");
                        }
                    } else {
                        const target = arg.replace(/\/$/, "");
                        const validDirs: Record<string, string[]> = {
                            "~": ["posts", "favorites", "about", "contact"],
                            "~/favorites": ["books", "music", "podcasts", "movies", "playlists", "magazines"],
                        };
                        const allowed = validDirs[cwd];
                        if (allowed && allowed.includes(target)) {
                            setCwd(`${cwd}/${target}`);
                        } else {
                            setOutput((prev) => [
                                ...prev,
                                { text: `cd: no such directory: ${arg}`, type: "error" },
                            ]);
                        }
                    }
                    break;
                }

                case "cat": {
                    if (!arg) {
                        setOutput((prev) => [...prev, { text: "Usage: cat <filename>", type: "error" }]);
                        break;
                    }
                    const slug = arg.replace(/\.md$/, "");

                    // If in posts directory or at root, try to open a post
                    if (cwd === "~/posts" || cwd === "~") {
                        const post = fsData?.posts.find(
                            (p) => p.slug === slug || p.slug === arg
                        );
                        if (post) {
                            setOutput((prev) => [
                                ...prev,
                                { text: `Opening: ${post.title}...`, type: "info" },
                            ]);
                            setTimeout(() => {
                                router.push(`/post/${post.slug}`);
                                onClose();
                            }, 300);
                        } else {
                            setOutput((prev) => [
                                ...prev,
                                { text: `cat: ${arg}: No such file`, type: "error" },
                            ]);
                        }
                    } else if (cwd === "~/about") {
                        setOutput((prev) => [
                            ...prev,
                            { text: fsData?.about || "No about info.", type: "output" },
                        ]);
                    } else if (cwd === "~/contact") {
                        const links = fsData?.contact || {};
                        const lines = Object.entries(links).map(
                            ([k, v]) => `${k}: ${v}`
                        );
                        setOutput((prev) => [
                            ...prev,
                            ...lines.map((t) => ({ text: t, type: "output" as const })),
                        ]);
                    } else {
                        setOutput((prev) => [
                            ...prev,
                            { text: `cat: not available in this directory`, type: "error" },
                        ]);
                    }
                    break;
                }

                case "grep": {
                    if (!arg) {
                        setOutput((prev) => [...prev, { text: "Usage: grep <keyword>", type: "error" }]);
                        break;
                    }
                    const term = arg.toLowerCase();
                    const matches = (fsData?.posts || []).filter(
                        (p) =>
                            p.title.toLowerCase().includes(term) ||
                            p.summary.toLowerCase().includes(term) ||
                            p.categories.some((c) => c.toLowerCase().includes(term))
                    );
                    if (matches.length === 0) {
                        setOutput((prev) => [
                            ...prev,
                            { text: `No posts matching "${arg}".`, type: "info" },
                        ]);
                    } else {
                        const lines = matches.map(
                            (p) => `  ${p.slug}.md — ${p.title}`
                        );
                        setOutput((prev) => [
                            ...prev,
                            { text: `Found ${matches.length} match(es):`, type: "info" },
                            ...lines.map((t) => ({ text: t, type: "output" as const })),
                        ]);
                    }
                    break;
                }

                case "favs": {
                    const sectionIcons: Record<string, string> = {
                        books: "📚",
                        music: "🎵",
                        podcasts: "🎙️",
                        movies: "🎬",
                        playlists: "📋",
                        magazines: "📰",
                    };
                    const allSections = Object.keys(sectionIcons) as (keyof FSData["favorites"])[];
                    const requestedSection = arg?.toLowerCase();
                    const sections = requestedSection
                        ? allSections.filter((s) => s === requestedSection)
                        : allSections;

                    if (requestedSection && sections.length === 0) {
                        setOutput((prev) => [
                            ...prev,
                            { text: `Unknown section: ${arg}. Available: ${allSections.join(", ")}`, type: "error" },
                        ]);
                    } else {
                        const lines: OutputLine[] = [];
                        for (const section of sections) {
                            const items = fsData?.favorites?.[section] || [];
                            if (items.length === 0) continue;
                            const icon = sectionIcons[section] || "";
                            lines.push({ text: "", type: "output" });
                            lines.push({ text: `${icon}  ${section.toUpperCase()}`, type: "info" });
                            lines.push({ text: "─".repeat(30), type: "output" });
                            for (const item of items) {
                                const sub = item.subtitle ? ` — ${item.subtitle}` : "";
                                lines.push({ text: `  ${item.title}${sub}`, type: "output" });
                                if (item.url) {
                                    lines.push({ text: `    ↳ ${item.url}`, type: "info" });
                                }
                            }
                        }
                        if (lines.length === 0) {
                            lines.push({ text: "No favorites found.", type: "info" });
                        }
                        setOutput((prev) => [...prev, ...lines]);
                    }
                    break;
                }

                case "whoami": {
                    setOutput((prev) => [
                        ...prev,
                        { text: "Alireza Azadi", type: "output" },
                        { text: "An observer, a sojourner, an Ibn us-Sabiil.", type: "output" },
                    ]);
                    break;
                }

                case "clear": {
                    setOutput([]);
                    break;
                }

                case "exit": {
                    onClose();
                    break;
                }

                default: {
                    setOutput((prev) => [
                        ...prev,
                        { text: `Command not found: ${cmd}. Type 'help' for available commands.`, type: "error" },
                    ]);
                }
            }
        },
        [cwd, fsData, getDirEntries, onClose, router, enabledCmds]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleCommand(input);
            setInput("");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
                setHistoryIdx(newIdx);
                setInput(history[newIdx]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIdx !== -1) {
                const newIdx = historyIdx + 1;
                if (newIdx >= history.length) {
                    setHistoryIdx(-1);
                    setInput("");
                } else {
                    setHistoryIdx(newIdx);
                    setInput(history[newIdx]);
                }
            }
        } else if (e.key === "Tab") {
            e.preventDefault();
            // Autocomplete
            const entries = getDirEntries();
            const partial = input.split(/\s+/).pop() || "";
            if (partial) {
                const matches = entries.filter((ent) =>
                    ent.toLowerCase().startsWith(partial.toLowerCase())
                );
                if (matches.length === 1) {
                    const parts = input.split(/\s+/);
                    parts[parts.length - 1] = matches[0];
                    setInput(parts.join(" "));
                } else if (matches.length > 1) {
                    setOutput((prev) => [
                        ...prev,
                        { text: matches.join("  "), type: "output" },
                    ]);
                }
            }
        } else if (e.key === "Escape") {
            onClose();
        } else if (e.key === "c" && e.ctrlKey) {
            e.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="terminal-overlay" onClick={onClose}>
            <div className="terminal-window" onClick={(e) => e.stopPropagation()}>
                <div className="terminal-header">
                    <div className="terminal-dots">
                        <span className="dot dot-red" onClick={onClose} title="Close" />
                        <span className="dot dot-yellow" onClick={onMinimize} title="Minimize" />
                        <span className="dot dot-green" />
                    </div>
                    <span className="terminal-title">alireza@blog: {cwd}</span>
                </div>
                <div className="terminal-body" ref={outputRef} onClick={() => inputRef.current?.focus()}>
                    {output.map((line, i) => (
                        <div
                            key={i}
                            className={`terminal-line terminal-line--${line.type}`}
                        >
                            {line.text}
                        </div>
                    ))}
                    <div className="terminal-input-row">
                        <span className="terminal-prompt">{cwd} $&nbsp;</span>
                        <input
                            ref={inputRef}
                            className="terminal-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
