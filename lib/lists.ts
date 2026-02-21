/**
 * lists.ts — Shared localStorage utilities for the Lists feature.
 *
 * Used by both ListEditor (Lists page) and CompanyDetailPage (Add to List).
 * This keeps the storage format in one place so both sides stay in sync.
 */

/** A company entry stored inside a list */
export interface ListCompany {
    id: string;
    name: string;
    sector: string;
}

/** A single user-created list */
export interface ListItem {
    id: string;
    name: string;
    createdAt: string;
    companies: ListCompany[];
}

const STORAGE_KEY = "vc-scout-lists";

/** Load all lists from localStorage */
export function loadLists(): ListItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        // Migrate legacy format (companyIds: string[]) → companies: ListCompany[]
        return raw.map((list: Record<string, unknown>) => {
            if (Array.isArray(list.companyIds) && !Array.isArray(list.companies)) {
                return { ...list, companies: [], companyIds: undefined };
            }
            return list;
        }) as ListItem[];
    } catch {
        return [];
    }
}

/** Persist all lists to localStorage */
export function saveLists(lists: ListItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

/** Add a company to a specific list (no-op if already present) */
export function addCompanyToList(
    listId: string,
    company: ListCompany
): ListItem[] {
    const lists = loadLists();
    const target = lists.find((l) => l.id === listId);
    if (!target) return lists;
    if (target.companies.some((c) => c.id === company.id)) return lists;
    target.companies.push(company);
    saveLists(lists);
    return lists;
}

/** Remove a company from a specific list */
export function removeCompanyFromList(
    listId: string,
    companyId: string
): ListItem[] {
    const lists = loadLists();
    const target = lists.find((l) => l.id === listId);
    if (!target) return lists;
    target.companies = target.companies.filter((c) => c.id !== companyId);
    saveLists(lists);
    return lists;
}
