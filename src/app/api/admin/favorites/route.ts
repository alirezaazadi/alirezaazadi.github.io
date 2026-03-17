import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { parseFavorites, stringifyFavorites } from "@/lib/favorites";

const favPath = path.join(process.cwd(), "content", "favorites.md");

export async function GET() {
    try {
        const content = await fs.readFile(favPath, "utf-8");
        const parsed = parseFavorites(content);
        return NextResponse.json({ content, parsed });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        let finalContent = "";
        
        if (body.parsed) {
            finalContent = stringifyFavorites(body.parsed);
        } else if (typeof body.content === "string") {
            finalContent = body.content;
        } else {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        await fs.writeFile(favPath, finalContent, "utf-8");
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
