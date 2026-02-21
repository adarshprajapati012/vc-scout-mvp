"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Company, loadAllCompanies, saveCompany, deleteCompany } from "@/lib/companies";
import { useToast } from "@/components/ToastProvider";

interface CompaniesContextType {
    companies: Company[];
    addCompany: (comp: Omit<Company, "id" | "createdAt">) => Promise<boolean>;
    removeCompany: (id: string) => boolean;
    reloadCompanies: () => void;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export function useCompaniesContext() {
    const context = useContext(CompaniesContext);
    if (!context) {
        throw new Error("useCompaniesContext must be used within a CompaniesProvider");
    }
    return context;
}

export function CompaniesProvider({ children }: { children: ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const { showToast } = useToast();

    // Load initial data on mount
    useEffect(() => {
        setCompanies(loadAllCompanies());
    }, []);

    const reloadCompanies = () => {
        setCompanies(loadAllCompanies());
    };

    const addCompany = async (newComp: Omit<Company, "id" | "createdAt">) => {
        try {
            const updated = saveCompany(newComp);
            setCompanies(updated);
            showToast(`Added ${newComp.name} successfully`, "success");
            return true;
        } catch (e: any) {
            showToast(e.message || "Failed to add company", "error");
            return false;
        }
    };

    const removeCompany = (id: string) => {
        try {
            const updated = deleteCompany(id);
            setCompanies(updated);
            showToast("Company deleted", "success");
            return true;
        } catch (e: any) {
            showToast(e.message || "Cannot delete this company", "error");
            return false;
        }
    };

    return (
        <CompaniesContext.Provider value={{ companies, addCompany, removeCompany, reloadCompanies }}>
            {children}
        </CompaniesContext.Provider>
    );
}
