import OpenAI from 'openai';
export class PerplexitySearchConnector {
    async search(query, apiKey) {
        const client = new OpenAI({
            baseURL: 'https://api.perplexity.ai',
            apiKey,
        });
        const response = await client.chat.completions.create({
            model: 'llama-3.1-sonar-large-128k-online',
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
        let result = response.choices[0].message.content ?? '';
        const responseObj = response;
        if (responseObj.citations && responseObj.citations.length > 0) {
            result += '\n\nSources:';
            let i = 1;
            for (const citation of responseObj.citations) {
                result += `\n\n[${i}] ${citation}`;
                i++;
            }
        }
        return result;
    }
}
