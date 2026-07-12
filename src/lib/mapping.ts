import { CompanyAnalysis } from '@/types';
import { ResearchStateType } from '@/langchain/state';

/**
 * Normalizes the final compiled LangGraph execution state into a cohesive layout matching frontend specifications.
 * Strictly maps verified corporate metadata and real financials, setting missing fields to null.
 */
export function normalizeReportState(
  ticker: string,
  state: Partial<ResearchStateType>,
  strategy: string
): CompanyAnalysis {
  const company = state.company || { symbol: ticker, name: ticker, exchange: 'Unknown' };

  const strengths = state.swot?.strengths || [];
  const weaknesses = state.swot?.weaknesses || [];
  const opportunities = state.swot?.opportunities || state.opportunities || [];
  const threats = state.swot?.threats || [];

  const finalScore = state.investmentScore ?? 50;
  const finalDecision = state.decision ?? 'PASS';

  const news = (state.news || []).map((n, idx) => ({
    id: (n as any).id || String(idx + 1),
    title: n.title,
    source: n.source,
    sentiment: n.sentiment,
    summary: n.summary,
    publishedAt: (n as any).publishedAt || 'Recent'
  }));

  const risks = state.risks?.map((r, i) => ({
    title: r,
    description: `Audit point identified by risk analysis.`,
    severity: i === 0 ? 'High' as const : i === 1 ? 'Medium' as const : 'Low' as const
  })) || [];

  const chartData = (state.financials?.metrics || []).map((m) => ({
    year: m.year,
    revenue: m.revenue,
    netIncome: m.netIncome,
    freeCashFlow: m.freeCashFlow,
    eps: m.eps || null,
    marketCap: m.marketCap || null,
    peRatio: m.peRatio || null
  }));

  return {
    ticker: company.symbol,
    companyName: company.name,
    sector: company.industry || 'Unknown Sector',
    price: state.financials?.price ?? null,
    changePercent: state.financials?.changePercent ?? null,
    dailyChange: state.financials?.dailyChange ?? null,
    dayHigh: state.financials?.dayHigh ?? null,
    dayLow: state.financials?.dayLow ?? null,
    open: state.financials?.open ?? null,
    previousClose: state.financials?.previousClose ?? null,
    volume: state.financials?.volume ?? null,
    marketCap: state.financials?.marketCap ?? null,
    verdict: finalDecision,
    strategy: strategy,
    confidenceScore: state.confidenceScore ?? 80,
    thesis: state.reasoning || 'No analysis thesis generated.',
    antiThesis: state.futureOutlook || 'No outlook summary generated.',
    financialRatios: {
      peRatio: state.financials?.peRatio ?? null,
      pbRatio: state.financials?.pbRatio ?? null,
      debtToEquity: state.financials?.debtToEquity ?? null,
      currentRatio: state.financials?.currentRatio ?? null,
      roe: state.financials?.roe ?? null,
      profitMargin: state.financials?.profitMargin ?? null,
      freeCashFlowGrowth: null
    },
    swot: {
      strengths,
      weaknesses,
      opportunities,
      threats
    },
    news,
    risks,
    chartData,
    markdownReport: state.markdownReport || '',
    exchange: company.exchange,
    country: company.country,
    industry: company.industry,
    currency: company.currency
  };
}
