import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Shared helper to call the Tavily search endpoint
async function executeTavilySearch(query: string, searchDepth: 'basic' | 'advanced' = 'basic', maxResults: number = 5): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey === 'your-tavily-api-key-here') {
    return `Tavily API key is missing. Unable to search for query: "${query}". Ensure TAVILY_API_KEY is configured in your environment.`;
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: searchDepth,
        max_results: maxResults,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      return `Tavily search failed with status ${response.status}: ${response.statusText}`;
    }

    const data = await response.json();
    const results = data.results || [];
    
    if (results.length === 0) {
      return `No results found for search query: "${query}".`;
    }

    // Format output cleanly as structured text
    let formattedOutput = '';
    if (data.answer) {
      formattedOutput += `Direct Answer Summary:\n${data.answer}\n\n`;
    }
    
    formattedOutput += `Detailed Search Results:\n`;
    results.forEach((r: any, idx: number) => {
      formattedOutput += `\n[${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}\n`;
    });

    return formattedOutput;
  } catch (e: any) {
    return `Error occurred during Tavily search: ${e.message || e}`;
  }
}

// ----------------------------------------------------
// 1. COMPANY PROFILE TOOL
// ----------------------------------------------------
export const companyProfileTool = new DynamicStructuredTool({
  name: 'company_profile',
  description: 'Use this tool to search for general background information, sector vertical, foundation details, and company history.',
  schema: z.object({
    query: z.string().describe('The stock ticker symbol or full company name to investigate.'),
  }),
  func: async (input: any) => {
    const { query } = input;
    return await executeTavilySearch(`${query} company profile background overview sector foundation history`, 'basic', 4);
  }
});

// ----------------------------------------------------
// 2. LATEST NEWS TOOL
// ----------------------------------------------------
export const latestNewsTool = new DynamicStructuredTool({
  name: 'latest_news',
  description: 'Use this tool to fetch the most recent news headlines, press releases, earnings updates, and overall market sentiment.',
  schema: z.object({
    query: z.string().describe('The stock ticker symbol or company name to fetch news for.'),
  }),
  func: async (input: any) => {
    const { query } = input;
    return await executeTavilySearch(`${query} stock latest news press releases market updates earnings calendar`, 'basic', 5);
  }
});

// ----------------------------------------------------
// 3. RECENT DEVELOPMENTS TOOL
// ----------------------------------------------------
export const recentDevelopmentsTool = new DynamicStructuredTool({
  name: 'recent_developments',
  description: 'Use this tool to search for recent business expansions, corporate actions, mergers, acquisitions, regulatory disputes, or lawsuits.',
  schema: z.object({
    query: z.string().describe('The stock ticker symbol or company name to search developments for.'),
  }),
  func: async (input: any) => {
    const { query } = input;
    return await executeTavilySearch(`${query} recent operational developments product launches merger acquisition legal filings`, 'advanced', 5);
  }
});

// ----------------------------------------------------
// 4. MANAGEMENT TOOL
// ----------------------------------------------------
export const managementTool = new DynamicStructuredTool({
  name: 'management_team',
  description: 'Use this tool to search for key leadership profiles, executive officers, board of directors, and leadership transition events.',
  schema: z.object({
    query: z.string().describe('The stock ticker symbol or company name to find management team for.'),
  }),
  func: async (input: any) => {
    const { query } = input;
    return await executeTavilySearch(`${query} key executives leadership board of directors CEO executive management team changes`, 'basic', 4);
  }
});

// ----------------------------------------------------
// 5. PRODUCTS TOOL
// ----------------------------------------------------
export const productsTool = new DynamicStructuredTool({
  name: 'products_and_services',
  description: 'Use this tool to inspect the primary product catalog, subscription systems, core services, and customer value propositions.',
  schema: z.object({
    query: z.string().describe('The stock ticker symbol or company name to inspect products for.'),
  }),
  func: async (input: any) => {
    const { query } = input;
    return await executeTavilySearch(`${query} primary products services product portfolio software hardware brand offerings`, 'basic', 5);
  }
});

// ----------------------------------------------------
// 6. COMPETITORS TOOL
// ----------------------------------------------------
export const competitorsTool = new DynamicStructuredTool({
  name: 'competitor_landscape',
  description: 'Use this tool to audit main competitors, market share statistics, industry sector peers, and core competitive advantages.',
  schema: z.object({
    query: z.string().describe('The stock ticker symbol or company name to analyze competitors for.'),
  }),
  func: async (input: any) => {
    const { query } = input;
    return await executeTavilySearch(`${query} key competitors market share SWOT peers industry classification competitive landscape`, 'advanced', 5);
  }
});

// Group tools for bulk registration in agent executors
export const researchAgentTools = [
  companyProfileTool,
  latestNewsTool,
  recentDevelopmentsTool,
  managementTool,
  productsTool,
  competitorsTool
];
