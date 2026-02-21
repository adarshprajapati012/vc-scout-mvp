"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCompaniesContext } from "@/components/CompaniesContext";
import CompanyTable from "@/components/CompanyTable";
import CompanyCard from "@/components/CompanyCard";
import type { Company } from "@/components/CompanyTable";
import AddCompanyModal from "@/components/AddCompanyModal";

const PAGE_SIZE = 5;

/**
 * /companies — Searchable, filterable, sortable company list with pagination.
 */
export default function CompaniesPage() {
    return (
        <Suspense fallback={<div className="max-w-6xl mx-auto py-8 text-center text-slate-600 dark:text-slate-500">Loading…</div>}>
            <CompaniesContent />
        </Suspense>
    );
}

function CompaniesContent() {
    const { companies } = useCompaniesContext();
    const searchParams = useSearchParams();
    const initialQuery = searchParams?.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [sector, setSector] = useState("All");
    const [stage, setStage] = useState("All");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
    const [page, setPage] = useState(0);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const SECTORS = useMemo(() => ["All", ...Array.from(new Set(companies.map((c) => c.sector)))], [companies]);
    const STAGES = useMemo(() => ["All", ...Array.from(new Set(companies.map((c) => c.stage)))], [companies]);

    // ── Filter, search, sort ──
    const filtered = useMemo(() => {
        let result = companies as Company[];

        // Text search
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.short_desc.toLowerCase().includes(q) ||
                    c.sector.toLowerCase().includes(q)
            );
        }

        // Sector filter
        if (sector !== "All") {
            result = result.filter((c) => c.sector === sector);
        }

        // Stage filter
        if (stage !== "All") {
            result = result.filter((c) => c.stage === stage);
        }

        // Sort (only when a column is actively selected)
        if (sortKey && sortDir) {
            const STAGE_ORDER: Record<string, number> = {
                seed: 0,
                "series-a": 1,
                "series-b": 2,
                "series-c": 3,
            };

            result = [...result].sort((a, b) => {
                let cmp: number;
                if (sortKey === "stage") {
                    const aOrd = STAGE_ORDER[a.stage] ?? 99;
                    const bOrd = STAGE_ORDER[b.stage] ?? 99;
                    cmp = aOrd - bOrd;
                } else {
                    const aVal = (a as unknown as Record<string, string>)[sortKey] || "";
                    const bVal = (b as unknown as Record<string, string>)[sortKey] || "";
                    cmp = aVal.localeCompare(bVal);
                }
                return sortDir === "asc" ? cmp : -cmp;
            });
        }

        return result;
    }, [query, sector, stage, sortKey, sortDir]);

    // ── Pagination ──
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortDir === "asc") {
                // 1st click was asc → switch to desc
                setSortDir("desc");
            } else {
                // 2nd click was desc → reset to default (no sort)
                setSortKey(null);
                setSortDir(null);
            }
        } else {
            // New column → start ascending
            setSortKey(key);
            setSortDir("asc");
        }
        setPage(0);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Companies</h1>

                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="flex gap-1 bg-surface-overlay rounded-lg p-1 border border-surface-border">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "table"
                                ? "bg-brand-600 text-white"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                }`}
                        >
                            Table
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "grid"
                                ? "bg-brand-600 text-white"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                }`}
                        >
                            Grid
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary py-1.5 min-h-[32px] text-sm px-4"
                    >
                        + Add Company
                    </button>
                </div>
            </div>

            {/* ── Filters bar ── */}
            <div className="card flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search companies…"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(0);
                    }}
                    className="input flex-1"
                />
                <select
                    value={sector}
                    onChange={(e) => {
                        setSector(e.target.value);
                        setPage(0);
                    }}
                    className="input sm:w-40"
                >
                    {SECTORS.map((s) => (
                        <option key={s} value={s}>
                            {s === "All" ? "All Sectors" : s}
                        </option>
                    ))}
                </select>
                <select
                    value={stage}
                    onChange={(e) => {
                        setStage(e.target.value);
                        setPage(0);
                    }}
                    className="input sm:w-40"
                >
                    {STAGES.map((s) => (
                        <option key={s} value={s}>
                            {s === "All" ? "All Stages" : s}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── Results ── */}
            {viewMode === "table" ? (
                <div className="card p-0 overflow-hidden">
                    <CompanyTable
                        companies={paged}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paged.map((c) => (
                        <CompanyCard key={c.id} company={c} />
                    ))}
                    {paged.length === 0 && (
                        <div className="col-span-full card text-center py-16 flex flex-col items-center justify-center border-dashed border-2 bg-surface-overlay/30">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No companies found
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                                We couldn't find any companies matching your current filters. Try adjusting your search or clearing the filters.
                            </p>
                            <button
                                onClick={() => { setQuery(""); setSector("All"); setStage("All"); }}
                                className="btn-ghost"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-slate-600 dark:text-slate-500">
                        Showing {page * PAGE_SIZE + 1}–
                        {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                        {filtered.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="btn-ghost border border-surface-border disabled:opacity-30"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className="btn-ghost border border-surface-border disabled:opacity-30"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            <AddCompanyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}
