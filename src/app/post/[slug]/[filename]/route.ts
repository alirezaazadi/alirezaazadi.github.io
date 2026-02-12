import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Simple mime type mapping
const MIME_TYPES: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
};

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ slug: string; filename: string }> }
) {
    const params = await props.params;
    const { slug, filename } = params;

    // Validate slug and filename to prevent directory traversal
    if (!/^[a-zA-Z0-9-_]+$/.test(slug) || filename.includes("..") || filename.includes("/")) {
        return new NextResponse("Invalid Path", { status: 400 });
    }

    // Path to the file in content directory
    // content/posts/[slug]/[filename]
    const filePath = path.join(process.cwd(), "content", "posts", slug, filename);

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
