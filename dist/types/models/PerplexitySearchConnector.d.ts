import { IAISearchConnector } from '@crewdle/web-sdk-types';
export declare class PerplexitySearchConnector implements IAISearchConnector {
    private client;
    constructor(apiKey: string);
    search(query: string): Promise<string>;
}
