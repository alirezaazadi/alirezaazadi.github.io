import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { siteConfig } from "../../../site.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `About — ${siteConfig.title}`,
    description: `About ${siteConfig.author}`,
};

export default function AboutPage() {
    return (
        <div className="about-page">
            <div className="about-page">
                <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                    well, one day I&apos;ll put something here.
                </p>
            </div>
        </div>
    );
}
