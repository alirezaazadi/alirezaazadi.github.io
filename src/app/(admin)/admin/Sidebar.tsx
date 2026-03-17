import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    FileText, Star, Settings, MessageSquare, UploadCloud,
    ChevronLeft, ChevronRight, Home, CheckCircle, AlertCircle,
    Loader2, Circle, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type StepStatus = "pending" | "running" | "done" | "error";

type DeployStep = {
    id: string;
    label: string;
    group: "pre-commit" | "git";
    status: StepStatus;
};

type ActivePrompt = {
    context: string;
    question: string;
};

const INITIAL_STEPS: DeployStep[] = [
    { id: "git-add", label: "Stage changes", group: "git", status: "pending" },
    { id: "lint-staged", label: "Strip image metadata", group: "pre-commit", status: "pending" },
    { id: "fetch-covers", label: "Fetch covers", group: "pre-commit", status: "pending" },
    { id: "remove-dangling", label: "Remove dangling images", group: "pre-commit", status: "pending" },
    { id: "stage-media", label: "Stage media files", group: "pre-commit", status: "pending" },
    { id: "git-commit", label: "Commit changes", group: "git", status: "pending" },
    { id: "git-push", label: "Push to remote", group: "git", status: "pending" },
];

function StepIcon({ status }: { status: StepStatus }) {
    switch (status) {
        case "done":
            return <CheckCircle size={14} />;
        case "running":
            return <Loader2 size={14} className="spin" />;
        case "error":
            return <AlertCircle size={14} />;
        default:
            return <Circle size={14} />;
    }
}

