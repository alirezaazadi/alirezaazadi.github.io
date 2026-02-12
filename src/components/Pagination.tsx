"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - delta && i <= currentPage + delta)
        ) {
            pages.push(i);
        }
    }

    // Insert ellipsis markers (-1)
    const withEllipsis: number[] = [];
    let prev = 0;
    for (const p of pages) {
        if (prev && p - prev > 1) {
            withEllipsis.push(-1);
        }
        withEllipsis.push(p);
        prev = p;
    }

    return (
        <div className="pagination">
            <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous page"
            >
                <ChevronLeft size={14} />
            </button>
            {withEllipsis.map((p, i) =>
                p === -1 ? (
                    <span key={`e-${i}`} style={{ padding: "0 4px", color: "var(--text-muted)" }}>
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        className={p === currentPage ? "active" : ""}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                )
            )}
            <button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next page"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    );
}
