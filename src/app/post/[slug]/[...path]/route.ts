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
    props: { params: Promise<{ slug: string; path: string[] }> }
) {
    const params = await props.params;
    const { slug, path: pathSegments } = params;

    // Reconstruct filename/path from segments (e.g., ["media", "image.jpg"] -> "media/image.jpg")
    const filename = pathSegments.join("/");

    // Validate slug and filename to prevent directory traversal
    // Allow slashes in filename now, but block ".."
    if (!/^[a-zA-Z0-9-_]+$/.test(slug) || filename.includes("..")) {
        return new NextResponse("Invalid Path", { status: 400 });
    }

    // Path to the file in content directory
    // content/posts/[slug]/[filename]
    const filePath = path.join(process.cwd(), "content", "posts", slug, filename);

    console.log(`[ImageRoute] Request: slug=${slug}, filename=${filename}`);
    console.log(`[ImageRoute] Resolved path: ${filePath}`);
    console.log(`[ImageRoute] Exists: ${fs.existsSync(filePath)}`);

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
