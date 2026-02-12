"use client";

import { Search } from "lucide-react";
import { useRef, useCallback } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onChange(val);
            }, 300);
        },
        [onChange]
    );

    return (
        <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
                type="text"
                placeholder="search posts..."
                defaultValue={value}
                onChange={handleChange}
                aria-label="Search posts"
            />
        </div>
    );
}
