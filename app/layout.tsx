import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { MobileMenuProvider } from "@/components/MobileMenuContext";
import { CompaniesProvider } from "@/components/CompaniesContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "VC Scout — Intelligence Interface",
    description:
        "AI-powered VC intelligence platform for company research, enrichment, and pipeline management.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            try {
                                if (localStorage.getItem('vc-scout-theme') === 'light') {
                                    document.documentElement.classList.remove('dark');
                                } else {
                                    document.documentElement.classList.add('dark');
                                }
                            } catch (_) {}
                        `,
                    }}
                />
            </head>
            <body className="flex h-screen overflow-hidden">
                <ThemeProvider>
                    <ToastProvider>
                        <CompaniesProvider>
                            <MobileMenuProvider>
                                {/* ── Sidebar ── */}
                                <Sidebar />

                                {/* ── Main content area ── */}
                                <div className="flex flex-1 flex-col overflow-hidden relative">
                                    <Header />
                                    <main
                                        className="flex-1 overflow-y-auto p-6 animate-fade-in"
                                        style={{ background: "var(--color-bg)" }}
                                    >
                                        <div className="min-h-full flex flex-col">
                                            <div className="flex-1">
                                                {children}
                                            </div>
                                        </div>
                                    </main>
                                </div>
                            </MobileMenuProvider>
                        </CompaniesProvider>
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
