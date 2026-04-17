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

        const { text, targetLang, model = "gemini-flash-latest" } = await request.json();

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

        // Extract code blocks so they're never translated
        const codeBlocks: string[] = [];
        const textWithPlaceholders = sanitized.replace(
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

        /**
         * Split text into chunks at paragraph/heading boundaries.
         * Each chunk stays under maxChunkSize characters.
         */
        function splitIntoChunks(fullText: string, maxChunkSize: number): string[] {
            if (fullText.length <= maxChunkSize) return [fullText];

            const chunks: string[] = [];
            // Split on double newlines (paragraph boundaries) to keep semantic units together
            const paragraphs = fullText.split(/\n\n/);
            let currentChunk = "";

            for (const para of paragraphs) {
                const candidate = currentChunk
                    ? currentChunk + "\n\n" + para
                    : para;

                if (candidate.length > maxChunkSize && currentChunk.length > 0) {
                    // Push current chunk and start a new one
                    chunks.push(currentChunk);
                    // If a single paragraph exceeds maxChunkSize, split it further by single newlines
                    if (para.length > maxChunkSize) {
                        const lines = para.split("\n");
                        let lineChunk = "";
                        for (const line of lines) {
                            const lineCandidate = lineChunk
                                ? lineChunk + "\n" + line
                                : line;
                            if (lineCandidate.length > maxChunkSize && lineChunk.length > 0) {
                                chunks.push(lineChunk);
                                lineChunk = line;
                            } else {
                                lineChunk = lineCandidate;
                            }
                        }
                        currentChunk = lineChunk;
                    } else {
                        currentChunk = para;
                    }
                } else {
                    currentChunk = candidate;
                }
            }

            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }

            return chunks;
        }

        /**
         * Translate a single chunk using the Gemini API.
         * Returns the translated text or null on failure.
         */
        async function translateChunkWithGemini(
            chunk: string,
            targetLang: string,
            modelId: string,
            apiKey: string,
            chunkIndex: number,
            totalChunks: number,
        ): Promise<string | null> {
            const continuationHint = totalChunks > 1
                ? `\nThis is part ${chunkIndex + 1} of ${totalChunks}. Translate only this part.`
                : "";

            const prompt = `Translate the following text to ${targetLang}. Preserve all markdown formatting and links. Keep any __CODE_BLOCK_N__ placeholders exactly as-is.

IMPORTANT: Output ONLY the translated text. Do not include any preamble, introduction, explanation, or the original text. Do not say "Here is the translation" or anything similar. Start directly with the translated content.${continuationHint}

${chunk}`;

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

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`❌ Gemini API Error (${res.status}) for chunk ${chunkIndex + 1}/${totalChunks}: ${errorText}`);
                return null;
            }

            const data = await res.json();
            const rawTranslated = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (!rawTranslated) return null;

            return stripPromptLeakage(rawTranslated, chunk);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const modelId = model;

                // Split text into manageable chunks (~4000 chars each to stay well under API limits)
                const MAX_CHUNK_SIZE = 4000;
                const chunks = splitIntoChunks(textWithPlaceholders, MAX_CHUNK_SIZE);

                console.log(`Translating to ${targetLang} using ${modelId} — ${chunks.length} chunk(s), total ${textWithPlaceholders.length} chars`);

                const translatedChunks: string[] = [];
                let allSucceeded = true;

                for (let i = 0; i < chunks.length; i++) {
                    const result = await translateChunkWithGemini(
                        chunks[i],
                        targetLang,
                        modelId,
                        apiKey,
                        i,
                        chunks.length,
                    );

                    if (result === null) {
                        allSucceeded = false;
                        console.warn(`Chunk ${i + 1}/${chunks.length} failed, falling back to Google Translate.`);
                        break;
                    }

                    translatedChunks.push(result);
                }

                if (allSucceeded && translatedChunks.length === chunks.length) {
                    const fullTranslation = translatedChunks.join("\n\n");
                    return NextResponse.json({
                        translatedText: restoreCodeBlocks(fullTranslation),
                        provider: "Gemini"
                    }, {
                        headers: {
                            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
                        }
                    });
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

