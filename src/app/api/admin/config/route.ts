import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const configPath = path.join(process.cwd(), "site.config.ts");

export async function GET() {
    try {
        const content = await fs.readFile(configPath, "utf-8");
        
        // Extract aboutMe
        const aboutMatch = content.match(/aboutMe:\s*`([\s\S]*?)`/);
        const aboutMe = aboutMatch ? aboutMatch[1].trim() : "";
        
        // Extract social
        const socialMatch = content.match(/social:\s*{([\s\S]*?)?}\s*as\s*Record/);
        let social: Record<string, string> = {};
        if (socialMatch && socialMatch[1]) {
            const lines = socialMatch[1].split("\n");
            for (const line of lines) {
                const match = line.match(/^\s*([a-zA-Z0-9_]+):\s*"(.*?)",?/);
                if (match) {
                    social[match[1]] = match[2];
                }
            }
        }
        
        // Extract showFavorites and showContact
        const showFavoritesMatch = content.match(/showFavorites:\s*(true|false)/);
        const showFavorites = showFavoritesMatch ? showFavoritesMatch[1] === "true" : true;
        const showContactMatch = content.match(/showContact:\s*(true|false)/);
        const showContact = showContactMatch ? showContactMatch[1] === "true" : true;
        
        return NextResponse.json({ aboutMe, social, showFavorites, showContact });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { aboutMe, social, showFavorites, showContact } = await req.json();
        let content = await fs.readFile(configPath, "utf-8");
        
        // Replace aboutMe
        if (aboutMe !== undefined) {
            content = content.replace(/aboutMe:\s*`[\s\S]*?`/, `aboutMe: \`\n${aboutMe}\n  \``);
        }
        
        // Replace social
        if (social !== undefined) {
            let socialString = "social: {\n";
            for (const [key, value] of Object.entries(social)) {
                if (key && value) {
                    socialString += `    ${key}: "${value}",\n`;
                }
            }
            socialString += "  } as Record";
            content = content.replace(/social:\s*{[\s\S]*?}\s*as\s*Record/, socialString);
        }

        // Replace showFavorites
        if (showFavorites !== undefined) {
            content = content.replace(/showFavorites:\s*(true|false)/, `showFavorites: ${showFavorites}`);
        }

        // Replace showContact
        if (showContact !== undefined) {
            content = content.replace(/showContact:\s*(true|false)/, `showContact: ${showContact}`);
        }
        
        await fs.writeFile(configPath, content, "utf-8");
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
