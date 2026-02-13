import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('No files to process.');
    process.exit(0);
}

async function stripMetadata(filePath) {
    try {
        const ext = path.extname(filePath).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif', '.heif'].includes(ext)) {
            console.log(`Skipping non-image file: ${filePath}`);
            return;
        }

        const buffer = await fs.readFile(filePath);

        // sharp(buffer).withMetadata(false) removes all metadata
        const processedBuffer = await sharp(buffer)
            .withMetadata(false) // This is the key: false removes all metadata including EXIF, ICC, XMP
            .toBuffer();

        await fs.writeFile(filePath, processedBuffer);
        console.log(`Stripped metadata: ${filePath}`);
    } catch (error) {
        if (error.message.includes('Input buffer contains unsupported image format')) {
            console.warn(`Skipping unsupported file format: ${filePath}`);
            return;
        }
        console.error(`Error processing ${filePath}:`, error.message);
        // Warn but do not fail the commit for metadata stripping errors
        // process.exit(1); 
    }
}

async function main() {
    console.log('Stripping metadata from staged images...');
    await Promise.all(args.map(stripMetadata));
}

main();
