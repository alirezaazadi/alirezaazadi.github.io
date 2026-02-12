import fs from "fs";
import path from "path";

interface GitHubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    download_url: string;
    type: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/**
 * Fetches the list of markdown post files from the local content directory.
 */
export async function fetchPostsList(): Promise<GitHubFile[]> {
    if (!fs.existsSync(POSTS_DIR)) {
        console.warn(`Posts directory not found: ${POSTS_DIR}`);
        return [];
    }

    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
    return files.map((name) => ({
        name,
        path: `posts/${name}`,
        sha: "",
        size: 0,
        download_url: "",
        type: "file",
    }));
}

/**
 * Fetches the raw content of a file from the content directory.
 */
export async function fetchFileContent(filePath: string): Promise<string> {
    const fullPath = path.join(process.cwd(), "content", filePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Content file not found: ${filePath}`);
    }
    return fs.readFileSync(fullPath, "utf-8");
}

/**
 * Fetches raw content of a post by its filename (slug).
 */
export async function fetchPostContent(filename: string): Promise<string> {
    return fetchFileContent(`posts/${filename}`);
}
