"use client";

/** Type for enrichment API response */
export interface EnrichResult {
    summary: string;
    what_they_do: string[];
    keywords: string[];
    derived_signals: string[];
    sources: { url: string; timestamp: string }[];
    error?: string;
}

interface Props {
    data: EnrichResult | null;
    loading: boolean;
    error: string | null;
    /** True when enrichment data is from mock/demo mode */
    isMock?: boolean;
    /** True when live API failed and mock data is shown as fallback */
    isFallback?: boolean;
    /** The reason the live API failed (shown in fallback banner) */
    fallbackReason?: string;
}

/**
 * EnrichPanel — displays enrichment data returned by /api/enrich.
 * Shows summary, bullets, keyword tags, signal badges, and sources.
 */
export default function EnrichPanel({ data, loading, error, isMock, isFallback, fallbackReason }: Props) {
    if (loading) {
        return (
            <div className="space-y-4">
                {/* Progress Indicator */}
                <div className="card border-brand-500/20 bg-brand-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                        <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                            Analyzing website content…
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full animate-progress-bar" />
                    </div>
                </div>

                {/* Skeleton Block 1 (Summary) */}
                <div className="card animate-pulse">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700/50 rounded mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-4/6"></div>
                    </div>
                </div>

                {/* Skeleton Block 2 (What They Do) */}
                <div className="card animate-pulse">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-slate-200 dark:bg-slate-700/50"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-3/4"></div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-slate-200 dark:bg-slate-700/50"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2"></div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-slate-200 dark:bg-slate-700/50"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>

                {/* Skeleton Block 3 (Tags) */}
                <div className="card animate-pulse">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700/50 rounded mb-4"></div>
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
                        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
                        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <div className="card border-red-500/30 bg-red-500/5">
                <p className="text-red-400 text-sm font-medium">⚠ Enrichment Error</p>
                <p className="text-red-300/70 text-sm mt-1">{error}</p>
            </div>
        );
    }

    /* ── No data yet ── */
    if (!data) return null;

    /* ── LLM returned an error field ── */
    if (data.error) {
        return (
            <div className="card border-amber-500/30 bg-amber-500/5">
                <p className="text-amber-400 text-sm">{data.error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* ── Mode Indicator Banner ── */}
            {isFallback && (
                <div className="card border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-start gap-2">
                        <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
                        <div>
                            <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                                Live API unavailable — displaying demo enrichment.
                            </p>
                            {fallbackReason && (
                                <p className="text-amber-600/70 dark:text-amber-400/60 text-xs mt-1">
                                    Reason: {fallbackReason}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isMock && !isFallback && (
                <div className="card border-brand-500/20 bg-brand-500/5">
                    <div className="flex items-center gap-2">
                        <span className="text-brand-500 text-sm">🧪</span>
                        <p className="text-brand-600 dark:text-brand-400 text-sm">
                            Demo Mode — enrichment results are simulated.
                        </p>
                    </div>
                </div>
            )}
            {/* ── Summary ── */}
            {data.summary && (
                <div className="card">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                        Summary
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{data.summary}</p>
                </div>
            )}

            {/* ── What They Do ── */}
            {data.what_they_do?.length > 0 && (
                <div className="card">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                        What They Do
                    </h4>
                    <ul className="space-y-1.5">
                        {data.what_they_do.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Keywords ── */}
            {data.keywords?.length > 0 && (
                <div className="card">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                        Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.keywords.map((kw, i) => (
                            <span key={i} className="badge badge-brand">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Derived Signals ── */}
            {data.derived_signals?.length > 0 && (
                <div className="card">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                        Derived Signals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.derived_signals.map((sig, i) => (
                            <span key={i} className="badge badge-amber">
                                ⚡ {sig}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sources ── */}
            {data.sources?.length > 0 && (
                <div className="card">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                        Sources
                    </h4>
                    <ul className="space-y-1">
                        {data.sources.map((src, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                                <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-400 hover:text-brand-300 transition-colors truncate"
                                >
                                    {src.url}
                                </a>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isMock || isFallback
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    }`}>
                                    {isMock || isFallback ? "Demo" : "Live"}
                                </span>
                                <span className="text-xs text-slate-500">{src.timestamp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
