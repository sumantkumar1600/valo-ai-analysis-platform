import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface NewsSentiment {
  title: string;
  source: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
}

export interface FinancialMetricPoint {
  year: number;
  revenue: number | null;
  netIncome: number | null;
  freeCashFlow: number | null;
  eps?: number | null;
  marketCap?: number | null;
  peRatio?: number | null;
}

export interface FinancialSummary {
  price: number | null;
  changePercent: number | null;
  dailyChange: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  open: number | null;
  previousClose: number | null;
  volume: number | null;
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  roe: number | null;
  profitMargin: number | null;
  metrics: FinancialMetricPoint[];
}

export const ResearchState = Annotation.Root({
  ticker: Annotation<string>(),
  strategy: Annotation<string>(),
  company: Annotation<any>(), // Stores the verified company details
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  financials: Annotation<FinancialSummary>(),
  swot: Annotation<SWOTAnalysis>(),
  news: Annotation<NewsSentiment[]>(),
  // Final agent evaluations
  investmentScore: Annotation<number>(),
  decision: Annotation<'INVEST' | 'PASS'>(),
  confidenceScore: Annotation<number>(),
  reasoning: Annotation<string>(),
  risks: Annotation<string[]>(),
  opportunities: Annotation<string[]>(),
  futureOutlook: Annotation<string>(),
  markdownReport: Annotation<string>(),
});

export type ResearchStateType = typeof ResearchState.State;
