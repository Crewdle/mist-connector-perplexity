import OpenAI from 'openai';

import { IAISearchConnector, IAISearchConnectorResult } from '@crewdle/web-sdk-types';

export class PerplexitySearchConnector implements IAISearchConnector {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://api.perplexity.ai',
      apiKey,
      // Perplexity (Cloudflare) returns real answers as gzip + chunked, and the
      // node-fetch v2 layer the openai v4 SDK uses throws ERR_STREAM_PREMATURE_CLOSE
      // decompressing that combination on Node 22 — failing every non-trivial
      // call. Requesting identity (uncompressed) sidesteps the decompressor, the
      // same way the cloudlet-docker proxy already does.
      defaultHeaders: { 'Accept-Encoding': 'identity' },
      maxRetries: 2,
    });
  }

  async search(query: string, modelId: string): Promise<IAISearchConnectorResult> {
    console.log('PerplexitySearchConnector.search', query, modelId);
    const response = await this.client.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent assistant designed to provide concise and accurate answers based on facts from trusted sources. Prioritize clarity and relevance. If information is unavailable, say so politely.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });
    console.log('PerplexitySearchConnector.search response');

    let result = response.choices[0].message.content ?? '';

    const responseObj = response as any;
    if (responseObj.citations && responseObj.citations.length > 0) {
      result += '\n\nSources:';
      let i = 1;
      for (const citation of responseObj.citations) {
        result += `\n\n[${i}] ${citation}`;
        i++;
      }
    }

    return {
      output: result,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    };
  }
}