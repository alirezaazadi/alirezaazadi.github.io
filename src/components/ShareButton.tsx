"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Linkedin, Send, Link, Check } from "lucide-react";

interface ShareButtonProps {
    postUrl: string;
    postTitle: string;
}

export function ShareButton({ postUrl, postTitle }: ShareButtonProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showMenu]);

    const shareToLinkedIn = async () => {
        // Copy link to clipboard so user can paste it in the LinkedIn post body
        try { await navigator.clipboard.writeText(postUrl); } catch { }
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
            "_blank",
            "noopener,noreferrer"
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowMenu(false);
    };

    const shareToTelegram = () => {
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`,
            "_blank",
            "noopener,noreferrer"
        );
        setShowMenu(false);
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement("input");
            input.value = postUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setShowMenu(false);
    };

    return (
        <div className="share-wrapper" ref={menuRef}>
            <button
                className="btn"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Share post"
            >
                <Share2 size={14} />
                share
            </button>

            {showMenu && (
                <div className="share-menu">
                    <button className="share-option" onClick={shareToLinkedIn}>
                        <Linkedin size={14} />
                        LinkedIn
                    </button>
                    <button className="share-option" onClick={shareToTelegram}>
                        <Send size={14} />
                        Telegram
                    </button>
                    <button className="share-option" onClick={copyLink}>
                        {copied ? <Check size={14} /> : <Link size={14} />}
                        {copied ? "Copied!" : "Copy link"}
                    </button>
                </div>
            )}
        </div>
    );
}
