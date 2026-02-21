"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCompaniesContext } from "@/components/CompaniesContext";
import { isUserAdded } from "@/lib/companies";
import EnrichPanel from "@/components/EnrichPanel";
import type { EnrichResult } from "@/components/EnrichPanel";
import type { Company } from "@/components/CompanyTable";
import { loadLists, addCompanyToList, type ListItem } from "@/lib/lists";
import { useToast } from "@/components/ToastProvider";
import NotesSection from "@/components/NotesSection";
import { getMockEnrichment } from "@/lib/mockEnrichment";

// Helper for relative time formatting
function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "(just now)";
    if (diffMins < 60) return `(${diffMins} min${diffMins > 1 ? "s" : ""} ago)`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `(${diffHours} hour${diffHours > 1 ? "s" : ""} ago)`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "(yesterday)";
    if (diffDays < 30) return `(${diffDays} day${diffDays > 1 ? "s" : ""} ago)`;

    const diffMonths = Math.floor(diffDays / 30);
    return `(${diffMonths} month${diffMonths > 1 ? "s" : ""} ago)`;
}

const STAGE_COLORS: Record<string, string> = {
    seed: "badge-green",
    "series-a": "badge-brand",
    "series-b": "badge-amber",
};

/**
 * /companies/[id] — Company profile page with Enrich button.
 */
