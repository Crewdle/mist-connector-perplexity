import OpenAI from 'openai';

import { IAISearchConnector } from '@crewdle/web-sdk-types';

export class PerplexitySearchConnector implements IAISearchConnector {
  async search(query: string, apiKey: string): Promise<string> {
    const client = new OpenAI({
      baseURL: 'https://api.perplexity.ai',
      apiKey,
    });

    const response = await client.chat.completions.create({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'Be precise and concise.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });

    return response.choices[0].message.content ?? '';
  }
}