import { IAISearchConnector, IAISearchConnectorResult } from '@crewdle/web-sdk-types';
/**
 * Sonar's list input price (USD per 1M tokens). The connector result can only
 * carry tokens, so the per-search tool fee Perplexity reports
 * (`usage.cost.tool_calls_cost`) is returned as input-token equivalents at this
 * price — exact when the workflow bills the catalog `sonar` doc at $0.25/1M.
 */
export declare const SONAR_INPUT_USD_PER_MILLION = 0.25;
export declare class PerplexitySearchConnector implements IAISearchConnector {
    private readonly apiKey;
    constructor(apiKey: string);
    search(query: string, modelId: string): Promise<IAISearchConnectorResult>;
    /** One Agent API call, retried twice on 429/5xx/network errors. */
    private post;
}
