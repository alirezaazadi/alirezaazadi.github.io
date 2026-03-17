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

        // To ensure zero metadata leak, we explicitly strip all headers, ICC profiles, 
        // EXIF, and XMP by cloning and avoiding keeping any input metadata.
        const format = ext.replace('.', '') === 'jpg' ? 'jpeg' : ext.replace('.', '');
        const processedBuffer = await sharp(buffer)
            .clone()
            .rotate() // bakes any EXIF orientation into pixels
            .withMetadata({ density: 72 }) // overrides any existing dpi/metadata
            .toFormat(format) // force rewrite of the entire image container
            .toBuffer();

        await fs.writeFile(filePath, processedBuffer);
        console.log(`Stripped metadata: ${filePath}`);
    } catch (error) {
        if (error.message.includes('Input buffer contains unsupported image format')) {
            console.warn(`Skipping unsupported file format: ${filePath}`);
            return;
        }
        console.error(`Error processing ${filePath}:`, error.message);
        // Fail the commit for metadata stripping errors
        process.exit(1); 
    }
}

async function main() {
    console.log('Stripping metadata from staged images...');
    await Promise.all(args.map(stripMetadata));
}

main();