export function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showCommitModal, setShowCommitModal] = useState(false);
    const [commitMessage, setCommitMessage] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploySteps, setDeploySteps] = useState<DeployStep[] | null>(null);
    const [deployError, setDeployError] = useState<string | null>(null);
    const [archiveScheduled, setArchiveScheduled] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [activePrompt, setActivePrompt] = useState<ActivePrompt | null>(null);
    const [wasCancelled, setWasCancelled] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (showCommitModal) {
            requestAnimationFrame(() => textareaRef.current?.focus());
        }
    }, [showCommitModal]);

    function handlePublishClick() {
        setShowCommitModal(true);
        setCommitMessage("");
    }

    async function executePublish() {
        const msg = commitMessage.trim();
        if (!msg) return;

        setShowCommitModal(false);
        setIsDeploying(true);
        setDeployError(null);
        setArchiveScheduled(false);
        setActivePrompt(null);
        setWasCancelled(false);
        setSessionId(null);
        setDeploySteps(INITIAL_STEPS.map(s => ({ ...s, status: "pending" })));

        try {
            const res = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
            });

            if (!res.body) {
                setDeployError("No response stream");
                setIsDeploying(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const event = JSON.parse(line);

                        if (event.step === "session") {
                            setSessionId(event.sessionId);
                            continue;
                        }

                        if (event.step === "complete") {
                            if (event.error === "archive") setArchiveScheduled(true);
                            continue;
                        }

                        if (event.step === "cancelled") {
                            setWasCancelled(true);
                            setIsDeploying(false);
                            setActivePrompt(null);
                            return;
                        }

                        if (event.step === "error") {
                            setDeployError(event.error);
                            setIsDeploying(false);
                            setActivePrompt(null);
                            return;
                        }

                        if (event.prompt) {
                            setActivePrompt(event.prompt);
                        }

                        setDeploySteps(prev =>
                            prev?.map(s =>
                                s.id === event.step ? { ...s, status: event.status } : s
                            ) ?? null
                        );
                    } catch {
                        // skip malformed lines
                    }
                }
            }

            setIsDeploying(false);
            setTimeout(() => {
                setDeploySteps(null);
                setArchiveScheduled(false);
            }, 15000);
        } catch {
            setDeployError("Failed to connect to publish API");
            setIsDeploying(false);
        }
    }

    async function respondToPrompt(answer: string) {
        if (!sessionId) return;
        setActivePrompt(null);
        try {
            const res = await fetch("/api/admin/publish/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, answer }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error("[Deploy] Prompt response failed:", data);
            }
        } catch (e) {
            console.error("[Deploy] Prompt response error:", e);
        }
    }

    async function handleCancel() {
        if (!sessionId) return;
        try {
            await fetch("/api/admin/publish/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, cancel: true }),
            });
        } catch { /* best effort */ }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            executePublish();
        }
        if (e.key === "Escape") {
            setShowCommitModal(false);
        }
    }

    function dismissToast() {
        setDeploySteps(null);
        setDeployError(null);
        setArchiveScheduled(false);
        setWasCancelled(false);
        setActivePrompt(null);
    }

    const preCommitSteps = deploySteps?.filter(s => s.group === "pre-commit") ?? [];
    const gitSteps = deploySteps?.filter(s => s.group === "git") ?? [];
    const allDone = deploySteps?.every(s => s.status === "done") && !isDeploying;

    return (
        <>
        <aside style={{ width: isCollapsed ? 80 : 250, borderRight: "1px solid var(--border-color)", padding: isCollapsed ? "20px 10px" : 20, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, transition: "width 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                {!isCollapsed && <h2>Blog Admin</h2>}
                {isCollapsed && <h2 style={{ fontSize: 14, margin: "0 auto" }}>CMS</h2>}
                <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: "transparent", border: "none", color: "var(--fg-primary)", cursor: "pointer", padding: 4 }}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <Link href="/admin/posts" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Posts">
                    <FileText size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Posts</span>}
                </Link>
                <Link href="/admin/favorites" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Favorites">
                    <Star size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Favorites</span>}
                </Link>
                <Link href="/admin/config" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Site Settings">
                    <Settings size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Site Settings</span>}
                </Link>
                <Link href="/admin/suggestions" className="btn" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }} title="Suggestions">
                    <MessageSquare size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Suggestions</span>}
                </Link>
                <Link href="/" className="btn" style={{ marginTop: 20, opacity: 0.7, justifyContent: isCollapsed ? "center" : "flex-start" }} title="Back to Site">
                    <Home size={18} />
                    {!isCollapsed && <span style={{ marginLeft: 10 }}>Back to Site</span>}
                </Link>
            </nav>

            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                <div style={{ alignSelf: isCollapsed ? "center" : "flex-start" }}>
                    <ThemeToggle />
                </div>
                <button
                    className="btn"
                    onClick={handlePublishClick}
                    disabled={isDeploying}
                    style={{ width: "100%", justifyContent: "center" }}
                    title="Deploy / Publish"
                >
                    {isCollapsed
                        ? <UploadCloud size={18} />
                        : isDeploying
                            ? <><Loader2 size={16} className="spin" /> Deploying...</>
                            : "Deploy / Publish"
                    }
                </button>
            </div>

        </aside>

            {/* Commit Message Modal — portaled to body to escape aside's stacking context */}
            {showCommitModal && createPortal(
                <div className="commit-modal-overlay" onClick={() => setShowCommitModal(false)}>
                    <div className="commit-modal" onClick={e => e.stopPropagation()}>
                        <div className="commit-modal-header">
                            <UploadCloud size={20} />
                            <h3>Deploy / Publish</h3>
                        </div>
                        <p className="commit-modal-desc">Enter a commit message for this deployment</p>
                        <textarea
                            ref={textareaRef}
                            className="commit-modal-input"
                            value={commitMessage}
                            onChange={e => setCommitMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your changes..."
                            rows={3}
                        />
                        <div className="commit-modal-hint">
                            Press <kbd>⌘</kbd><kbd>Enter</kbd> to deploy
                        </div>
                        <div className="commit-modal-actions">
                            <button onClick={() => setShowCommitModal(false)} className="commit-modal-btn cancel">
                                Cancel
                            </button>
                            <button
                                onClick={executePublish}
                                className="commit-modal-btn deploy"
                                disabled={!commitMessage.trim()}
                            >
                                <UploadCloud size={16} />
                                Deploy
                            </button>
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Deploy Progress Toast — portaled to body */}
            {(deploySteps || deployError || wasCancelled) && createPortal(
                <div className="toast-container">
                    <div className="deploy-toast">
                        <div className="deploy-toast-header">
                            {wasCancelled ? (
                                <><AlertCircle size={18} color="var(--text-muted)" /><span>Deployment Cancelled</span></>
                            ) : allDone ? (
                                <><CheckCircle size={18} color="#10b981" /><span>Deployment Complete</span></>
                            ) : deployError ? (
                                <><AlertCircle size={18} color="#ef4444" /><span>Deployment Failed</span></>
                            ) : (
                                <><Loader2 size={18} className="spin" /><span>Deploying...</span></>
                            )}
                            {isDeploying ? (
                                <button onClick={handleCancel} className="deploy-toast-cancel">
                                    Cancel
                                </button>
                            ) : (
                                <button onClick={dismissToast} className="deploy-toast-close">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {deployError && (
                            <div className="deploy-toast-error">{deployError}</div>
                        )}

                        {deploySteps && (
                            <>
                                <div className="deploy-steps-group">
                                    <span className="deploy-group-label">Pre-commit</span>
                                    {preCommitSteps.map(step => (
                                        <div key={step.id} className={`deploy-step ${step.status}`}>
                                            <StepIcon status={step.status} />
                                            <span>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="deploy-steps-group">
                                    <span className="deploy-group-label">Git</span>
                                    {gitSteps.map(step => (
                                        <div key={step.id} className={`deploy-step ${step.status}`}>
                                            <StepIcon status={step.status} />
                                            <span>{step.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Interactive Prompt */}
                                {activePrompt && (
                                    <div className="deploy-prompt">
                                        {activePrompt.context && (
                                            <pre className="deploy-prompt-context">{activePrompt.context}</pre>
                                        )}
                                        <p className="deploy-prompt-question">{activePrompt.question}</p>
                                        <div className="deploy-prompt-actions">
                                            <button
                                                onClick={() => respondToPrompt("y")}
                                                className="deploy-prompt-btn confirm"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => respondToPrompt("n")}
                                                className="deploy-prompt-btn skip"
                                            >
                                                Skip
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {archiveScheduled && (
                                    <div className="deploy-toast-archive">
                                        Web archive scheduled (2 min delay)
                                    </div>
                                )}
                                {allDone && !archiveScheduled && (
                                    <div className="deploy-toast-archive">
                                        It will take a minute to go live.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
