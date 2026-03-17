import { NextRequest, NextResponse } from "next/server";

// Language name → Google Translate language code mapping
const LANG_CODES: Record<string, string> = {
    English: "en",
    French: "fr",
    German: "de",
    Spanish: "es",
    Arabic: "ar",
    Turkish: "tr",
    Persian: "fa",
    Chinese: "zh",
    Japanese: "ja",
    Korean: "ko",
    Russian: "ru",
    Portuguese: "pt",
    Italian: "it",
    Dutch: "nl",
    Hindi: "hi",
};

/**
 * Fallback translation using free Google Translate endpoint.
 * This is unofficial and best-effort — may be rate-limited.
 */
async function googleTranslateFallback(text: string, targetLang: string): Promise<string> {
    const langCode = LANG_CODES[targetLang] || targetLang.toLowerCase().slice(0, 2);

    // Google Translate has a ~5000 char limit per request, so chunk if needed
    const maxChunkSize = 4500;
    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxChunkSize) {
            chunks.push(remaining);
            break;
        }
        // Try to break at a newline
        let breakPoint = remaining.lastIndexOf("\n", maxChunkSize);
        if (breakPoint < maxChunkSize * 0.5) breakPoint = maxChunkSize;
        chunks.push(remaining.slice(0, breakPoint));
        remaining = remaining.slice(breakPoint);
    }

    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(langCode)}&dt=t&q=${encodeURIComponent(chunk)}`;

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Google Translate returned ${res.status}`);
        }

        const data = await res.json();
        // Response format: [[["translated text", "original text", ...],...],...]
        const translated = (data[0] as Array<[string]>)
            .map((segment: [string]) => segment[0])
            .join("");
        translatedChunks.push(translated);
    }

    return translatedChunks.join("");
}

// ---- Rate limiting (in-memory, per IP) ----
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
}

// Allowed target languages
const ALLOWED_LANGS = new Set(Object.keys(LANG_CODES));

export async function POST(request: NextRequest) {
    try {
        // Rate limit by IP
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const { text, targetLang, model = "gemma-3-4b-it" } = await request.json();

        if (!text || !targetLang) {
            return NextResponse.json(
                { error: "Missing text or targetLang" },
                { status: 400 }
            );
        }

        // Validate target language
        if (!ALLOWED_LANGS.has(targetLang)) {
            return NextResponse.json(
                { error: "Unsupported target language" },
                { status: 400 }
            );
        }

        // Sanitize input — strip script tags
        const sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

        // Truncate very long texts to stay within limits
        const maxChars = 10000;
        const truncated = sanitized.length > maxChars ? sanitized.substring(0, maxChars) + "\n\n[... truncated]" : sanitized;

        // Extract code blocks so they're never translated
        const codeBlocks: string[] = [];
        const textWithPlaceholders = truncated.replace(
            /(```[\s\S]*?```|`[^`\n]+`)/g,
            (match: string) => {
                codeBlocks.push(match);
                return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
            }
        );

        // Re-insert code blocks after translation
        function restoreCodeBlocks(translated: string): string {
            return translated.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)] || _);
        }

        // Handle explicit Google Translate selection
        if (model === "google-translate") {
            try {
                const translatedText = await googleTranslateFallback(textWithPlaceholders, targetLang);
                return NextResponse.json({
                    translatedText: restoreCodeBlocks(translatedText),
                    provider: "Google Translate"
                }, {
                    headers: {
                        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
                    }
                });
            } catch (error) {
                return NextResponse.json(
                    { error: "Google Translate failed" },
                    { status: 502 }
                );
            }
        }

        // Try Gemini first
        // Strip any prompt leakage or preamble from the AI response
        function stripPromptLeakage(output: string, inputText: string): string {
            let cleaned = output;

            // Remove common preamble patterns (case-insensitive, multiline)
            const preamblePatterns = [
                /^(?:here(?:'s| is) the (?:translated|translation)[^:\n]*[:\n]\s*)/i,
                /^(?:sure[!,.]?\s*(?:here(?:'s| is)[^:\n]*[:\n])?\s*)/i,
                /^(?:the translation[^:\n]*[:\n]\s*)/i,
                /^(?:translated text[:\n]\s*)/i,
                /^(?:translation[:\n]\s*)/i,
                /^(?:okay[,.]?\s*(?:here(?:'s| is)[^:\n]*[:\n])?\s*)/i,
                /^(?:of course[!,.]?\s*(?:here(?:'s| is)[^:\n]*[:\n])?\s*)/i,
            ];

            for (const pattern of preamblePatterns) {
                cleaned = cleaned.replace(pattern, "");
            }

            // If the model echoed the prompt instructions, strip everything before the actual content.
            // Look for the prompt instruction fingerprint and remove everything up to it.
            const promptFingerprints = [
                "Only output the translated text",
                "Preserve all markdown formatting",
                "Do not include any preamble",
                "IMPORTANT:",
            ];
            for (const fingerprint of promptFingerprints) {
                const idx = cleaned.indexOf(fingerprint);
                if (idx !== -1) {
                    // Find the end of the line containing the fingerprint
                    const afterFingerprint = cleaned.indexOf("\n", idx);
                    if (afterFingerprint !== -1) {
                        cleaned = cleaned.substring(afterFingerprint + 1).trimStart();
                    }
                }
            }

            return cleaned.trim();
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const prompt = `Translate the following text to ${targetLang}. Preserve all markdown formatting and links. Keep any __CODE_BLOCK_N__ placeholders exactly as-is.

IMPORTANT: Output ONLY the translated text. Do not include any preamble, introduction, explanation, or the original text. Do not say "Here is the translation" or anything similar. Start directly with the translated content.

${textWithPlaceholders}`;

                // Map of friendly model names to API versions/names if needed, 
                // but mostly we can pass the model ID directly to the URL.
                // Supported: gemma-3-4b-it, gemini-flash-latest, gemini-2.0-flash-lite, gemini-2.0-flash
                const modelId = model;

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                        }),
                    }
                );

                // If Gemini returns error, log and fall through to fallback
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`❌ Gemini API Error (${res.status}): ${errorText}`);
                    console.warn(`Falling back to Google Translate due to Gemini error.`);
                } else {
                    const data = await res.json();
                    const rawTranslated =
                        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                    if (rawTranslated) {
                        const translatedText = stripPromptLeakage(rawTranslated, textWithPlaceholders);
                        return NextResponse.json({
                            translatedText: restoreCodeBlocks(translatedText),
                            provider: "Gemini"
                        }, {
                            headers: {
                                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
                            }
                        });
                    }
                }
            } catch (geminiError) {
                console.warn("Gemini translation failed, falling back:", geminiError);
            }
        }

        // Fallback: Google Translate
        try {
            console.log("Using Google Translate fallback for", targetLang);
            const translatedText = await googleTranslateFallback(textWithPlaceholders, targetLang);
            return NextResponse.json({
                translatedText: restoreCodeBlocks(translatedText),
                fallback: true,
                provider: "Google Translate"
            });
        } catch (fallbackError) {
            console.error("Google Translate fallback also failed:", fallbackError);
            return NextResponse.json(
                { error: "Translation unavailable — both Gemini and Google Translate failed" },
                { status: 502 }
            );
        }
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
