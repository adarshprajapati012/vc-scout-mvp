/**
 * mockEnrichment.ts — Hardcoded demo enrichment data for mock/fallback mode.
 *
 * Used when:
 *  - NEXT_PUBLIC_ENRICHMENT_MODE === "mock" (reviewer demo without API key)
 *  - Live API call fails (graceful fallback)
 *
 * Returns data matching the EnrichResult schema exactly.
 */

import type { EnrichResult } from "@/components/EnrichPanel";

/** Mock data keyed by sector for realistic demo results */
const MOCK_BY_SECTOR: Record<string, EnrichResult> = {
    AI: {
        summary:
            "An AI-focused company building intelligent automation tools for enterprise workflows, leveraging large language models and proprietary training pipelines.",
        what_they_do: [
            "Develops enterprise AI platform for document processing",
            "Offers API-based integration for workflow automation",
            "Provides custom model fine-tuning services",
            "Maintains open-source developer toolkits",
        ],
        keywords: [
            "artificial intelligence", "LLM", "NLP", "automation",
            "machine learning", "enterprise AI", "document processing",
        ],
        derived_signals: [
            "Careers page detected",
            "Active engineering blog",
            "Open-source GitHub repos",
            "Recent funding announcement",
        ],
        sources: [{ url: "https://example.com", timestamp: new Date().toISOString() }],
    },
    FinTech: {
        summary:
            "A financial technology company providing modern payment infrastructure and digital banking solutions for businesses and startups.",
        what_they_do: [
            "Processes real-time cross-border payments",
            "Offers business banking accounts and treasury management",
            "Provides developer APIs for payment integration",
            "Handles regulatory compliance and KYC",
        ],
        keywords: [
            "fintech", "payments", "banking", "API",
            "compliance", "treasury", "cross-border", "B2B",
        ],
        derived_signals: [
            "Careers page detected",
            "Active company blog",
            "Changelog present",
            "Developer documentation available",
        ],
        sources: [{ url: "https://example.com", timestamp: new Date().toISOString() }],
    },
    HealthTech: {
        summary:
            "A health technology company using data-driven approaches to personalize patient care and improve clinical outcomes.",
        what_they_do: [
            "Analyzes genomic and clinical data for precision medicine",
            "Partners with hospitals and research institutions",
            "Develops AI-powered diagnostic tools",
            "Maintains HIPAA-compliant data infrastructure",
        ],
        keywords: [
            "healthtech", "precision medicine", "genomics", "diagnostics",
            "clinical data", "HIPAA", "AI healthcare",
        ],
        derived_signals: [
            "Careers page detected",
            "Recent press coverage",
            "Research publications listed",
        ],
        sources: [{ url: "https://example.com", timestamp: new Date().toISOString() }],
    },
};

/** Default fallback for unknown sectors */
const DEFAULT_MOCK: EnrichResult = {
    summary:
        "A technology company building innovative solutions in their domain, with a focus on scalability, developer experience, and enterprise readiness.",
    what_they_do: [
        "Develops core platform and APIs",
        "Serves enterprise and SMB customers",
        "Maintains developer documentation and SDKs",
        "Offers cloud-hosted and on-premise deployment",
    ],
    keywords: [
        "SaaS", "platform", "API", "cloud",
        "enterprise", "developer tools", "scalable",
    ],
    derived_signals: [
        "Careers page detected",
        "Active blog",
        "Changelog present",
    ],
    sources: [{ url: "https://example.com", timestamp: new Date().toISOString() }],
};

/**
 * Returns mock enrichment data for a company.
 * Selects sector-specific data when available, otherwise uses default.
 *
 * @param website - Company URL (used for the source entry)
 * @param sector  - Company sector for tailored mock data
 */
export function getMockEnrichment(website: string, sector?: string): EnrichResult {
    const base = (sector && MOCK_BY_SECTOR[sector]) || DEFAULT_MOCK;
    const now = new Date().toISOString();

    // Deep clone to avoid mutating the template, update sources with real URL
    return {
        ...base,
        what_they_do: [...base.what_they_do],
        keywords: [...base.keywords],
        derived_signals: [...base.derived_signals],
        sources: [{ url: website, timestamp: now }],
    };
}
