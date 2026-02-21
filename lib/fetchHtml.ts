/**
 * fetchHtml.ts — Server-side utility to fetch a webpage and extract visible text.
 *
 * SECURITY NOTE: This runs server-side only. Never import this in client components.
 */

/**
 * Fetches a URL and returns the visible text content, stripping scripts/styles.
 * @param url - The URL to fetch (must be http or https).
 * @param maxLength - Maximum character length of returned text (default 12000).
 */
export async function fetchHtml(url: string, maxLength = 15_000): Promise<string> {
    const res = await fetch(url, {
        headers: {
            // Identify ourselves to avoid bot blocks on some sites
            "User-Agent":
                "Mozilla/5.0 (compatible; VCScoutBot/1.0; +https://github.com/vc-scout)",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();

    // ── Strip non-content sections to reduce noise & token usage ──
    let text = html
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<aside[\s\S]*?<\/aside>/gi, "")
        .replace(/<svg[\s\S]*?<\/svg>/gi, "")
        .replace(/<form[\s\S]*?<\/form>/gi, "")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ") // strip remaining HTML tags
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // ── Collapse whitespace ──
    text = text.replace(/\s+/g, " ").trim();

    // ── Truncate to stay within LLM context limits ──
    return text.slice(0, maxLength);
}
