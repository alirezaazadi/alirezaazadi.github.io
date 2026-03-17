import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const uploadType = formData.get("type") as string; // 'post' or 'favorite'

        if (!file) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }

        if (!["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"].includes(file.type)) {
            return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Generate a unique filename that contains the original extension
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const ext = path.extname(originalName) || ".jpg";
        const filename = `${uploadType === "favorite" ? "fav_" : "img_"}${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        
        // Determine the destination directory
        const subdir = uploadType === "favorite" ? "favorites" : "posts";
        const destDir = path.join(process.cwd(), "public", "media", subdir);
        
        // Ensure directory exists (it should, but safety first)
        const fs = require("fs");
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const filePath = path.join(destDir, filename);
        await writeFile(filePath, buffer);

        // Define the public URL
        const publicUrl = `/media/${subdir}/${filename}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
