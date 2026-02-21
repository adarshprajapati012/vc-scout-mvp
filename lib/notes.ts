/**
 * notes.ts — localStorage utility for per-company notes.
 *
 * Storage key: "company_notes"
 * Structure: { [companyId]: Note[] }
 *
 * Follows the same defensive pattern as lib/lists.ts:
 *  - SSR-safe (no-op when window is undefined)
 *  - Graceful fallback on corrupted data
 */

/** A single note attached to a company */
export interface Note {
    id: string;
    content: string;
    createdAt: string;   // ISO 8601
    updatedAt: string;   // ISO 8601
}

/** All notes keyed by company ID */
type NotesStore = Record<string, Note[]>;

const STORAGE_KEY = "company_notes";

/** Generate a short unique ID */
function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Safely read the full notes store from localStorage */
function readStore(): NotesStore {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        // Validate it's a plain object
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
        return parsed as NotesStore;
    } catch {
        return {};
    }
}

/** Persist the full notes store */
function writeStore(store: NotesStore): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ── Public CRUD API ──────────────────────────────────────

/** Get all notes for a company, newest first */
export function getNotes(companyId: string): Note[] {
    const store = readStore();
    const notes = store[companyId] || [];
    // Sort newest first by updatedAt
    return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/** Create a new note for a company */
export function addNote(companyId: string, content: string): Note[] {
    const store = readStore();
    const now = new Date().toISOString();
    const note: Note = { id: uid(), content, createdAt: now, updatedAt: now };
    store[companyId] = [...(store[companyId] || []), note];
    writeStore(store);
    return getNotes(companyId);
}

/** Update an existing note's content */
export function updateNote(companyId: string, noteId: string, content: string): Note[] {
    const store = readStore();
    const notes = store[companyId] || [];
    const target = notes.find((n) => n.id === noteId);
    if (target) {
        target.content = content;
        target.updatedAt = new Date().toISOString();
        writeStore(store);
    }
    return getNotes(companyId);
}

/** Delete a note */
export function deleteNote(companyId: string, noteId: string): Note[] {
    const store = readStore();
    store[companyId] = (store[companyId] || []).filter((n) => n.id !== noteId);
    // Clean up empty arrays
    if (store[companyId].length === 0) delete store[companyId];
    writeStore(store);
    return getNotes(companyId);
}
