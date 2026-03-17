import { NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/posts";
import fs from "fs/promises";
import path from "path";

export async function GET() {
    try {
        const posts = await getAllPostsMeta();
        return NextResponse.json(posts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { slug, title, summary, date, categories, content, image } = await req.json();

        if (!slug || !title || !date || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const safeSlug = slug.replace(/[^a-z0-9-]/g, "").toLowerCase();
        const filePath = path.join(process.cwd(), "content", "posts", `${safeSlug}.md`);

        // Check if exists
        try {
            await fs.access(filePath);
            return NextResponse.json({ error: "Post with this slug already exists" }, { status: 400 });
        } catch {
            // Document doesn't exist, which is good
        }

        // Format frontmatter
        const cats = categories ? `[${categories.map((c: string) => `"${c}"`).join(", ")}]` : "[]";
        
        let fileContent = `---\n`;
        fileContent += `title: "${title.replace(/"/g, '\\"')}"\n`;
        fileContent += `summary: "${(summary || "").replace(/"/g, '\\"')}"\n`;
        fileContent += `date: "${date}"\n`;
        if (categories && categories.length > 0) {
            fileContent += `categories: ${cats}\n`;
        }
        if (image) {
            fileContent += `image: "${image}"\n`;
        }
        fileContent += `---\n\n`;
        fileContent += content;

        await fs.mkdir(path.join(process.cwd(), "content", "posts"), { recursive: true });
        await fs.writeFile(filePath, fileContent, "utf-8");

        return NextResponse.json({ success: true, slug: safeSlug });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
