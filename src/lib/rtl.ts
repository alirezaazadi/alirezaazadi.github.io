/**
 * Detects if a string is primarily RTL text (Persian, Arabic, Hebrew, etc.)
 */
export function isRTL(text: string): boolean {
    // Remove markdown syntax, URLs, and code blocks
    const cleaned = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]*`/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[#*_~>|`\-\[\](){}]/g, "")
        .trim();

    if (!cleaned) return false;

    // Count RTL characters (Arabic, Persian, Hebrew ranges)
    const rtlChars = cleaned.match(
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g
    );
    const totalLetters = cleaned.match(/\p{L}/gu);

    if (!totalLetters || totalLetters.length === 0) return false;

    const rtlRatio = (rtlChars?.length || 0) / totalLetters.length;
    return rtlRatio > 0.3;
}

/**
 * Returns text direction based on content
 */
export function getDirection(text: string): "rtl" | "ltr" {
    return isRTL(text) ? "rtl" : "ltr";
}
