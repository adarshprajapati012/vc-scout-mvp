import Link from "next/link";
import companies from "@/data/companies.json";

/**
 * Home / Dashboard page — shows quick stats and featured companies.
 */
export default function HomePage() {
    const sectors = Array.from(new Set(companies.map((c) => c.sector)));
    const stages = Array.from(new Set(companies.map((c) => c.stage)));

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* ── Hero ── */}
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                    VC Intelligence Interface
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                    Research, enrich, and track high-potential companies with AI-powered
                    insights. Built for venture capital teams.
                </p>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-3xl font-bold text-brand-500 dark:text-brand-400">{companies.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Companies Tracked</p>
                </div>
                <div className="card text-center">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{sectors.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sectors Covered</p>
                </div>
                <div className="card text-center">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stages.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Funding Stages</p>
                </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="flex gap-3 justify-center">
                <Link href="/companies" className="btn-primary">
                    🏢 Browse Companies
                </Link>
                <Link href="/lists" className="btn-ghost border border-surface-border">
                    📋 My Lists
                </Link>
            </div>

            {/* ── Featured companies ── */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Recently Added
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.slice(0, 3).map((c) => (
                        <Link key={c.id} href={`/companies/${c.id}`}>
                            <div className="card card-hover">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{c.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    {c.sector} · {c.stage}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {c.short_desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
