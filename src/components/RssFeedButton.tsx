"use client";

import { useState, useRef, useEffect } from "react";
import { Rss } from "lucide-react";

export function RssFeedButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="rss-feed-button" ref={ref}>
      <button
        className="rss-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="RSS feeds"
        aria-expanded={open}
        title="Subscribe via RSS"
      >
        <Rss size={16} />
        <span>RSS</span>
      </button>

      {open && (
        <div className="rss-dropdown" role="menu">
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="rss-option"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Rss size={14} />
            <span>Persian feed</span>
            <span className="rss-option-lang">فارسی</span>
          </a>
          <a
            href="/feed-en.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="rss-option"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Rss size={14} />
            <span>English feed</span>
            <span className="rss-option-lang">EN</span>
          </a>
        </div>
      )}
    </div>
  );
}
