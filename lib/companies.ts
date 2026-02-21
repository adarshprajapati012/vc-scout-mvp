import defaultCompanies from "@/data/companies.json";

export interface Company {
    id: string;
    name: string;
    website: string;
    sector: string;
    stage: string;
    short_desc: string;
    enrichedAt?: string;
    createdAt?: string;
}

const STORAGE_KEY = "vc-scout-user-companies";

/**
 * Loads all companies by combining static data and dynamic user data from localStorage
 */
export function loadAllCompanies(): Company[] {
    if (typeof window === "undefined") return defaultCompanies as Company[];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const userAdded = stored ? JSON.parse(stored) as Company[] : [];
        // User added companies come first so they override or simply appear at the top if sorting by date
        return [...userAdded, ...defaultCompanies as Company[]];
    } catch (e) {
        console.error("Failed to parse user companies", e);
        return defaultCompanies as Company[];
    }
}

/**
 * Saves a single new company into localStorage and returns the combined list
 */
export function saveCompany(newCompany: Omit<Company, "id" | "createdAt">): Company[] {
    if (typeof window === "undefined") return defaultCompanies as Company[];

    const company: Company = {
        ...newCompany,
        id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
    };

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const userAdded = stored ? JSON.parse(stored) as Company[] : [];

        // Prevent exact name duplicates globally
        const allComps = loadAllCompanies();
        if (allComps.some(c => c.name.toLowerCase() === company.name.toLowerCase())) {
            throw new Error(`Company "${company.name}" already exists.`);
        }

        userAdded.push(company);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userAdded));
        return loadAllCompanies();
    } catch (e) {
        throw e;
    }
}

/**
 * Returns true if the company was user-added (exists in localStorage), false if static
 */
export function isUserAdded(companyId: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const userAdded = stored ? JSON.parse(stored) as Company[] : [];
        return userAdded.some(c => c.id === companyId);
    } catch {
        return false;
    }
}

/**
 * Deletes a user-added company from localStorage and returns the updated combined list.
 * Static (default) companies cannot be deleted.
 */
export function deleteCompany(companyId: string): Company[] {
    if (typeof window === "undefined") return loadAllCompanies();

    const stored = localStorage.getItem(STORAGE_KEY);
    const userAdded = stored ? JSON.parse(stored) as Company[] : [];

    const idx = userAdded.findIndex(c => c.id === companyId);
    if (idx === -1) {
        throw new Error("Only user-added companies can be deleted.");
    }

    userAdded.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userAdded));
    return loadAllCompanies();
}
