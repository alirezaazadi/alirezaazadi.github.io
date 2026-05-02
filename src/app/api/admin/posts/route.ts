import { NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/posts";
import fs from "fs/promises";
import path from "path";
import { siteConfig } from "../../../../../site.config";

export async function GET() {
    try {
        const posts = await getAllPostsMeta(true);
        return NextResponse.json(posts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { slug, title, summary, date, categories, keywords, content, image, archive, hidden } = await req.json();

        if (!slug || !title || !date || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const safeSlug = slug.replace(/[^a-z0-9-]/g, "").toLowerCase();
        const folderPath = path.join(process.cwd(), "content", "posts", safeSlug);
        const filePath = path.join(folderPath, "index.md");

        // Check if exists
        try {
            await fs.access(filePath);
            return NextResponse.json({ error: "Post with this slug already exists" }, { status: 400 });
        } catch {
            // Document doesn't exist, which is good
        }

        // Format frontmatter
        const cats = categories ? `[${categories.map((c: string) => `"${c}"`).join(", ")}]` : "[]";
        const kw = keywords && keywords.length > 0 ? `[${keywords.map((k: string) => `"${k}"`).join(", ")}]` : "[]";
        
        let fileContent = `---\n`;
        fileContent += `title: "${title.replace(/"/g, '\\"')}"\n`;
        fileContent += `summary: "${(summary || "").replace(/"/g, '\\"')}"\n`;
        fileContent += `date: "${date}"\n`;
        if (categories && categories.length > 0) {
            fileContent += `categories: ${cats}\n`;
        }
        if (keywords && keywords.length > 0) {
            fileContent += `keywords: ${kw}\n`;
        }
        if (image) {
            fileContent += `image: "${image}"\n`;
        }
        if (hidden) {
            fileContent += `hidden: true\n`;
        }
        fileContent += `---\n\n`;
        fileContent += content;

        const enFilePath = path.join(folderPath, "index_en.md");

        await fs.mkdir(folderPath, { recursive: true });
        await fs.writeFile(filePath, fileContent, "utf-8");
        await fs.writeFile(enFilePath, fileContent, "utf-8");

        if (archive) {
            const queuePath = path.join(process.cwd(), "content", ".archive-queue.json");
            let queue: string[] = [];
            try {
                const q = await fs.readFile(queuePath, "utf-8");
                queue = JSON.parse(q);
            } catch (e) {
                // Ignore if file doesn't exist
            }
            if (!queue.includes(safeSlug)) {
                queue.push(safeSlug);
                await fs.writeFile(queuePath, JSON.stringify(queue), "utf-8");
            }
        }

        return NextResponse.json({ success: true, slug: safeSlug });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
