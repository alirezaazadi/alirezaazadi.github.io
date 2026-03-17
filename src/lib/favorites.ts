import fs from "fs";
import path from "path";

export interface FavoriteItem {
    title: string;
    subtitle: string; // author, artist, host, channel, or platform
    cover: string;
    url: string;
}

export interface Favorites {
    books: FavoriteItem[];
    music: FavoriteItem[];
    podcasts: FavoriteItem[];
    movies: FavoriteItem[];
    playlists: FavoriteItem[];
    magazines: FavoriteItem[];
}

/**
 * Parses the structured favorites.md file.
 * Format: sections start with ## (books, music, podcasts, movies, playlists)
 * Items are lines starting with "- key: value"
 */
export function parseFavorites(content: string): Favorites {
    const favorites: Favorites = {
        books: [],
        music: [],
        podcasts: [],
        movies: [],
        playlists: [],
        magazines: [],
    };

    let currentSection: keyof Favorites | null = null;
    let currentItem: Partial<FavoriteItem & { author?: string; artist?: string; host?: string; channel?: string; platform?: string }> = {};

    const lines = content.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();

        // Section headers
        const sectionMatch = trimmed.match(/^##\s+(\w+)/);
        if (sectionMatch) {
            // Save any pending item
            flushItem(favorites, currentSection, currentItem);
            currentItem = {};
            const section = sectionMatch[1].toLowerCase();
            if (section in favorites) {
                currentSection = section as keyof Favorites;
            }
            continue;
        }

        // New item starts with "- title:"
        if (trimmed.startsWith("- title:")) {
            // Save previous item
            flushItem(favorites, currentSection, currentItem);
            currentItem = { title: extractValue(trimmed.substring(2)) };
            continue;
        }

        // Item properties
        if (trimmed.match(/^\w+:/)) {
            const key = trimmed.split(":")[0].trim();
            const value = extractValue(trimmed);

            if (key === "author" || key === "artist" || key === "host" || key === "channel" || key === "platform" || key === "subtitle") {
                currentItem.subtitle = value;
            } else if (key === "cover") {
                currentItem.cover = value;
            } else if (key === "url") {
                currentItem.url = value;
            } else if (key === "title") {
                currentItem.title = value;
            }
        }
    }

    // Flush last item
    flushItem(favorites, currentSection, currentItem);

    return favorites;
}

function extractValue(line: string): string {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return line.trim();
    return line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
}

function flushItem(
    favorites: Favorites,
    section: keyof Favorites | null,
    item: Partial<FavoriteItem>
) {
    if (section && item.title) {
        favorites[section].push({
            title: item.title,
            subtitle: item.subtitle || "",
            cover: item.cover || "",
            url: item.url || "",
        });
    }
}

/**
 * Stringifies the Favorites object back into markdown format.
 */
export function stringifyFavorites(favorites: Favorites): string {
    let md = "";
    
    const sections = Object.keys(favorites) as Array<keyof Favorites>;
    
    for (const section of sections) {
        if (!favorites[section] || favorites[section].length === 0) continue;
        
        md += `## ${section}\n`;
        
        for (const item of favorites[section]) {
            md += `- title: ${item.title}\n`;
            if (item.url) md += `  url: ${item.url}\n`;
            if (item.cover) md += `  cover: ${item.cover}\n`;
            if (item.subtitle) md += `  subtitle: ${item.subtitle}\n`;
        }
        md += "\n";
    }
    
    return md.trim() + "\n";
}

/**
 * Read favorites from the local content directory.
 */
export async function getFavorites(): Promise<Favorites | null> {
    const localPath = path.join(process.cwd(), "content", "favorites.md");

    try {
        if (!fs.existsSync(localPath)) {
            console.warn(`Favorites file not found: ${localPath}`);
            return null;
        }

        const content = fs.readFileSync(localPath, "utf-8");
        return parseFavorites(content);
    } catch {
        return null;
    }
}
