import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import fs from "fs/promises";
import path from "path";
import { siteConfig } from "../../../../../../site.config";

export async function GET(req: Request, context: any) {
    const params = await context.params;
    const slug = params.slug;
    try {
        const post = await getPostBySlug(slug);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
        // Frontend editor expects `content` instead of `body`
        return NextResponse.json({ ...post, content: post.body });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request, context: any) {
     const params = await context.params;
     const slug = params.slug;
    try {
        const { title, summary, date, categories, keywords, content, image, archive, hidden } = await req.json();

        if (!title || !date || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const safeSlug = slug.replace(/[^a-z0-9-]/g, "").toLowerCase();
        
        const folderPath = path.join(process.cwd(), "content", "posts", safeSlug);
        const newFilePath = path.join(folderPath, "index.md");
        const enFilePath = path.join(folderPath, "index_en.md");
        const oldFilePath = path.join(process.cwd(), "content", "posts", `${safeSlug}.md`);

        const cats = categories ? `[${categories.map((c: string) => `"${c}"`).join(", ")}]` : "[]";
        const kw = keywords ? `[${keywords.map((k: string) => `"${k}"`).join(", ")}]` : "[]";
        
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

        await fs.mkdir(folderPath, { recursive: true });

        let shouldSyncEn = false;
        try {
            const enContent = await fs.readFile(enFilePath, "utf-8");
            const mainContent = await fs.readFile(newFilePath, "utf-8").catch(() => null);
            if (enContent === mainContent) {
                shouldSyncEn = true;
            }
        } catch {
            // _en file doesn't exist yet
            shouldSyncEn = true;
        }

        await fs.writeFile(newFilePath, fileContent, "utf-8");
        if (shouldSyncEn) {
            await fs.writeFile(enFilePath, fileContent, "utf-8");
        }
        
        // Cleanup old flat format file if we just migrated it to a folder
        try {
            await fs.access(oldFilePath);
            await fs.unlink(oldFilePath);
        } catch (e) {
            // Old file doesn't exist, meaning it was already in folder format. Safe to ignore.
        }

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

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    const params = await context.params;
    const slug = params.slug;
    try {
        const safeSlug = slug.replace(/[^a-z0-9-]/g, "").toLowerCase();
        const folderPath = path.join(process.cwd(), "content", "posts", safeSlug);
        const flatFilePath = path.join(process.cwd(), "content", "posts", `${safeSlug}.md`);

        // Try folder format first (slug/index.md), then flat file (slug.md)
        let deleted = false;
        try {
            await fs.access(folderPath);
            await fs.rm(folderPath, { recursive: true });
            deleted = true;
        } catch {}

        if (!deleted) {
            await fs.unlink(flatFilePath);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
