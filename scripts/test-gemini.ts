
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envFile = readFileSync(envPath, "utf8");
    envFile.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
}

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in environment");
        return;
    }
    console.log(`✅ Found API Key: ${apiKey.slice(0, 5)}...`);

    const modelObj = {
        model: "gemini-flash-latest"
    };

    const prompt = "Start translation test.";

    console.log(`Testing model: ${modelObj.model}`);

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelObj.model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ API Failed: ${res.status}`);
            console.error(errorText);
        } else {
            const data = await res.json();
            console.log("✅ Success!");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Network/Client Error:", error);
    }
}

testGemini();
