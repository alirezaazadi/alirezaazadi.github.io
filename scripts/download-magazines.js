const fs = require('fs');
const https = require('https');
const path = require('path');

const downloads = [
    {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/240px-Y_Combinator_logo.svg.png",
        dest: "public/media/favorites/mag_hackernews.png"
    },
    {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/The_Economist_Logo.svg/1024px-The_Economist_Logo.svg.png",
        dest: "public/media/favorites/mag_economist.png"
    },
    // Using a different source for How It Works, potentially more stable
    {
        url: "https://m.media-amazon.com/images/I/81+5+9+8+dL._AC_UF1000,1000_QL80_.jpg",
        dest: "public/media/favorites/mag_howitworks.jpg"
    }
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
            }
        }, function (response) {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', function () {
                file.close(() => {
                    console.log(`Downloaded ${dest}`);
                    resolve();
                });
            });
        }).on('error', function (err) {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function main() {
    for (const item of downloads) {
        try {
            await download(item.url, item.dest);
        } catch (e) {
            console.error(e.message);
        }
    }
}

main();