export default function CompanyDetailPage() {
    const { companies, removeCompany } = useCompaniesContext();
    const router = useRouter();
    const params = useParams();
    const id = params ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
    const company = companies.find((c) => c.id === id) as Company | undefined;
    const canDelete = id ? isUserAdded(id) : false;

    const [enrichData, setEnrichData] = useState<EnrichResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isMock, setIsMock] = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackReason, setFallbackReason] = useState("");

    const enrichmentMode = process.env.NEXT_PUBLIC_ENRICHMENT_MODE || "live";
    const { showToast } = useToast();


    /* ── Add-to-list state ── */
    const [lists, setLists] = useState<ListItem[]>([]);
    const [listOpen, setListOpen] = useState(false);
    const [addedTo, setAddedTo] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isDev = process.env.NEXT_PUBLIC_DEV === "true";

    // Load lists on mount
    useEffect(() => {
        setLists(loadLists());
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setListOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!company) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Company not found</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    The company you&apos;re looking for doesn&apos;t exist.
                </p>
                <Link href="/companies" className="btn-primary">
                    ← Back to Companies
                </Link>
            </div>
        );
    }

    const handleAddToList = (listId: string) => {
        const updated = addCompanyToList(listId, {
            id: company.id,
            name: company.name,
            sector: company.sector,
        });
        setLists(updated);
        setAddedTo(listId);

        const listName = updated.find(l => l.id === listId)?.name || "List";
        showToast(`Added to ${listName}`, "success");

        setTimeout(() => setAddedTo(null), 2000);
    };

    /**
     * Trigger enrichment via POST /api/enrich.
     */
    const handleEnrich = async () => {
        setLoading(true);
        setError(null);
        setEnrichData(null);
        setIsMock(false);
        setIsFallback(false);

        // ── Mock mode: return demo data immediately ──
        if (enrichmentMode === "mock") {
            // Small delay for realistic UX
            await new Promise(r => setTimeout(r, 800));
            const mockData = getMockEnrichment(company.website, company.sector);
            setEnrichData(mockData);
            setIsMock(true);
            setLoading(false);
            showToast("Demo enrichment loaded", "success");
            return;
        }

        // ── Live mode: call API, fallback to mock on failure ──
        try {
            const res = await fetch("/api/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: company.website }),
            });

            if (!res.ok) {
                let errMsg = "Failed to enrich company";
                try {
                    const errJson = await res.json();
                    errMsg = errJson.error || errMsg;
                } catch {
                    errMsg = await res.text() || errMsg;
                }
                throw new Error(errMsg);
            }

            const data: EnrichResult = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setEnrichData(data);
            showToast("AI enrichment complete!", "success");
        } catch (err) {
            // Fallback: log error and show mock data with reason
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.warn(`[Enrich] Live API failed: ${msg} — using fallback demo data`);
            const mockData = getMockEnrichment(company.website, company.sector);
            setEnrichData(mockData);
            setIsFallback(true);
            setFallbackReason(msg);
            showToast("Live enrichment failed — showing demo data", "info");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear cache for this URL (dev-only feature).
     */
    const handleClearCache = async () => {
        try {
            await fetch(
                `/api/enrich?url=${encodeURIComponent(company.website)}`,
                { method: "DELETE" }
            );
            setEnrichData(null);
            setError(null);
        } catch {
            // silently fail
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* ── Breadcrumb ── */}
            <nav className="text-sm text-slate-500 dark:text-slate-500">
                <Link href="/companies" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Companies
                </Link>
                <span className="mx-2">›</span>
                <span className="text-slate-900 dark:text-slate-300">{company.name}</span>
            </nav>

            {/* ── Company Header ── */}
            <div className="card">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
                            {company.name}
                            {company.enrichedAt && (
                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wide">
                                    Enriched ✓
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">{company.short_desc}</p>
                    </div>
                    <span className={`badge ${STAGE_COLORS[company.stage] || "badge-brand"}`}>
                        {company.stage}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 dark:text-slate-500 mb-1 block">Sector</span>
                        <p className="text-slate-900 dark:text-white font-medium">{company.sector}</p>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-500 mb-1 block">Website</span>
                        <div className="flex items-center gap-2">
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-400 hover:text-brand-300 transition-colors truncate"
                            >
                                {company.website}
                            </a>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(company.website);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                title="Copy Website"
                            >
                                {copied ? (
                                    <span className="text-emerald-500 text-xs font-medium">Copied!</span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {company.enrichedAt && (
                    <div className="mt-4 pt-4 border-t border-surface-border text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Last enriched: <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {new Date(company.enrichedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 ml-1">
                            {getRelativeTime(company.enrichedAt)}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Action Row ── */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={handleEnrich}
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/60 dark:border-white/30 border-t-white rounded-full animate-spin-slow" />
                            Enriching…
                        </>
                    ) : (
                        <>🔬 Enrich with AI</>
                    )}
                </button>

                {/* ── Add to List dropdown ── */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setLists(loadLists()); // refresh in case lists changed
                            setListOpen(!listOpen);
                        }}
                        className="btn-ghost border border-surface-border"
                    >
                        📂 Add to List
                    </button>
                    {listOpen && (
                        <div
                            className="absolute top-full left-0 mt-1 w-56 rounded-lg border border-surface-border shadow-xl z-50 animate-fade-in overflow-hidden"
                            style={{ backgroundColor: "var(--color-surface)" }}
                        >
                            {lists.length === 0 ? (
                                <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No lists yet.{" "}
                                    <Link
                                        href="/lists"
                                        className="text-brand-500 hover:text-brand-400"
                                        onClick={() => setListOpen(false)}
                                    >
                                        Create one
                                    </Link>
                                </div>
                            ) : (
                                <ul className="py-1 max-h-48 overflow-y-auto">
                                    {lists.map((list) => {
                                        const already = list.companies.some(
                                            (c) => c.id === company.id
                                        );
                                        const justAdded = addedTo === list.id;
                                        return (
                                            <li key={list.id}>
                                                <button
                                                    onClick={() => handleAddToList(list.id)}
                                                    disabled={already}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-overlay/60 transition-colors disabled:opacity-50 flex items-center justify-between"
                                                    style={{ color: "var(--color-text)" }}
                                                >
                                                    <span className="truncate">{list.name}</span>
                                                    {justAdded ? (
                                                        <span className="text-emerald-500 text-xs shrink-0">✓ Added</span>
                                                    ) : already ? (
                                                        <span className="text-xs text-slate-400 shrink-0">Already in</span>
                                                    ) : null}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Delete (user-added companies only) ── */}
                {canDelete && (
                    <button
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete "${company.name}"? This cannot be undone.`)) {
                                const success = removeCompany(company.id);
                                if (success) {
                                    router.push("/companies");
                                }
                            }
                        }}
                        className="btn-ghost border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        🗑️ Delete
                    </button>
                )}

                {/* Dev-only cache clear button */}
                {isDev && enrichData && (
                    <button onClick={handleClearCache} className="btn-ghost text-xs">
                        🧹 Clear cache
                    </button>
                )}
            </div>

            {/* ── Enrichment Results ── */}
            <EnrichPanel data={enrichData} loading={loading} error={error} isMock={isMock} isFallback={isFallback} fallbackReason={fallbackReason} />

            {/* ── Notes (isolated, self-contained) ── */}
            <NotesSection companyId={company.id} />
        </div>
    );
}
