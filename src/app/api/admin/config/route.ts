import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const configPath = path.join(process.cwd(), "site.config.ts");

const BOOLEAN_FIELDS = [
    "showFavorites", "showContact",
    "showTranslation", "showAdhdMode", "showArchive", "showShare",
    "showSuggestions", "showAbout", "showTerminal",
] as const;

const ARRAY_FIELDS = [
    "shareOptions", "terminalCommands", "translateLanguages",
] as const;

function extractBoolean(content: string, field: string, fallback = true): boolean {
    const m = content.match(new RegExp(`${field}:\\s*(true|false)`));
    return m ? m[1] === "true" : fallback;
}

function extractStringArray(content: string, field: string): string[] {
    const m = content.match(new RegExp(`${field}:\\s*\\[([^\\]]*?)\\]\\s*as\\s*string\\[\\]`));
    if (!m) return [];
    return m[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) ?? [];
}

function extractNumber(content: string, field: string, fallback = 0): number {
    const m = content.match(new RegExp(`${field}:\\s*(\\d+)`));
    return m ? parseInt(m[1], 10) : fallback;
}

export async function GET() {
    try {
        const content = await fs.readFile(configPath, "utf-8");

        const aboutMatch = content.match(/aboutMe:\s*`([\s\S]*?)`/);
        const aboutMe = aboutMatch ? aboutMatch[1].trim() : "";

        const descMatch = content.match(/description:\s*"((?:[^"\\]|\\.)*)"/);
        const description = descMatch ? descMatch[1].replace(/\\"/g, '"') : "";

        const socialMatch = content.match(/social:\s*{([\s\S]*?)?}\s*as\s*Record/);
        const social: Record<string, string> = {};
        if (socialMatch?.[1]) {
            for (const line of socialMatch[1].split("\n")) {
                const m = line.match(/^\s*([a-zA-Z0-9_]+):\s*"(.*?)",?/);
                if (m) social[m[1]] = m[2];
            }
        }

        const booleans: Record<string, boolean> = {};
        for (const f of BOOLEAN_FIELDS) {
            booleans[f] = extractBoolean(content, f);
        }

        const arrays: Record<string, string[]> = {};
        for (const f of ARRAY_FIELDS) {
            arrays[f] = extractStringArray(content, f);
        }

        const defaultImageWidth = extractNumber(content, "defaultImageWidth");

        return NextResponse.json({
            aboutMe,
            description,
            social,
            ...booleans,
            ...arrays,
            defaultImageWidth,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        let content = await fs.readFile(configPath, "utf-8");

        if (body.aboutMe !== undefined) {
            content = content.replace(/aboutMe:\s*`[\s\S]*?`/, `aboutMe: \`\n${body.aboutMe}\n  \``);

            // Also update content/posts/about.md
            try {
                const aboutMdPath = path.join(process.cwd(), "content/posts/about.md");
                const aboutMdContent = await fs.readFile(aboutMdPath, "utf-8");
                const frontmatterMatch = aboutMdContent.match(/^(---\s*[\s\S]*?---)/);
                if (frontmatterMatch) {
                    const newAboutMdContent = `${frontmatterMatch[1]}\n${body.aboutMe}`;
                    await fs.writeFile(aboutMdPath, newAboutMdContent, "utf-8");
                }
            } catch (e) {
                console.error("Failed to update about.md:", e);
            }
        }

        if (body.description !== undefined) {
            const escaped = body.description.replace(/"/g, '\\"');
            content = content.replace(/description:\s*"(?:[^"\\]|\\.)*"/, `description: "${escaped}"`);
        }

        if (body.social !== undefined) {
            let s = "social: {\n";
            for (const [key, value] of Object.entries(body.social)) {
                if (key && value) s += `    ${key}: "${value}",\n`;
            }
            s += "  } as Record";
            content = content.replace(/social:\s*{[\s\S]*?}\s*as\s*Record/, s);
        }

        for (const f of BOOLEAN_FIELDS) {
            if (body[f] !== undefined) {
                content = content.replace(
                    new RegExp(`${f}:\\s*(true|false)`),
                    `${f}: ${!!body[f]}`,
                );
            }
        }

        for (const f of ARRAY_FIELDS) {
            if (body[f] !== undefined) {
                const items = (body[f] as string[]).map(v => `"${v}"`).join(", ");
                content = content.replace(
                    new RegExp(`${f}:\\s*\\[[^\\]]*?\\]\\s*as\\s*string\\[\\]`),
                    `${f}: [${items}] as string[]`,
                );
            }
        }

        if (body.defaultImageWidth !== undefined) {
            content = content.replace(
                /defaultImageWidth:\s*\d+/,
                `defaultImageWidth: ${parseInt(body.defaultImageWidth, 10) || 0}`,
            );
        }

        await fs.writeFile(configPath, content, "utf-8");
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
