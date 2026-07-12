import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const range = searchParams.get('range') || '1y';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const now = new Date();
    let period1: Date;
    let interval: "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1d" | "5d" | "1wk" | "1mo" | "3mo" = '1d';

    switch (range) {
      case '1d':
        // Capture last 2 days to account for weekends/after-hours
        period1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        interval = '5m';
        break;
      case '5d':
        period1 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
        interval = '15m';
        break;
      case '1m':
        period1 = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
      case '3m':
        period1 = new Date(now.getTime() - 93 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
      case '6m':
        period1 = new Date(now.getTime() - 186 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
      case '1y':
        period1 = new Date(now.getTime() - 366 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
      case '5y':
        period1 = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
        interval = '1wk';
        break;
      case 'max':
      default:
        period1 = new Date('1970-01-01');
        interval = '1mo';
        break;
    }

    // Call Yahoo Finance chart endpoint
    const result = (await yahooFinance.chart(symbol, {
      period1,
      interval,
      return: 'array'
    })) as any;

    if (!result || !result.quotes) {
      return NextResponse.json({ quotes: [] });
    }

    // Map and deduplicate clean results by formatted date key to satisfy lightweight-charts strictly increasing rule
    const uniqueQuotesMap = new Map<string | number, any>();
    
    for (const q of result.quotes) {
      if (q.close === null || q.open === null || q.high === null || q.low === null) {
        continue;
      }
      
      const dateObj = new Date(q.date);
      let formattedTime: string | number;
      if (range === '1d' || range === '5d') {
        formattedTime = Math.floor(dateObj.getTime() / 1000);
      } else {
        // Format as YYYY-MM-DD string for daily/weekly/monthly charts
        formattedTime = dateObj.toISOString().split('T')[0];
      }
      
      uniqueQuotesMap.set(formattedTime, {
        time: formattedTime,
        open: parseFloat(q.open.toFixed(4)),
        high: parseFloat(q.high.toFixed(4)),
        low: parseFloat(q.low.toFixed(4)),
        close: parseFloat(q.close.toFixed(4)),
        volume: q.volume !== undefined && q.volume !== null ? q.volume : null,
      });
    }

    const chartQuotes = Array.from(uniqueQuotesMap.values());
    if (range === '1d' || range === '5d') {
      chartQuotes.sort((a, b) => (a.time as number) - (b.time as number));
    } else {
      chartQuotes.sort((a, b) => (a.time as string).localeCompare(b.time as string));
    }

    return NextResponse.json({ quotes: chartQuotes });
  } catch (error: any) {
    console.error(`[Stock History API Error for ${req.url}]:`, error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve market history' }, { status: 500 });
  }
}
