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

    const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });

    // Support both flat .md files and nested folders with index.md
    const files = entries
        .map((entry) => {
            if (entry.isFile() && entry.name.endsWith(".md")) {
                return {
                    name: entry.name, // e.g., "hello-world.md"
                    path: `posts/${entry.name}`,
                    sha: "",
                    size: 0,
                    download_url: "",
                    type: "file",
                };
            }
            if (entry.isDirectory()) {
                const indexParams = path.join(POSTS_DIR, entry.name, "index.md");
                if (fs.existsSync(indexParams)) {
                    return {
                        name: `${entry.name}.md`, // treat folder "foo" as "foo.md" for compatibility
                        path: `posts/${entry.name}/index.md`,
                        sha: "",
                        size: 0,
                        download_url: "",
                        type: "file",
                    };
                }
            }
            return null;
        })
        .filter((f): f is GitHubFile => f !== null);

    return files;
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
    // filename is typically "slug.md"
    const slug = filename.replace(/\.md$/, "");

    // 1. Try flat file: posts/slug.md
    const flatPath = path.join(POSTS_DIR, `${slug}.md`);
    if (fs.existsSync(flatPath)) {
        return fs.readFileSync(flatPath, "utf-8");
    }

    // 2. Try nested folder: posts/slug/index.md
    const nestedPath = path.join(POSTS_DIR, slug, "index.md");
    if (fs.existsSync(nestedPath)) {
        return fs.readFileSync(nestedPath, "utf-8");
    }

    throw new Error(`Post not found: ${filename}`);
}
