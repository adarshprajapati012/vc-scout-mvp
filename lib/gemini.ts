/**
 * gemini.ts — Server-side helper to call Google AI Studio (Gemini) via REST.
 *
 * Takes webpage text + source URL, returns structured enrichment data.
 * The API key is read from process.env and NEVER exposed to the client.
 */

/** Shape of the enrichment result returned by the LLM */
export interface EnrichmentData {
    summary: string;
    what_they_do: string[];
    keywords: string[];
    derived_signals: string[];
    sources: { url: string; timestamp: string }[];
    enrichedAt: string;
}

/**
 * Calls Gemini to extract structured enrichment data from webpage text.
 * Single call with one automatic retry on 429 (rate-limit).
 */
export async function callGemini(
    pageText: string,
    sourceUrl: string
): Promise<EnrichmentData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY. Set it in .env.local and restart.");
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    // Keep input short — 15k chars is plenty for company info
    const text = pageText.slice(0, 15_000);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
        system_instruction: {
            parts: [{
                text: "You must output ONLY a valid JSON object matching the schema in the user message. No markdown, no explanation, just JSON."
            }]
        },
        contents: [{
            role: "user",
            parts: [{
                text: `Extract company enrichment data from this webpage text. Output JSON matching this exact schema:

{
  "summary": "1-2 sentence company summary",
  "what_they_do": ["bullet 1", "bullet 2"] (3-6 items),
  "keywords": ["keyword1", "keyword2"] (5-10 items),
  "derived_signals": ["signal 1", "signal 2"] (2-4 items, e.g. "careers page present", "active blog", "changelog exists"),
  "sources": [{"url": "${sourceUrl}", "timestamp": "${new Date().toISOString()}"}]
}

Rules:
- Only use information from the text below. Do not make things up.
- Output exactly one JSON object, nothing else.

--- WEBPAGE TEXT ---
${text}
--- END ---`
            }]
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    };

    // Try the call, retry once after 15s if rate-limited
    let res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
    });

    if (res.status === 429) {
        console.log("[Enrich] Rate-limited, waiting 15s and retrying...");
        await new Promise(r => setTimeout(r, 15_000));
        res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(30_000),
        });
    }

    if (!res.ok) {
        const errText = await res.text();
        console.error(`[Enrich] Gemini error (${res.status}):`, errText.slice(0, 300));
        throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 150)}`);
    }

    // Parse the response
    const json = await res.json();
    const rawText: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from the response
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1) {
        throw new Error("LLM returned no JSON. Try again.");
    }

    const parsed: EnrichmentData = JSON.parse(rawText.substring(start, end + 1));

    // Ensure all fields exist
    parsed.summary = parsed.summary || "";
    parsed.what_they_do = Array.isArray(parsed.what_they_do) ? parsed.what_they_do : [];
    parsed.keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
    parsed.derived_signals = Array.isArray(parsed.derived_signals) ? parsed.derived_signals : [];
    parsed.sources = Array.isArray(parsed.sources) ? parsed.sources : [];

    // Stamp enrichment time
    const now = new Date().toISOString();
    parsed.enrichedAt = now;
    if (!parsed.sources.some(s => s.url === sourceUrl)) {
        parsed.sources.push({ url: sourceUrl, timestamp: now });
    }

    console.log(`[Enrich] ✅ Done for ${sourceUrl}`);
    return parsed;
}
