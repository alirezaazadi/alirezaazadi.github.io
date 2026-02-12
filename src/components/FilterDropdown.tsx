"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Filter, Calendar, Search, X, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface FilterDropdownProps {
    categories: string[];
    selectedCategory: string;
    onCategorySelect: (cat: string) => void;
    postDates: Record<string, number>;
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export function FilterDropdown({
    categories,
    selectedCategory,
    onCategorySelect,
    postDates,
    selectedDate,
    onDateSelect,
}: FilterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"category" | "date">("category");
    const [catSearch, setCatSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when opening category tab
    useEffect(() => {
        if (open && tab === "category" && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [open, tab]);

    // Filter categories by search
    const filteredCategories = useMemo(() => {
        if (!catSearch.trim()) return categories;
        const q = catSearch.toLowerCase();
        return categories.filter((c) => c.toLowerCase().includes(q));
    }, [categories, catSearch]);

    // Active filter count
    const activeCount = (selectedCategory ? 1 : 0) + (selectedDate ? 1 : 0);

    // Date picker data
    const datesWithPosts = useMemo(
        () => Object.keys(postDates).map((d) => new Date(d + "T00:00:00")),
        [postDates]
    );
    const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : undefined;

    // Active filter summary text
    const filterSummary = () => {
        const parts: string[] = [];
        if (selectedCategory) parts.push(selectedCategory);
        if (selectedDate) parts.push(selectedDate);
        return parts.join(" · ");
    };

    return (
        <div className="filter-dropdown-wrapper" ref={ref}>
            <button
                className={`filter-dropdown-trigger ${open ? "open" : ""} ${activeCount > 0 ? "has-active" : ""}`}
                onClick={() => setOpen(!open)}
            >
                <Filter size={14} />
                <span>filters</span>
                {activeCount > 0 && (
                    <span className="filter-badge">{activeCount}</span>
                )}
                <ChevronDown size={12} className={`filter-chevron ${open ? "rotated" : ""}`} />
            </button>

            {/* Active filter pills (shown next to the button) */}
            {activeCount > 0 && !open && (
                <div className="filter-active-pills">
                    {selectedCategory && (
                        <span className="filter-pill">
                            {selectedCategory}
                            <X
                                size={10}
                                onClick={() => onCategorySelect("")}
                                className="filter-pill-x"
                            />
                        </span>
                    )}
                    {selectedDate && (
                        <span className="filter-pill">
                            {selectedDate}
                            <X
                                size={10}
                                onClick={() => onDateSelect("")}
                                className="filter-pill-x"
                            />
                        </span>
                    )}
                </div>
            )}

            {open && (
                <div className="filter-dropdown-panel">
                    {/* Tab switcher */}
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${tab === "category" ? "active" : ""}`}
                            onClick={() => setTab("category")}
                        >
                            <Filter size={12} />
                            category
                        </button>
                        <button
                            className={`filter-tab ${tab === "date" ? "active" : ""}`}
                            onClick={() => setTab("date")}
                        >
                            <Calendar size={12} />
                            date
                        </button>
                    </div>

                    {/* Category tab */}
                    {tab === "category" && (
                        <div className="filter-category-panel">
                            <div className="filter-search-input">
                                <Search size={12} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="search categories..."
                                    value={catSearch}
                                    onChange={(e) => setCatSearch(e.target.value)}
                                />
                                {catSearch && (
                                    <X
                                        size={12}
                                        className="filter-search-clear"
                                        onClick={() => setCatSearch("")}
                                    />
                                )}
                            </div>
                            <div className="filter-category-list">
                                <button
                                    className={`filter-category-item ${!selectedCategory ? "active" : ""}`}
                                    onClick={() => {
                                        onCategorySelect("");
                                        setOpen(false);
                                    }}
                                >
                                    all categories
                                    {!selectedCategory && <span className="filter-check">✓</span>}
                                </button>
                                {filteredCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`filter-category-item ${selectedCategory === cat ? "active" : ""}`}
                                        onClick={() => {
                                            onCategorySelect(selectedCategory === cat ? "" : cat);
                                            setOpen(false);
                                        }}
                                    >
                                        {cat}
                                        {selectedCategory === cat && <span className="filter-check">✓</span>}
                                    </button>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <div className="filter-empty">no categories match "{catSearch}"</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Date tab */}
                    {tab === "date" && (
                        <div className="filter-date-panel">
                            {selectedDate && (
                                <button
                                    className="filter-clear-date"
                                    onClick={() => {
                                        onDateSelect("");
                                        setOpen(false);
                                    }}
                                >
                                    <X size={12} />
                                    clear date filter
                                </button>
                            )}
                            <DayPicker
                                mode="single"
                                selected={selectedDateObj}
                                onSelect={(day) => {
                                    if (day) {
                                        const y = day.getFullYear();
                                        const m = String(day.getMonth() + 1).padStart(2, "0");
                                        const d = String(day.getDate()).padStart(2, "0");
                                        onDateSelect(`${y}-${m}-${d}`);
                                    } else {
                                        onDateSelect("");
                                    }
                                    setOpen(false);
                                }}
                                modifiers={{
                                    hasPosts: datesWithPosts,
                                }}
                                modifiersStyles={{
                                    hasPosts: {
                                        fontWeight: 700,
                                        textDecoration: "underline",
                                        textDecorationColor: "var(--accent)",
                                        textUnderlineOffset: "4px",
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
