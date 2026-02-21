"use client";

import { useState, useEffect, useRef } from "react";
import { getNotes, addNote, updateNote, deleteNote, type Note } from "@/lib/notes";

/**
 * NotesSection — Self-contained notes panel for a company profile.
 *
 * All state is local. Persistence uses localStorage via lib/notes.ts.
 * No impact on parent component state, routing, or other features.
 */
interface Props {
    companyId: string;
}

export default function NotesSection({ companyId }: Props) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [draft, setDraft] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const editRef = useRef<HTMLTextAreaElement>(null);

    // Load notes on mount and when companyId changes
    useEffect(() => {
        setNotes(getNotes(companyId));
    }, [companyId]);

    // Auto-focus the edit textarea when entering edit mode
    useEffect(() => {
        if (editingId && editRef.current) {
            editRef.current.focus();
            editRef.current.selectionStart = editRef.current.value.length;
        }
    }, [editingId]);

    // ── Handlers ──

    const handleAdd = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        setNotes(addNote(companyId, trimmed));
        setDraft("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl/Cmd + Enter to save
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleStartEdit = (note: Note) => {
        setEditingId(note.id);
        setEditContent(note.content);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const trimmed = editContent.trim();
        if (!trimmed) return;
        setNotes(updateNote(companyId, editingId, trimmed));
        setEditingId(null);
        setEditContent("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const handleDelete = (noteId: string) => {
        setNotes(deleteNote(companyId, noteId));
        // If we were editing this note, cancel the edit
        if (editingId === noteId) {
            setEditingId(null);
            setEditContent("");
        }
    };

    /** Format timestamp for display */
    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit",
        });
    };

    return (
        <div className="space-y-4">
            {/* ── Section Header ── */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    📝 Notes
                    {notes.length > 0 && (
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            ({notes.length})
                        </span>
                    )}
                </h3>
            </div>

            {/* ── Compose Area ── */}
            <div className="card">
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a note about this company…"
                    rows={3}
                    className="w-full bg-transparent border border-surface-border rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 resize-none transition-all"
                />
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        Ctrl+Enter to save
                    </span>
                    <button
                        onClick={handleAdd}
                        disabled={!draft.trim()}
                        className="btn-primary text-sm px-4 py-1.5"
                    >
                        Save Note
                    </button>
                </div>
            </div>

            {/* ── Notes List ── */}
            {notes.length === 0 ? (
                <div className="card border-dashed border-surface-border">
                    <div className="text-center py-6">
                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                            No notes yet. Add your first note above.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="card group transition-all hover:border-brand-500/20"
                        >
                            {editingId === note.id ? (
                                /* ── Edit Mode ── */
                                <div>
                                    <textarea
                                        ref={editRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                                e.preventDefault();
                                                handleSaveEdit();
                                            }
                                            if (e.key === "Escape") handleCancelEdit();
                                        }}
                                        rows={3}
                                        className="w-full bg-transparent border border-brand-500/30 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none transition-all"
                                    />
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="btn-ghost text-xs px-3 py-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={!editContent.trim()}
                                            className="btn-primary text-xs px-3 py-1"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── Display Mode ── */
                                <div>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                    </p>
                                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-border">
                                        <div className="text-xs text-slate-400 dark:text-slate-500">
                                            {formatTime(note.createdAt)}
                                            {note.updatedAt !== note.createdAt && (
                                                <span className="ml-1.5 text-slate-400/70">
                                                    · edited {formatTime(note.updatedAt)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleStartEdit(note)}
                                                className="btn-ghost text-xs px-2 py-0.5"
                                                title="Edit note"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="btn-ghost text-xs px-2 py-0.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                title="Delete note"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
