"use client";

import { useTheme } from "@/components/ThemeProvider";
import GlobalSearch from "@/components/GlobalSearch";
import { useMobileMenu } from "@/components/MobileMenuContext";

export default function Header() {
    const { theme, toggle: toggleTheme } = useTheme();
    const { toggle: toggleMenu } = useMobileMenu();

    return (
        <header className="app-header flex items-center justify-between gap-4 px-6 py-3">
            {/* ── Mobile brand & Hamburger (visible on small screens only) ── */}
            <div className="flex md:hidden items-center gap-3">
                <button
                    onClick={toggleMenu}
                    className="p-1 -ml-1 btn-ghost rounded-md"
                    aria-label="Open mobile menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                        VS
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>VC Scout</span>
                </div>
            </div>

            {/* ── Global search ── */}
            <GlobalSearch />

            {/* ── Right-side actions ── */}
            <div className="flex items-center gap-3">
                <span className="hidden sm:inline badge badge-green text-xs">
                    ● Live
                </span>

                {/* ── Theme toggle button ── */}
                <button
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    className="btn-ghost w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    {theme === "dark" ? (
                        /* Sun icon — click to go light */
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                    ) : (
                        /* Moon icon — click to go dark */
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
}
