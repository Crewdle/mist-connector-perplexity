# Crewdle Mist Perplexity Search Connector

## Introduction

The Crewdle Mist Perplexity Search Connector is a solution designed for seamless and efficient integration of web search capabilities into your applications. This connector enables the Crewdle SDK to tap into the power of Perplexity, providing robust and high-performance search functionality. With its easy integration and reliable data retrieval, it's an ideal choice for developers looking to implement scalable and effective search solutions within their ecosystem, perfectly complementing the Generative AI Worker Connector for advanced AI-driven applications.

## Getting Started

Before diving in, ensure you have installed the [Crewdle Mist SDK](https://www.npmjs.com/package/@crewdle/web-sdk).

## Installation

```bash
npm install @crewdle/mist-connector-perplexity
```

## Usage

```TypeScript
import { PerplexitySearchConnector } from '@crewdle/mist-connector-perplexity';

const sdk = await SDK.getInstance(config.vendorId, config.accessToken, {
  aiSearchConnector: PerplexitySearchConnector,
}, config.secretKey);
```

## Need Help?

Reach out to support@crewdle.com or raise an issue in our repository for any assistance.

## Join Our Community

For an engaging discussion about your specific use cases or to connect with fellow developers, we invite you to join our Discord community. Follow this link to become a part of our vibrant group: [Join us on Discord](https://discord.gg/XJ3scBYX).
