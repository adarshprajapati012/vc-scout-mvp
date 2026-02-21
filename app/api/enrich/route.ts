import { NextResponse } from "next/server";
import { fetchHtml } from "@/lib/fetchHtml";
import { callGemini, type EnrichmentData } from "@/lib/gemini";

// ── Simple in-memory cache (24h TTL) ──
const cache = new Map<string, { result: EnrichmentData; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "Missing 'url' in request body." }, { status: 400 });
        }

        // Validate URL
        try {
            const parsed = new URL(url);
            if (!["http:", "https:"].includes(parsed.protocol)) {
                return NextResponse.json({ error: "URL must be http or https." }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
        }

        // Check cache
        const cached = cache.get(url);
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            return NextResponse.json({ ...cached.result, _cached: true });
        }

        // 1. Fetch the webpage
        const pageText = await fetchHtml(url);
        if (!pageText || pageText.length < 50) {
            return NextResponse.json(
                { error: "Could not extract enough text from the URL." },
                { status: 422 }
            );
        }

        // 2. Call Gemini
        const result = await callGemini(pageText, url);

        // 3. Cache and return
        cache.set(url, { result, ts: Date.now() });
        return NextResponse.json(result);

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Enrich] Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/** DELETE /api/enrich?url=... — Clear cache for a URL (dev-only) */
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (url) cache.delete(url);
    return NextResponse.json({ success: true });
}
