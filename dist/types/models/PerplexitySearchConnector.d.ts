import { IAISearchConnector } from '@crewdle/web-sdk-types';
export declare class PerplexitySearchConnector implements IAISearchConnector {
    search(query: string, apiKey: string): Promise<string>;
}
