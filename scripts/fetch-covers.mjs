import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { URL } from "url";

const FAVORITES_FILE = path.join(process.cwd(), "content", "favorites.md");
const OUTPUT_DIR = path.join(process.cwd(), "public", "media", "favorites");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        const opts = {
            headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36" },
            timeout: 5000 // 5s timeout
        };
        const req = client.get(url, opts, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => resolve(data));
        });
        req.on("error", reject);
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Timeout"));
        });
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        const req = client.get(url, { timeout: 10000 }, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                res.pipe(file);
                file.on("finish", () => {
                    file.close(resolve);
                });
            } else {
                reject(new Error(`Failed to download image: ${res.statusCode}`));
            }
        });
        req.on("error", reject);
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Timeout"));
        });
    });
}

async function getOgImage(html) {
    const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    return match ? match[1] : null;
}

function getYouTubeThumbnail(url) {
    try {
        const u = new URL(url);
        // Video: v=ID
        const v = u.searchParams.get("v");
        if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
        // Youtube usually blocks scraping, so this is a good fallback.
    } catch { }
    return null;
}

async function processBlock(block) {
    const urlLineIdx = block.findIndex(l => l.trim().startsWith("url:"));
    const coverLine = block.find(l => l.trim().startsWith("cover:"));

    if (urlLineIdx !== -1 && !coverLine) {
        const url = block[urlLineIdx].split("url:")[1].trim();
        console.log(`Processing ${url}...`);

        try {
            let imageUrl = getYouTubeThumbnail(url);

            if (!imageUrl) {
                try {
                    const html = await fetchUrl(url);
                    imageUrl = await getOgImage(html);
                } catch (e) {
                    console.log(`Could not fetch metadata for ${url}: ${e.message}`);
                }
            }

            if (imageUrl) {
                if (imageUrl.startsWith("/")) {
                    try {
                        const u = new URL(url);
                        imageUrl = `${u.protocol}//${u.host}${imageUrl}`;
                    } catch { }
                }
                imageUrl = imageUrl.replace(/&amp;/g, "&");

                let ext = ".jpg";
                try {
                    const urlObj = new URL(imageUrl);
                    let pErr = path.extname(urlObj.pathname);
                    if (pErr && pErr.length <= 5) ext = pErr;
                } catch { }

                const filename = `fav_${Math.random().toString(36).substr(2, 9)}${ext}`;
                const savePath = path.join(OUTPUT_DIR, filename);

                console.log(`Downloading ${imageUrl} -> ${filename}`);
                await downloadImage(imageUrl, savePath);

                // Insert cover line
                // We insert it after the URL line
                // Determine indentation
                const indentation = block[urlLineIdx].match(/^\s*/)[0];
                block.splice(urlLineIdx + 1, 0, `${indentation}cover: /media/favorites/${filename}`);
            } else {
                console.log("No image found.");
            }
        } catch (e) {
            console.error(`Failed processing ${url}:`, e.message);
        }
    }
    return block;
}

async function processFavorites() {
    console.log("Reading favorites...");
    let content = fs.readFileSync(FAVORITES_FILE, "utf-8");
    const lines = content.split("\n");

    let reconstruction = [];
    let currentBlock = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Items start with "- title:"
        // Sections start with "##"
        // Also empty lines might separate items or sections
        const isItemStart = line.trim().startsWith("- title:");
        const isSectionStart = line.startsWith("##");

        if (isItemStart || isSectionStart) {
            if (currentBlock.length > 0) {
                const processed = await processBlock(currentBlock);
                reconstruction.push(...processed);
                currentBlock = [];
            }
        }

        currentBlock.push(line);
    }
    // Process last block
    if (currentBlock.length > 0) {
        const processed = await processBlock(currentBlock);
        reconstruction.push(...processed);
    }

    fs.writeFileSync(FAVORITES_FILE, reconstruction.join("\n"));
    console.log("Done updating favorites cover images.");
}

processFavorites().catch(console.error);
