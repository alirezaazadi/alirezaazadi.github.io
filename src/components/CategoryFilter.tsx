"use client";

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (cat: string) => void;
}

export function CategoryFilter({
    categories,
    selected,
    onSelect,
}: CategoryFilterProps) {
    if (categories.length === 0) return null;

    return (
        <div className="filter-section">
            <span className="filter-label">Categories</span>
            <div className="category-chips">
                <button
                    className={`tag ${!selected ? "active" : ""}`}
                    onClick={() => onSelect("")}
                >
                    all
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`tag ${selected === cat ? "active" : ""}`}
                        onClick={() => onSelect(selected === cat ? "" : cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
