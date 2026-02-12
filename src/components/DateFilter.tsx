"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface DateFilterProps {
    postDates: Record<string, number>;
    selected: string;
    onSelect: (date: string) => void;
}

export function DateFilter({ postDates, selected, onSelect }: DateFilterProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Dates that have posts
    const datesWithPosts = Object.keys(postDates).map((d) => new Date(d + "T00:00:00"));

    const selectedDate = selected ? new Date(selected + "T00:00:00") : undefined;

    return (
        <div className="filter-section">
            <span className="filter-label">Date</span>
            <div className="date-filter-wrapper" ref={ref}>
                <button
                    className={`date-filter-btn ${selected ? "active" : ""}`}
                    onClick={() => setOpen(!open)}
                >
                    <Calendar size={14} />
                    {selected ? (
                        <>
                            {selected}
                            <X
                                size={12}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect("");
                                    setOpen(false);
                                }}
                                style={{ marginLeft: 4, cursor: "pointer" }}
                            />
                        </>
                    ) : (
                        "filter by date"
                    )}
                </button>

                {open && (
                    <div className="date-picker-popup">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(day) => {
                                if (day) {
                                    const y = day.getFullYear();
                                    const m = String(day.getMonth() + 1).padStart(2, "0");
                                    const d = String(day.getDate()).padStart(2, "0");
                                    onSelect(`${y}-${m}-${d}`);
                                } else {
                                    onSelect("");
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
        </div>
    );
}
