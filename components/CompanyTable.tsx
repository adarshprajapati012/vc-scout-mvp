"use client";

import Link from "next/link";

/** Type for a single company entry */
export interface Company {
    id: string;
    name: string;
    website: string;
    sector: string;
    stage: string;
    short_desc: string;
    enrichedAt?: string;
}

interface Props {
    companies: Company[];
    sortKey: string | null;
    sortDir: "asc" | "desc" | null;
    onSort: (key: string) => void;
}

/** Stage color mapping */
const STAGE_COLORS: Record<string, string> = {
    seed: "badge-green",
    "series-a": "badge-brand",
    "series-b": "badge-amber",
};

export default function CompanyTable({
    companies,
    sortKey,
    sortDir,
    onSort,
}: Props) {
    const arrow = (key: string) =>
        sortKey === key && sortDir ? (sortDir === "asc" ? " ↑" : " ↓") : "";

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-surface-border text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        {["name", "sector", "stage"].map((col) => (
                            <th
                                key={col}
                                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none"
                                onClick={() => onSort(col)}
                            >
                                {col}
                                {arrow(col)}
                            </th>
                        ))}
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 w-20" />
                    </tr>
                </thead>
                <tbody>
                    {companies.map((c, i) => (
                        <tr
                            key={c.id}
                            className="border-b border-surface-border/50 hover:bg-surface-overlay/50 transition-colors animate-fade-in"
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.name}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.sector}</td>
                            <td className="px-4 py-3">
                                <span className={`badge ${STAGE_COLORS[c.stage] || "badge-brand"}`}>
                                    {c.stage}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                {c.short_desc}
                            </td>
                            <td className="px-4 py-3">
                                <Link
                                    href={`/companies/${c.id}`}
                                    className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors"
                                >
                                    View →
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {companies.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                No companies match your filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
