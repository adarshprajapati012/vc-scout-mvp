"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MobileMenuContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    toggle: () => void;
    close: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export function useMobileMenu() {
    const context = useContext(MobileMenuContext);
    if (!context) {
        throw new Error("useMobileMenu must be used within a MobileMenuProvider");
    }
    return context;
}

export function MobileMenuProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    return (
        <MobileMenuContext.Provider value={{ isOpen, setIsOpen, toggle, close }}>
            {children}
        </MobileMenuContext.Provider>
    );
}
