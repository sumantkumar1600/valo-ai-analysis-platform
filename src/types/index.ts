export interface FinancialRatios {
  peRatio: number | null;
  pbRatio: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  roe: number | null;
  freeCashFlowGrowth: number | null;
  profitMargin: number | null;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Risk {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  publishedAt: string;
}

export interface ChartDataPoint {
  year: number;
  revenue: number | null;
  netIncome: number | null;
  freeCashFlow: number | null;
  eps: number | null;
  marketCap: number | null;
  peRatio: number | null;
}

export interface CompanyAnalysis {
  ticker: string;
  companyName: string;
  sector: string;
  price: number | null;
  changePercent: number | null;
  dailyChange?: number | null;
  dayHigh?: number | null;
  dayLow?: number | null;
  open?: number | null;
  previousClose?: number | null;
  volume?: number | null;
  marketCap?: number | null;
  verdict: 'INVEST' | 'PASS';
  strategy: string;
  confidenceScore: number;
  thesis: string;
  antiThesis: string;
  financialRatios: FinancialRatios;
  swot: SWOT;
  risks: Risk[];
  news: NewsItem[];
  chartData: ChartDataPoint[];
  markdownReport?: string;
  exchange?: string;
  country?: string;
  industry?: string;
  currency?: string;
  isMockData?: boolean;
}

export interface VerifiedCompany {
  symbol: string;
  name: string;
  exchange: string;
  country?: string;
  industry?: string;
  currency?: string;
}

export interface CompanySearchResult {
  symbol: string;
  name: string;
  exchange: string;
  quoteType?: string;
  country?: string;
  industry?: string;
  currency?: string;
}

export interface CompanyLookupResponse {
  status: 'empty' | 'multiple' | 'success';
  results: CompanySearchResult[];
}
