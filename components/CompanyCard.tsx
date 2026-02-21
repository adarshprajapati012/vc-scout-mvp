"use client";

import Link from "next/link";
import type { Company } from "./CompanyTable";

const STAGE_COLORS: Record<string, string> = {
    seed: "badge-green",
    "series-a": "badge-brand",
    "series-b": "badge-amber",
};

export default function CompanyCard({ company }: { company: Company }) {
    return (
        <Link href={`/companies/${company.id}`}>
            <div className="card card-hover group cursor-pointer">
                {/* Top row: name + stage badge */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors flex items-center gap-2">
                        {company.name}
                        {company.enrichedAt && (
                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wide">
                                Enriched ✓
                            </span>
                        )}
                    </h3>
                    <span className={`badge ${STAGE_COLORS[company.stage] || "badge-brand"}`}>
                        {company.stage}
                    </span>
                </div>

                {/* Sector */}
                <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-2">
                    {company.sector}
                </p>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {company.short_desc}
                </p>

                {/* Website domain */}
                <p className="mt-3 text-xs text-brand-400 truncate">
                    {company.website.replace(/^https?:\/\//, "")}
                </p>
            </div>
        </Link>
    );
}
