import { Mail } from "lucide-react";
import { siteConfig } from "../../site.config";

interface ReplyButtonProps {
    postTitle: string;
}

export function ReplyButton({ postTitle }: ReplyButtonProps) {
    const subject = encodeURIComponent(`Re: ${postTitle}`);
    const mailtoUrl = `mailto:${siteConfig.email}?subject=${subject}`;

    return (
        <a href={mailtoUrl} className="btn">
            <Mail size={14} />
            reply by email
        </a>
    );
}
