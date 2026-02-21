"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
    theme: Theme;
    toggle: () => void;
}>({ theme: "dark", toggle: () => { } });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    // On mount, read saved preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("vc-scout-theme") as Theme | null;
        const preferred = saved ?? "dark";
        setTheme(preferred);
        applyTheme(preferred);
    }, []);

    const toggle = () => {
        setTheme((prev) => {
            const next: Theme = prev === "dark" ? "light" : "dark";
            localStorage.setItem("vc-scout-theme", next);
            applyTheme(next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
}
