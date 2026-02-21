"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileMenu } from "@/components/MobileMenuContext";

/** Navigation items for the sidebar */
const NAV_ITEMS = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/companies", label: "Companies", icon: "🏢" },
    { href: "/lists", label: "Lists", icon: "📋" },
    { href: "/saved", label: "Saved Searches", icon: "🔖" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close } = useMobileMenu();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                close();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, close]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* ── Mobile Overlay ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 md:hidden animate-fade-in backdrop-blur-sm"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar Drawer ── */}
            <aside
                className={`
                    app-sidebar flex flex-col
                    fixed md:relative
                    top-0 left-0 h-screen z-50
                    w-[280px] md:w-60
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* ── Brand ── */}
                <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-600/30">
                        VS
                    </div>
                    <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
                        VC Scout
                    </span>
                    {/* Close button on mobile */}
                    <button
                        onClick={close}
                        className="ml-auto md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label="Close mobile menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map(({ href, label, icon }) => {
                        const isActive =
                            href === "/" ? pathname === "/" : (pathname?.startsWith(href) ?? false);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={close}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? "bg-brand-600/15 text-brand-500 border border-brand-500/20"
                                    : "hover:bg-[var(--color-overlay)]"
                                    }`}
                                style={isActive ? {} : { color: "var(--color-muted)" }}
                            >
                                <span className="text-base">{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Footer ── */}
                <div className="px-5 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        VC Scout MVP v1.0
                        <br />
                        <span style={{ opacity: 0.6 }}>Built by Adarsh Prajapati</span>
                    </p>
                </div>
            </aside>
        </>
    );
}
