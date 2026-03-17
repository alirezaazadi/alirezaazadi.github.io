import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    if (process.env.NODE_ENV !== "development") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { title, content } = await req.json();

        if (!title && !content) {
            return NextResponse.json({ error: "Missing content to process" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not set in environment variables." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an expert SEO specialist. Generate exactly 10 highly relevant SEO keywords for the following blog post.
The keywords should be comma-separated, all lowercase. Do not include any other text, reasoning, or markdown formatting. 

Title: ${title}
Content snippet: ${content.substring(0, 3000)}...
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse exactly
        const tags = text
            .split(',')
            .map(t => t.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ''))
            .filter(Boolean);

        return NextResponse.json({ tags });
    } catch (e: any) {
        console.error("AI Tags Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
