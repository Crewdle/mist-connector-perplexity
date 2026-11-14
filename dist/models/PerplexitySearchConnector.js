/**
 * Perplexity moved Sonar to the Agent API (2026-11): the legacy
 * `/chat/completions` endpoint is being retired model by model, and the only
 * Sonar model left is `perplexity/sonar` ($0.25 in / $2.50 out per 1M tokens,
 * plus a per-invocation `web_search` fee). `sonar-pro`, `sonar-reasoning-pro`
 * and `sonar-deep-research` are no longer documented — every legacy id is
 * served by `perplexity/sonar`.
 */
const AGENT_API_URL = 'https://api.perplexity.ai/v1/agent';
const AGENT_MODEL = 'perplexity/sonar';
/**
 * Sonar's list input price (USD per 1M tokens). The connector result can only
 * carry tokens, so the per-search tool fee Perplexity reports
 * (`usage.cost.tool_calls_cost`) is returned as input-token equivalents at this
 * price — exact when the workflow bills the catalog `sonar` doc at $0.25/1M.
 */
export const SONAR_INPUT_USD_PER_MILLION = 0.25;
const SYSTEM_PROMPT = 'You are an intelligent assistant designed to provide concise and accurate answers based on facts from trusted sources. Prioritize clarity and relevance. If information is unavailable, say so politely.';
export class PerplexitySearchConnector {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async search(query, modelId) {
        console.log('PerplexitySearchConnector.search', modelId);
        const response = await this.post({
            model: AGENT_MODEL,
            instructions: SYSTEM_PROMPT,
            input: query,
            tools: [{ type: 'web_search' }],
        });
        console.log('PerplexitySearchConnector.search response');
        const output = Array.isArray(response?.output) ? response.output : [];
        let result = output
            .filter((item) => item?.type === 'message')
            .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
            .filter((part) => part?.type === 'output_text' && typeof part.text === 'string')
            .map((part) => part.text)
            .join('');
        const citations = [];
        for (const item of output) {
            if (item?.type !== 'search_results' || !Array.isArray(item.results))
                continue;
            for (const r of item.results) {
                if (typeof r?.url === 'string' && !citations.includes(r.url))
                    citations.push(r.url);
            }
        }
        if (citations.length > 0) {
            result += '\n\nSources:';
            citations.forEach((url, i) => {
                result += `\n\n[${i + 1}] ${url}`;
            });
        }
        const usage = response?.usage ?? {};
        const toolUsd = Number(usage.cost?.tool_calls_cost);
        const feeTokens = Number.isFinite(toolUsd) && toolUsd > 0 ? Math.round((toolUsd * 1_000_000) / SONAR_INPUT_USD_PER_MILLION) : 0;
        return {
            output: result,
            inputTokens: (usage.input_tokens ?? 0) + feeTokens,
            outputTokens: usage.output_tokens ?? 0,
        };
    }
    /** One Agent API call, retried twice on 429/5xx/network errors. */
    async post(body) {
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0)
                await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
            let res;
            try {
                res = await fetch(AGENT_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        // Perplexity (Cloudflare) answers gzip + chunked; ask for identity so
                        // no decompressor sits between us and the body.
                        'Accept-Encoding': 'identity',
                    },
                    body: JSON.stringify(body),
                });
            }
            catch (err) {
                lastError = err;
                continue;
            }
            if (res.ok)
                return res.json();
            lastError = new Error(`Perplexity HTTP ${res.status}`);
            if (res.status !== 429 && res.status < 500)
                break;
        }
        throw lastError;
    }
}
