import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import readline from 'readline';

function askQuestion(query) {
    return new Promise(resolve => {
        let input = process.stdin;
        let output = process.stdout;
        
        try {
            // Try to open /dev/tty to support interactive prompts during git pre-commit hooks
            input = fsSync.createReadStream('/dev/tty');
            output = fsSync.createWriteStream('/dev/tty');
        } catch (e) {
            // Fallback to standard IO
        }

        const rl = readline.createInterface({ input, output });
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
}

async function getFiles(dir, ext) {
    let results = [];
    try {
        const list = await fs.readdir(dir, { withFileTypes: true });
        for (const file of list) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
                results = results.concat(await getFiles(filePath, ext));
            } else if (!ext || filePath.endsWith(ext)) {
                results.push(filePath);
            }
        }
    } catch (e) {
        // Directory might not exist
    }
    return results;
}

async function main() {
    console.log("Scanning for dangling images...");
    
    const contentDir = path.join(process.cwd(), "content");
    const mdFiles = await getFiles(contentDir, ".md");
    
    const referencedMedia = new Set();
    const mediaRegex = /\/media\/[a-zA-Z0-9_.\/-]+/g;
    
    for (const file of mdFiles) {
        try {
            const content = await fs.readFile(file, "utf-8");
            let match;
            while ((match = mediaRegex.exec(content)) !== null) {
                referencedMedia.add(match[0]);
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e);
        }
    }
    
    // Also check site.config.ts
    try {
        const configContent = await fs.readFile(path.join(process.cwd(), "site.config.ts"), "utf-8");
        let match;
        while ((match = mediaRegex.exec(configContent)) !== null) {
            referencedMedia.add(match[0]);
        }
    } catch (e) {}

    const mediaDirs = [
        path.join(process.cwd(), "public", "media", "posts"),
        path.join(process.cwd(), "public", "media", "favorites")
    ];
    
    const toDelete = [];

    for (const dir of mediaDirs) {
        const images = await getFiles(dir);
        for (const img of images) {
            const relPathPos = img.indexOf('/public/media/');
            if (relPathPos === -1) continue;
            
            const relPath = img.substring(relPathPos + 7); // keeps /media/... starting from the boundary
            const urlPath = relPath.replace(/\\/g, '/');
            
            if (!referencedMedia.has(urlPath) && !img.endsWith('.DS_Store')) {
                toDelete.push({ file: img, url: urlPath });
            }
        }
    }
    
    if (toDelete.length === 0) {
        console.log("No dangling images found.");
        return;
    }

    console.log(`\nFound ${toDelete.length} dangling image(s):`);
    for (const item of toDelete) {
        console.log(`  - ${item.url}`);
    }

    const answer = await askQuestion(`\nDo you want to definitively delete these ${toDelete.length} image(s)? (y/N): `);
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        let deletedCount = 0;
        for (const item of toDelete) {
            await fs.unlink(item.file);
            deletedCount++;
        }
        console.log(`Successfully deleted ${deletedCount} dangling image(s).`);
    } else {
        console.log('Skipping deletion.');
    }
}

main().catch(err => {
    console.error("Dangling images script failed:", err);
    process.exit(1);
});
