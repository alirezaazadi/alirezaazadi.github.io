import type { ChildProcess } from "child_process";

type PromptHandler = {
    resolve: (answer: string) => void;
    reject: (error: Error) => void;
};

type ActiveSession = {
    process: ChildProcess | null;
    cancelled: boolean;
};

// Use globalThis so that both /api/admin/publish and /api/admin/publish/respond
// share the exact same Maps, even if Turbopack bundles them as separate modules.
const g = globalThis as Record<string, unknown>;

if (!g.__deployPendingPrompts) {
    g.__deployPendingPrompts = new Map<string, PromptHandler>();
}
if (!g.__deployActiveSessions) {
    g.__deployActiveSessions = new Map<string, ActiveSession>();
}

export const pendingPrompts = g.__deployPendingPrompts as Map<string, PromptHandler>;
export const activeSessions = g.__deployActiveSessions as Map<string, ActiveSession>;
