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
            <MarkdownRenderer content={siteConfig.aboutMe} />
        </div>
    );
}
