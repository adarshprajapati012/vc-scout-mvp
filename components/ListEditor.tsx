"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    type ListItem,
    loadLists,
    saveLists,
    removeCompanyFromList,
} from "@/lib/lists";
import { useToast } from "@/components/ToastProvider";

export default function ListEditor() {
    const [lists, setLists] = useState<ListItem[]>([]);
    const [newName, setNewName] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { showToast } = useToast();

    // Hydrate from localStorage on mount
    useEffect(() => {
        setLists(loadLists());
    }, []);

    /* ── Create ── */
    const createList = () => {
        if (!newName.trim()) return;
        const updated: ListItem[] = [
            ...lists,
            {
                id: `list-${Date.now()}`,
                name: newName.trim(),
                companies: [],
                createdAt: new Date().toISOString(),
            },
        ];
        setLists(updated);
        saveLists(updated);
        setNewName("");
        showToast(`Created list "${newName.trim()}"`, "success");
    };

    /* ── Delete list ── */
    const deleteList = (id: string) => {
        const listName = lists.find(l => l.id === id)?.name || "List";
        const updated = lists.filter((l) => l.id !== id);
        setLists(updated);
        saveLists(updated);
        if (expandedId === id) setExpandedId(null);
        showToast(`Deleted list "${listName}"`, "error");
    };

    /* ── Remove company from list ── */
    const handleRemoveCompany = (listId: string, companyId: string) => {
        const list = lists.find(l => l.id === listId);
        const company = list?.companies.find(c => c.id === companyId);
        const updated = removeCompanyFromList(listId, companyId);
        setLists(updated);
        if (company) {
            showToast(`Removed ${company.name} from list`, "info");
        }
    };

    /* ── Export as JSON ── */
    const exportJSON = (list: ListItem) => {
        const blob = new Blob([JSON.stringify(list, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${list.name.replace(/\s+/g, "_")}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Exported ${list.name} as JSON`, "success");
    };

    /* ── Export as CSV ── */
    const exportCSV = (list: ListItem) => {
        const header = "id,name,sector";
        const rows = list.companies.map(
            (c) => `${c.id},${c.name.replace(/,/g, "")},${c.sector.replace(/,/g, "")}`
        );
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${list.name.replace(/\s+/g, "_")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Exported ${list.name} as CSV`, "success");
    };

    /* ── Toggle expand ── */
    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-4">
            {/* ── Create new list ── */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="New list name…"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createList()}
                    className="input flex-1"
                />
                <button onClick={createList} className="btn-primary whitespace-nowrap">
                    + Create
                </button>
            </div>

            {/* ── Existing lists ── */}
            {lists.length === 0 ? (
                <div className="card text-center py-16 flex flex-col items-center justify-center border-dashed border-2 bg-surface-overlay/30">
                    <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4 text-brand-500">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No lists found
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                        Create your first list above to start organizing companies for outreach, diligence, or portfolio tracking.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {lists.map((list) => {
                        const isExpanded = expandedId === list.id;
                        return (
                            <div key={list.id} className="card p-0 overflow-hidden">
                                {/* ── List header row ── */}
                                <div
                                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-overlay/50 transition-colors"
                                    onClick={() => toggleExpand(list.id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className="text-slate-400 text-xs transition-transform duration-200"
                                            style={{
                                                display: "inline-block",
                                                transform: isExpanded
                                                    ? "rotate(90deg)"
                                                    : "rotate(0deg)",
                                            }}
                                        >
                                            ▶
                                        </span>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                {list.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {list.companies.length} companies ·
                                                Created{" "}
                                                {new Date(
                                                    list.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => exportJSON(list)}
                                            className="btn-ghost text-xs"
                                            title="Export as JSON"
                                        >
                                            📥 JSON
                                        </button>
                                        <button
                                            onClick={() => exportCSV(list)}
                                            className="btn-ghost text-xs"
                                            title="Export as CSV"
                                        >
                                            📄 CSV
                                        </button>
                                        <button
                                            onClick={() => deleteList(list.id)}
                                            className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* ── Expanded companies ── */}
                                {isExpanded && (
                                    <div className="border-t border-surface-border px-5 py-3 animate-fade-in">
                                        {list.companies.length === 0 ? (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 py-2 text-center">
                                                No companies in this list yet. Go
                                                to a{" "}
                                                <Link
                                                    href="/companies"
                                                    className="text-brand-500 hover:text-brand-400 transition-colors"
                                                >
                                                    company profile
                                                </Link>{" "}
                                                to add one.
                                            </p>
                                        ) : (
                                            <ul className="divide-y divide-surface-border/50">
                                                {list.companies.map((c) => (
                                                    <li
                                                        key={c.id}
                                                        className="flex items-center justify-between py-2"
                                                    >
                                                        <Link
                                                            href={`/companies/${c.id}`}
                                                            className="flex items-center gap-3 min-w-0 group"
                                                        >
                                                            <span className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors truncate">
                                                                {c.name}
                                                            </span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                                                {c.sector}
                                                            </span>
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveCompany(
                                                                    list.id,
                                                                    c.id
                                                                )
                                                            }
                                                            className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs shrink-0"
                                                            title="Remove from list"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
