import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { CompanySearchResult, CompanyLookupResponse } from '@/types';

const yahooFinance = new YahooFinance();

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { status: 'empty', results: [] } as CompanyLookupResponse,
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    

    
    const searchRes = (await yahooFinance.search(trimmedQuery, {
      newsCount: 0,
    })) as any;

    if (!searchRes || !searchRes.quotes || searchRes.quotes.length === 0) {
      return NextResponse.json({
        status: 'empty',
        results: []
      } as CompanyLookupResponse);
    }

    // Filter to equities, ETFs, etc. and remove quotes with empty symbols
    const filteredQuotes = searchRes.quotes.filter(
      (q: any) =>
        q.symbol &&
        (q.quoteType === 'EQUITY' ||
          q.quoteType === 'ETF' ||
          q.quoteType === 'MUTUALFUND' ||
          q.quoteType === 'INDEX')
    );

    if (filteredQuotes.length === 0) {
      return NextResponse.json({
        status: 'empty',
        results: []
      } as CompanyLookupResponse);
    }

    // Map into standard CompanySearchResult structure
    const results: CompanySearchResult[] = filteredQuotes.map((q: any) => ({
      symbol: q.symbol,
      name: q.longname || q.shortname || q.symbol,
      exchange: q.exchange || 'Unknown Exchange',
      quoteType: q.quoteType || 'EQUITY',
      country: q.country || 'Unknown Country',
      industry: q.industry || q.sector || 'Unknown Industry',
      currency: q.currency
    }));

    // Deduplicate results by symbol
    const seen = new Set<string>();
    const uniqueResults = results.filter((item) => {
      const k = item.symbol.toUpperCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (uniqueResults.length === 0) {
      return NextResponse.json({
        status: 'empty',
        results: []
      } as CompanyLookupResponse);
    }

    if (uniqueResults.length === 1) {
      return NextResponse.json({
        status: 'success',
        results: uniqueResults
      } as CompanyLookupResponse);
    }

    // Multiple matches found
    return NextResponse.json({
      status: 'multiple',
      results: uniqueResults
    } as CompanyLookupResponse);
  } catch (error: any) {
    console.error('Company validation search route error:', error);
    return NextResponse.json(
      { status: 'empty', results: [] } as CompanyLookupResponse,
      { status: 500 }
    );
  }
}
