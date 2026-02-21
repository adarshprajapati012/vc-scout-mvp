"use client";

import { useState, useEffect } from "react";

interface SavedSearch {
    id: string;
    query: string;
    sector: string;
    stage: string;
    savedAt: string;
}

const STORAGE_KEY = "vc-scout-saved-searches";

function loadSearches(): SavedSearch[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveSearches(searches: SavedSearch[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

/**
 * /saved — Saved search queries (persisted in localStorage).
 */
export default function SavedSearchesPage() {
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [query, setQuery] = useState("");
    const [sector, setSector] = useState("All");
    const [stage, setStage] = useState("All");

    useEffect(() => {
        setSearches(loadSearches());
    }, []);

    const saveSearch = () => {
        if (!query.trim() && sector === "All" && stage === "All") return;
        const updated = [
            ...searches,
            {
                id: `search-${Date.now()}`,
                query: query.trim(),
                sector,
                stage,
                savedAt: new Date().toISOString(),
            },
        ];
        setSearches(updated);
        saveSearches(updated);
        setQuery("");
        setSector("All");
        setStage("All");
    };

    const deleteSearch = (id: string) => {
        const updated = searches.filter((s) => s.id !== id);
        setSearches(updated);
        saveSearches(updated);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Saved Searches</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Save frequently used search queries for quick access. Data is stored
                    locally in your browser.
                </p>
            </div>

            {/* ── Create saved search ── */}
            <div className="card space-y-3">
                <input
                    type="text"
                    placeholder="Search query…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input"
                />
                <div className="flex gap-2">
                    <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="input flex-1"
                    >
                        <option value="All">All Sectors</option>
                        <option value="AI">AI</option>
                        <option value="FinTech">FinTech</option>
                        <option value="HealthTech">HealthTech</option>
                        <option value="Climate">Climate</option>
                        <option value="Dev Tools">Dev Tools</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                    <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="input flex-1"
                    >
                        <option value="All">All Stages</option>
                        <option value="seed">Seed</option>
                        <option value="series-a">Series A</option>
                        <option value="series-b">Series B</option>
                    </select>
                </div>
                <button onClick={saveSearch} className="btn-primary w-full">
                    🔖 Save Search
                </button>
            </div>

            {/* ── Saved searches list ── */}
            {searches.length === 0 ? (
                <div className="card text-center text-slate-600 dark:text-slate-500 py-8">
                    <p className="text-lg mb-1">🔖</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">No saved searches yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {searches.map((s) => (
                        <div
                            key={s.id}
                            className="card flex items-center justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {s.query && (
                                        <span className="text-slate-900 dark:text-white font-medium">"{s.query}"</span>
                                    )}
                                    {s.sector !== "All" && (
                                        <span className="badge badge-brand">{s.sector}</span>
                                    )}
                                    {s.stage !== "All" && (
                                        <span className="badge badge-green">{s.stage}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Saved {new Date(s.savedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/companies?q=${encodeURIComponent(s.query)}`}
                                    className="btn-ghost text-brand-400 text-xs"
                                >
                                    Run →
                                </a>
                                <button
                                    onClick={() => deleteSearch(s.id)}
                                    className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
