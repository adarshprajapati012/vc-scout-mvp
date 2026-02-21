"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCompaniesContext } from "@/components/CompaniesContext";

export default function GlobalSearch() {
    const { companies } = useCompaniesContext();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce the input for suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Global shortcut '/' to focus search
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is already typing in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === "/") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Compute top 5 suggestions based on debounced search
    const suggestions = useMemo(() => {
        if (!debouncedSearch) return [];

        const lowerQ = debouncedSearch.toLowerCase();
        return companies
            .filter(c => c.name.toLowerCase().includes(lowerQ))
            .slice(0, 5);
    }, [debouncedSearch]);

    // Reset highlight when search changes
    useEffect(() => {
        setHighlightIndex(-1);
    }, [debouncedSearch]);

    // Handle Keyboard Navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
                // Navigate to selected suggestion
                router.push(`/companies/${suggestions[highlightIndex].id}`);
                setIsOpen(false);
                setSearch("");
                setDebouncedSearch("");
            } else if (search.trim()) {
                // Default search (go to /companies?q=...)
                router.push(`/companies?q=${encodeURIComponent(search.trim())}`);
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    // Keep highlighted item in view
    useEffect(() => {
        if (highlightIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll("li");
            const activeItem = items[highlightIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightIndex]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/companies?q=${encodeURIComponent(search.trim())}`);
            setIsOpen(false);
        }
    };

    /**
     * Helper to highlight the matched text inside the company name
     */
    const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
        if (!query) return <>{text}</>;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <span key={i} className="font-bold text-brand-600 dark:text-brand-400">
                            {part}
                        </span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </>
        );
    };

    return (
        <div className="flex-1 max-w-md relative" ref={wrapperRef}>
            <form onSubmit={handleFormSubmit}>
                <div className="relative">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                        style={{ color: "var(--color-muted)" }}
                        aria-hidden="true"
                    >
                        🔍
                    </span>
                    <input
                        ref={inputRef}
                        type="search"
                        placeholder="Search companies…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className="input pl-9 pr-10 w-full"
                        aria-expanded={isOpen}
                        role="combobox"
                        aria-controls="search-suggestions"
                        aria-activedescendant={
                            highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined
                        }
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                            /
                        </kbd>
                    </div>
                </div>
            </form>

            {/* ── Dropdown Suggestions ── */}
            {isOpen && debouncedSearch.length > 0 && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border border-surface-border shadow-2xl shadow-brand-500/10 z-50 overflow-hidden animate-fade-in"
                    style={{ backgroundColor: "var(--color-surface)" }}
                >
                    {suggestions.length > 0 ? (
                        <ul id="search-suggestions" ref={listRef} role="listbox" className="py-1.5">
                            {suggestions.map((company, index) => {
                                const isSelected = index === highlightIndex;
                                return (
                                    <li
                                        key={company.id}
                                        id={`suggestion-${index}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        className="px-1.5"
                                    >
                                        <Link
                                            href={`/companies/${company.id}`}
                                            onClick={() => {
                                                setIsOpen(false);
                                                setSearch("");
                                                setDebouncedSearch("");
                                            }}
                                            className={`flex flex-col px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                                ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 transform scale-[0.99]"
                                                : "hover:bg-slate-50 dark:hover:bg-surface-overlay text-slate-700 dark:text-slate-300"
                                                }`}
                                        >
                                            <span className="text-sm font-semibold truncate leading-tight">
                                                <HighlightMatch text={company.name} query={debouncedSearch} />
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 opacity-80">
                                                {company.sector}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-overlay flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-900 dark:text-white font-medium mb-1 drop-shadow-sm">
                                No results for &quot;<span className="text-brand-600 dark:text-brand-400">{debouncedSearch}</span>&quot;
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Check spelling or try a broader term.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
