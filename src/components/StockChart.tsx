'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<'1d' | '5d' | '1m' | '3m' | '6m' | '1y' | '5y' | 'max'>('1y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stock/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);
        if (!response.ok) {
          throw new Error('Failed to fetch historical stock prices');
        }
        const data = await response.json();
        if (active) {
          if (!data.quotes || data.quotes.length === 0) {
            setQuotes([]);
          } else {
            setQuotes(data.quotes);
          }
        }
      } catch (e: any) {
        if (active) {
          setError(e.message || 'Historical stock price data is currently unavailable.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [symbol, range]);

  useEffect(() => {
    if (!containerRef.current || quotes.length === 0) return;

    // Clean up container
    containerRef.current.innerHTML = '';

    const width = containerRef.current.clientWidth;
    const chart = createChart(containerRef.current, {
      width: width,
      height: 320,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: range === '1d' || range === '5d',
      },
      crosshair: {
        vertLine: {
          color: 'rgba(34, 197, 94, 0.3)',
          width: 1,
          style: 3, // dashed
        },
        horzLine: {
          color: 'rgba(34, 197, 94, 0.3)',
          width: 1,
          style: 3, // dashed
        },
      },
    });

    // Detect if candlestick data is fully valid (needs non-null open, high, low, close)
    const hasOHLC = quotes.every(q => q.open !== null && q.high !== null && q.low !== null && q.close !== null);

    if (hasOHLC) {
      // Render candlestick chart
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });
      candleSeries.setData(quotes);
    } else {
      // Fall back to line chart
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#22c55e',
        lineWidth: 2,
      });
      lineSeries.setData(quotes.map(q => ({ time: q.time, value: q.close })));
    }

    // Add volume chart underneath if volume exists
    const hasVolume = quotes.some(q => q.volume !== null && q.volume > 0);
    if (hasVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // overlay
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // volume at the bottom 20%
          bottom: 0,
        },
      });

      volumeSeries.setData(
        quotes.map((q, idx) => {
          const prevClose = idx > 0 ? quotes[idx - 1].close : q.open;
          const color = q.close >= prevClose ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 24, 24, 0.2)';
          return {
            time: q.time,
            value: q.volume || 0,
            color,
          };
        })
      );
    }

    // Resize observer to keep responsive behavior
    const handleResize = () => {
      if (chart && containerRef.current) {
        chart.resize(containerRef.current.clientWidth, 320);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Auto-fit content
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [quotes, range]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-4 mb-4">
        <div>
          <h3 className="font-bold text-base text-white">Stock Interactive Chart</h3>
          <p className="text-[11px] text-gray-400 font-medium font-mono uppercase">{symbol} | Real-Time Market Feed</p>
        </div>

        {/* Range Selectors */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 no-print flex-wrap">
          {(['1d', '5d', '1m', '3m', '6m', '1y', '5y', 'max'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all duration-150 uppercase
                ${range === r 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[320px] w-full flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-950/20 backdrop-blur-[2px] z-10">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">Fetching Market Ledger...</span>
          </div>
        )}

        {error && (
          <div className="w-full text-center py-12 text-sm text-red-400 flex flex-col items-center justify-center gap-2">
            <span className="text-gray-500 text-xs">⚠️ {error}</span>
            <span className="text-xs text-gray-400">Historical stock price data is currently unavailable.</span>
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <div className="w-full text-center py-12 text-sm text-gray-400">
            Historical stock price data is currently unavailable.
          </div>
        )}

        <div ref={containerRef} className="w-full h-[320px]" />
      </div>
    </div>
  );
}
