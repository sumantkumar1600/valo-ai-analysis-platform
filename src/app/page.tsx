'use client';

import React, { useState, useEffect } from 'react';
import StockChart from '@/components/StockChart';

import { 
  Search, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Newspaper, 
  DollarSign, 
  Clock, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  FileText,
  BarChart3,
  Bookmark,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { mockCompanyData, popularTickers } from '@/lib/mockData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import { CompanyAnalysis, VerifiedCompany, CompanySearchResult } from '@/types';
export default function Dashboard() {
  // Navigation & UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchlist' | 'settings'>('dashboard');
  
  // Search & Execution States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('Growth Focus');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'fetching_financials' | 'analyzing_sentiment' | 'evaluating_risks' | 'committee_verdict' | 'finished'>('idle');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyAnalysis | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeChartTab, setActiveChartTab] = useState<'revenue_profit' | 'eps' | 'market_cap' | 'pe'>('revenue_profit');
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Verification candidates
  const [searchCandidates, setSearchCandidates] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Toast notifications state
  interface ToastItem {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('valo_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Chart interaction
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Strategies list
  const strategies = [
    { name: 'Growth Focus', desc: 'Prioritizes sales expansion, product market fit, and R&D velocity.' },
    { name: 'Value Investing', desc: 'Focuses on low P/E, stable margins, cash reserves, and dividend safety.' },
    { name: 'Speculative Growth', desc: 'High-risk bets on AI technology breakthroughs and sector disruption.' }
  ];

  // Initiate trusted company directory search prior to running LangGraph audits
  const handleSearchInitiate = async (query: string) => {
    if (!query || !query.trim()) {
      showToast('error', 'Empty Input: Please enter a valid stock symbol or company name.');
      return;
    }

    setErrorMessage('');
    setIsSearching(true);
    setSearchCandidates([]);
    showToast('info', `Searching directory database for "${query}"...`);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) {
        throw new Error('Company verification search failed.');
      }

      const data = await res.json();
      setIsSearching(false);

      if (data.status === 'empty') {
        const errorText = `No company matching '${query}' was found. Please enter a valid publicly listed company name or stock ticker.`;
        setErrorMessage(errorText);
        showToast('error', errorText);
      } else if (data.status === 'success') {
        const verified = data.results[0];
        showToast('success', `Verified: Found "${verified.name}" (${verified.symbol})`);
        handleAnalyze(verified);
      } else if (data.status === 'multiple') {
        setSearchCandidates(data.results);
        showToast('info', `Found ${data.results.length} matching entities. Please choose from the candidate list.`);
      }
    } catch (e: any) {
      setIsSearching(false);
      const errMsg = e.message || 'An error occurred during company verification.';
      setErrorMessage(errMsg);
      showToast('error', errMsg);
    }
  };

  // Run the live agent streaming execution graph with professional retry and timeout handling
  const handleAnalyze = async (company: VerifiedCompany) => {
    setErrorMessage('');
    setIsAnalyzing(true);
    setShowReport(false);
    setExecutionLogs([]);
    setLoadingProgress(0);
    setCurrentStep('fetching_financials');
    showToast('info', `Initializing LangGraph audit logs for ${company.name}...`);

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;

    while (attempts < maxAttempts && !success) {
      const controller = new AbortController();
      // Configure 30-second network response limit
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);

      try {
        attempts++;
        if (attempts > 1) {
          showToast('info', `Retry Attempt ${attempts}/${maxAttempts} for ${company.name}...`);
        }

        const response = await fetch('/api/research/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company, strategy: selectedStrategy }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error('Rate limit exceeded (Too many requests).');
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Server returned response status ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Readable stream not supported by browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            const eventMatch = line.match(/^event:\s*(.+)$/m);
            const dataMatch = line.match(/^data:\s*(.+)$/m);

            if (!dataMatch) continue;
            
            const event = eventMatch ? eventMatch[1].trim() : 'message';
            const data = JSON.parse(dataMatch[1].trim());

            if (event === 'log') {
              setExecutionLogs(prev => [...prev, data.text]);
              if (data.progress) {
                setLoadingProgress(data.progress);
                if (data.progress < 30) {
                  setCurrentStep('fetching_financials');
                } else if (data.progress < 60) {
                  setCurrentStep('analyzing_sentiment');
                } else if (data.progress < 90) {
                  setCurrentStep('evaluating_risks');
                } else {
                  setCurrentStep('committee_verdict');
                }
              }
            } else if (event === 'finish') {
              setCurrentStep('finished');
              setLoadingProgress(100);
              
              const finalCompany = { ...data };
              setSelectedCompany(finalCompany);
              success = true;
              showToast('success', `Audit dossier compiled successfully for ${company.name}!`);
              
              setTimeout(() => {
                setIsAnalyzing(false);
                setShowReport(true);
              }, 800);

              setRecentSearches((prev) => {
                const updated = [company.symbol, ...prev.filter(t => t !== company.symbol)].slice(0, 5);
                localStorage.setItem('valo_recent_searches', JSON.stringify(updated));
                return updated;
              });
            } else if (event === 'error') {
              throw new Error(data.message || 'Workflow execution error.');
            }
          }
        }
      } catch (e: any) {
        clearTimeout(timeoutId);
        console.warn(`[Attempt ${attempts} Exception]:`, e);

        let errMsg = e.message || 'Network error encountered.';
        if (e.name === 'AbortError') {
          errMsg = 'Network request timeout (30s exceeded).';
        }

        showToast('error', `Attempt ${attempts} failed: ${errMsg}`);

        if (attempts < maxAttempts) {
          // Exponential backoff wait
          await new Promise(r => setTimeout(r, attempts * 1500));
        } else {
          setErrorMessage(`Auditing failed for ${company.name} after ${maxAttempts} attempts. Details: ${errMsg}`);
          setIsAnalyzing(false);
        }
      }
    }
  };

  // Close logs box helper
  const resetToSearch = () => {
    setShowReport(false);
    setSelectedCompany(null);
    setSearchQuery('');
  };

  // Raw JSON Download handler
  const downloadJSON = () => {
    if (!selectedCompany) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedCompany, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `valo_${selectedCompany.ticker}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Vector-Text PDF Auditing report exporter
  const exportPDF = async () => {
    if (!selectedCompany) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addHeader = (title: string) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94); // Green brand theme color
        doc.text(title, margin, y);
        y += 8;
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y - 4, pageWidth - margin, y - 4);
        y += 4;
      };

      const addSubHeader = (title: string) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.text(title, margin, y);
        y += 6;
      };

      const addText = (text: string) => {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(75, 85, 99);
        const splitText = doc.splitTextToSize(text, contentWidth);
        
        for (const line of splitText) {
          if (y + 6 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 6;
        }
        y += 3;
      };

      // Header Banner
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(17, 24, 39);
      doc.text(`VALO INVESTMENT RESEARCH REPORT: ${selectedCompany.ticker}`, margin, y);
      y += 8;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(107, 114, 128);
      doc.text(`Audited Strategy: ${selectedCompany.strategy}  |  Verdict: ${selectedCompany.verdict} (${selectedCompany.confidenceScore}% Confidence)`, margin, y);
      y += 14;

      // 1. Executive Summary
      addHeader('1. Executive Thesis Summary');
      addText(selectedCompany.thesis);

      // 2. Financial Metrics
      addHeader('2. Key Financial Indicators');
      addText(`Stock Price: $${selectedCompany.price} | PE Multiple: ${selectedCompany.financialRatios.peRatio}x | ROE: ${selectedCompany.financialRatios.roe}% | Margin: ${selectedCompany.financialRatios.profitMargin}% | D/E Ratio: ${selectedCompany.financialRatios.debtToEquity}`);
      y += 4;

      // 3. SWOT Matrix
      addHeader('3. SWOT Audit Overview');
      addSubHeader('Strengths:');
      addText(selectedCompany.swot.strengths.join(', '));
      addSubHeader('Weaknesses:');
      addText(selectedCompany.swot.weaknesses.join(', '));
      addSubHeader('Opportunities:');
      addText(selectedCompany.swot.opportunities.join(', '));
      addSubHeader('Threats:');
      addText(selectedCompany.swot.threats.join(', '));
      y += 4;

      // 4. Risks & Vulnerabilities
      addHeader('4. Assessed Portfolio Risks');
      selectedCompany.risks.forEach((r: any, idx: number) => {
        addSubHeader(`${idx + 1}. ${r.title} (${r.severity} Severity)`);
        addText(r.description);
      });

      // Save PDF
      doc.save(`valo_${selectedCompany.ticker}_report.pdf`);
    } catch (e) {
      console.error('[PDF Export Exception]:', e);
      alert('Local vector rendering failed. Falling back to browser standard prints.');
      window.print();
    }
  };

  // Recharts interactive visualization dashboards
  const renderChart = () => {
    if (!selectedCompany) return null;
    if (!mounted) {
      return (
        <div className="w-full h-[240px] flex items-center justify-center text-xs text-gray-500 font-mono">
          Initializing Recharts workspace...
        </div>
      );
    }

    const data = selectedCompany.chartData;
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-[240px] flex items-center justify-center text-xs text-gray-500 font-mono">
          Historical chart data is currently unavailable for this entity.
        </div>
      );
    }

    switch (activeChartTab) {
      case 'eps':
        return (
          <div className="w-full h-[240px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="eps" stroke="#a855f7" strokeWidth={3} activeDot={{ r: 8 }} name="EPS ($)" />
                <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'market_cap':
        return (
          <div className="w-full h-[240px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMcap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="marketCap" stroke="#22c55e" fillOpacity={1} fill="url(#colorMcap)" name="Market Cap ($B)" strokeWidth={2.5} />
                <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      case 'pe':
        return (
          <div className="w-full h-[240px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="peRatio" stroke="#eab308" strokeWidth={3} name="P/E Ratio" />
                <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'revenue_profit':
      default:
        return (
          <div className="w-full h-[240px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Bar dataKey="revenue" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth={1} radius={[4, 4, 0, 0]} name="Revenue ($M)" />
                <Bar dataKey="netIncome" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth={1} radius={[4, 4, 0, 0]} name="Net Income ($M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-[#f3f4f6]">
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r transition-transform duration-300 transform 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden'} lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-blue-600 shadow-lg glow-invest">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                VALO
              </span>
              <span className="text-[10px] text-brand-500 ml-1.5 uppercase font-mono tracking-widest px-1 py-0.5 rounded border border-brand-500/20 bg-brand-500/5">
                AGENT v1
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <button 
              onClick={() => { setActiveTab('dashboard'); resetToSearch(); }}
              className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150
                ${activeTab === 'dashboard' 
                  ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>Research Desk</span>
            </button>
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150
                ${activeTab === 'watchlist' 
                  ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Watchlist</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150
                ${activeTab === 'settings' 
                  ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>Agent Diagnostics</span>
            </button>
          </nav>

          {/* User profile section */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center font-bold text-sm shadow">
                SK
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Sumant Kumar</p>
                <p className="text-[10px] text-gray-500 truncate">Senior Reviewer</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-panel border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-gray-400 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-sm tracking-wide text-gray-300 uppercase">
              {activeTab === 'dashboard' ? 'Agentic Analysis Platform' : activeTab === 'watchlist' ? 'Research Archive' : 'Model Configurations'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Status light */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
              <span className="text-[10px] text-brand-500 font-medium font-mono uppercase tracking-wider">
                LLM Gateway: Active
              </span>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

          {activeTab === 'dashboard' && (
            <>
              {/* SEARCH PAGE (No active run or report displaying) */}
              {!isAnalyzing && !showReport && (
                <div className="max-w-4xl mx-auto space-y-10 py-8 animate-fade-in">
                  
                  {/* Hero Intro */}
                  <div className="text-center space-y-3">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                      Investigate Stock Tickers
                    </h2>
                    <p className="text-gray-400 text-sm max-w-xl mx-auto">
                      VALO leverages recursive state loops to digest financial ledgers, audit competitor backlogs, and index market headlines into direct invest/pass judgments.
                    </p>
                  </div>

                  {/* Search Card */}
                  <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl"></div>
                    
                    <form onSubmit={(e) => { e.preventDefault(); handleSearchInitiate(searchQuery); }} className="space-y-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-400" />
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search ticker symbol or company name (e.g. Apple, TSLA, Reliance)..."
                          className="w-full pl-12 pr-4 py-4 rounded-xl text-base glass-input text-white tracking-wider uppercase font-mono"
                        />
                        
                        {/* Dropdown list for multiple matching candidates */}
                        {searchCandidates.length > 0 && (
                          <div className="absolute left-0 right-0 mt-2 p-4 rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl z-50 space-y-3">
                            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase border-b border-white/5 pb-2 flex justify-between items-center">
                              <span>Select Verified Company Match:</span>
                              <button 
                                type="button" 
                                onClick={() => setSearchCandidates([])}
                                className="text-[10px] text-gray-400 hover:text-white"
                              >
                                Close
                              </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                              {searchCandidates.map((candidate) => (
                                <button
                                  type="button"
                                  key={candidate.symbol}
                                  onClick={() => {
                                    setSearchCandidates([]);
                                    setSearchQuery(candidate.symbol);
                                    handleAnalyze(candidate);
                                  }}
                                  className="w-full text-left p-3 rounded-lg border border-white/5 hover:border-brand-500/50 bg-white/[0.02] hover:bg-brand-500/5 transition-all duration-150 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-bold text-white text-sm">{candidate.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">
                                      {candidate.exchange} | Country: {candidate.country || 'N/A'}
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                                    {candidate.symbol}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {errorMessage && (
                        <p className="text-xs text-red-400 flex items-center gap-1.5 pl-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {errorMessage}
                        </p>
                      )}

                      {/* Strategy Toggles */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">
                          Research Strategy Framework
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {strategies.map((strat, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setSelectedStrategy(strat.name)}
                              className={`p-4 rounded-xl text-left border transition-all duration-200
                                ${selectedStrategy === strat.name 
                                  ? 'bg-brand-500/10 border-brand-500/40 text-white shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                                  : 'bg-white/[0.01] border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/[0.02]'
                                }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm">{strat.name}</span>
                                {selectedStrategy === strat.name && (
                                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 leading-normal">{strat.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Trigger Button */}
                      <button 
                        type="submit"
                        disabled={isSearching}
                        className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-150 active:scale-[0.99] glow-invest disabled:opacity-50"
                      >
                        <Cpu className="w-5 h-5 animate-pulse" />
                        <span>{isSearching ? 'Verifying Company...' : 'Initialize Agent Audit'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Recent Searches & Example shortcuts */}
                  <div className="space-y-6">
                    {recentSearches.length > 0 && (
                      <div className="space-y-3 text-center animate-fade-in">
                        <span className="text-xs text-gray-500 uppercase tracking-widest block font-medium">
                          Recent Investigations
                        </span>
                        <div className="flex justify-center gap-3 flex-wrap">
                          {recentSearches.map((ticker) => {
                            const data = mockCompanyData[ticker];
                            return (
                              <button
                                key={ticker}
                                onClick={() => { setSearchQuery(ticker); handleSearchInitiate(ticker); }}
                                className="px-3.5 py-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 text-xs font-semibold flex items-center gap-2 group transition-all duration-150"
                              >
                                <span className="text-white group-hover:text-brand-500">{ticker}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${data && data.verdict === 'PASS' ? 'bg-red-500' : 'bg-brand-500'}`}></span>
                              </button>
                            );
                          })}
                          <button
                            onClick={() => { setRecentSearches([]); localStorage.removeItem('valo_recent_searches'); }}
                            className="px-3 py-2 text-gray-500 hover:text-white text-xs font-semibold hover:bg-white/5 rounded-lg transition-all duration-150"
                          >
                            Clear History
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 text-center">
                      <span className="text-xs text-gray-500 uppercase tracking-widest block font-medium">
                        Example Companies
                      </span>
                      <div className="flex justify-center gap-3">
                        {popularTickers.map((ticker) => {
                          const data = mockCompanyData[ticker] || mockCompanyData.AAPL;
                          return (
                            <button
                              key={ticker}
                              onClick={() => { setSearchQuery(ticker); handleSearchInitiate(ticker); }}
                              className="px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 text-xs font-semibold flex items-center gap-2 group transition-all duration-150"
                            >
                              <span className="text-white group-hover:text-brand-500">{ticker}</span>
                              <span className="text-gray-500 text-[10px]">{data.companyName}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${data.verdict === 'INVEST' ? 'bg-brand-500' : 'bg-red-500'}`}></span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MOCK LOADING GRAPH & SKELETONS (During AI execution) */}
              {isAnalyzing && (
                <div className="max-w-6xl mx-auto space-y-8 py-4">
                  {/* Stepper Flow Nodes */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-brand-600 to-brand-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center relative">
                          <Activity className="w-5 h-5 text-brand-500 animate-pulse" />
                          <span className="absolute inset-0 rounded-full border border-brand-500/30 animate-ping"></span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white">LangGraph Execution Flow ({loadingProgress}%)</h3>
                          <p className="text-xs text-gray-400">Compiling and processing state nodes sequentially...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        <div className="text-xs font-mono px-3 py-1 rounded bg-black border border-white/5 text-brand-500">
                          {currentStep === 'fetching_financials' && 'NODE: financial_health'}
                          {currentStep === 'analyzing_sentiment' && 'NODE: sentiment_analysis'}
                          {currentStep === 'evaluating_risks' && 'NODE: risk_assessment'}
                          {currentStep === 'committee_verdict' && 'NODE: investment_committee'}
                          {currentStep === 'finished' && 'NODE: compile_state'}
                        </div>
                      </div>
                    </div>

                    {/* Node map lines */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                      {[
                        { step: 'fetching_financials', label: '1. Financial Extraction' },
                        { step: 'analyzing_sentiment', label: '2. News & Sentiment' },
                        { step: 'evaluating_risks', label: '3. Risk Assessor' },
                        { step: 'committee_verdict', label: '4. Decision Committee' },
                        { step: 'finished', label: '5. Compiled Output' }
                      ].map((stepObj, idx) => {
                        const isCurrent = currentStep === stepObj.step;
                        const isPast = ['fetching_financials', 'analyzing_sentiment', 'evaluating_risks', 'committee_verdict', 'finished'].indexOf(currentStep) > idx;
                        
                        return (
                          <div 
                            key={idx}
                            className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 relative
                              ${isCurrent 
                                ? 'bg-brand-500/10 border-brand-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                                : isPast
                                  ? 'bg-[#0f172a]/40 border-brand-600/30 text-gray-300'
                                  : 'bg-white/[0.01] border-white/5 text-gray-600'
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center text-xs font-bold border transition-all duration-300
                              ${isCurrent 
                                ? 'bg-brand-500 text-white border-brand-500 animate-pulse'
                                : isPast
                                  ? 'bg-brand-900/30 text-brand-500 border-brand-500/40'
                                  : 'bg-white/5 text-gray-500 border-white/5'
                              }`}
                            >
                              {isPast && idx < 4 ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className="font-semibold text-xs">{stepObj.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logs & Loading skeletons */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Log console */}
                    <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/10 flex flex-col h-[380px] bg-black">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                        <span className="text-xs font-bold font-mono text-gray-400">Agent Output Stream</span>
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                        </div>
                      </div>
                      <div className="flex-1 font-mono text-[11px] overflow-y-auto space-y-2 text-green-500/90 leading-relaxed no-scrollbar">
                        {executionLogs.map((log, index) => (
                          <div key={index} className="transition-all duration-150">
                            <span className="text-gray-600 font-semibold mr-1.5">&gt;</span>
                            {log}
                          </div>
                        ))}
                        <div className="w-2 h-4 bg-green-500 animate-pulse inline-block"></div>
                      </div>
                    </div>

                    {/* Skeletons loader */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="h-6 w-48 rounded bg-white/5 shimmer-bg"></div>
                          <div className="h-10 w-24 rounded-lg bg-white/5 shimmer-bg"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                              <div className="h-4 w-16 rounded bg-white/5 shimmer-bg mb-2"></div>
                              <div className="h-6 w-12 rounded bg-white/5 shimmer-bg"></div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 w-full rounded bg-white/5 shimmer-bg"></div>
                          <div className="h-4 w-5/6 rounded bg-white/5 shimmer-bg"></div>
                          <div className="h-4 w-4/6 rounded bg-white/5 shimmer-bg"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
                          <div className="h-4 w-28 rounded bg-white/5 shimmer-bg"></div>
                          <div className="h-32 w-full rounded-xl bg-white/5 shimmer-bg"></div>
                        </div>
                        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
                          <div className="h-4 w-28 rounded bg-white/5 shimmer-bg"></div>
                          <div className="h-32 w-full rounded-xl bg-white/5 shimmer-bg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPANY ANALYSIS REPORT PAGE */}
              {showReport && selectedCompany && (
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                  
                  {/* Top back & export actions */}
                  <div className="flex items-center justify-between no-print">
                    <button 
                      onClick={resetToSearch}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/5 hover:bg-white/5 transition-all duration-150 flex items-center gap-1.5 text-gray-400 hover:text-white"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      Back to Desk
                    </button>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={downloadJSON}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 transition-all duration-150 flex items-center gap-1.5 border border-white/10 text-white"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Download JSON
                      </button>
                      <button 
                        onClick={exportPDF}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all duration-150 flex items-center gap-1.5 shadow-lg glow-invest"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Warning banner for missing financial information */}
                  {(selectedCompany.price === null || 
                    selectedCompany.financialRatios?.peRatio === null || 
                    selectedCompany.financialRatios?.roe === null) && (
                    <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/20 text-yellow-400 text-xs font-semibold flex items-center gap-3 no-print">
                      <HelpCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-pulse" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-yellow-500 mr-1.5">[NOTICE]</span>
                        Verified company found, but some financial information is currently unavailable.
                      </div>
                    </div>
                  )}

                  {/* VETTING HERO HEADER & DAILY PERFORMANCE STRIP */}
                  <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg border border-white/10 bg-gradient-to-tr from-brand-600 to-blue-600 text-white">
                          {selectedCompany.ticker[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold tracking-widest text-brand-500 uppercase px-2 py-0.5 rounded border border-brand-500/30 bg-brand-500/5">
                              {selectedCompany.sector}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {selectedCompany.exchange || 'NYSE/NASDAQ'}
                            </span>
                          </div>
                          <h2 className="text-3xl font-extrabold text-white flex items-baseline gap-3 mt-1">
                            {selectedCompany.companyName}
                            <span className="text-lg font-bold font-mono text-gray-400">({selectedCompany.ticker})</span>
                          </h2>
                        </div>
                      </div>

                      {/* Stock Price & Today's Change */}
                      <div className="flex flex-col md:items-end">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Live Market Value</span>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="text-4xl font-extrabold font-mono text-white leading-none">
                            {selectedCompany.price !== null ? `$${selectedCompany.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                          </span>
                          {selectedCompany.changePercent !== null && (
                            <span className={`text-sm font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border
                              ${selectedCompany.changePercent >= 0 
                                ? 'text-brand-500 bg-brand-500/10 border-brand-500/20' 
                                : 'text-red-500 bg-red-500/10 border-red-500/20'
                              }`}
                            >
                              {selectedCompany.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {selectedCompany.changePercent >= 0 ? '+' : ''}
                              {selectedCompany.dailyChange !== undefined && selectedCompany.dailyChange !== null ? `$${selectedCompany.dailyChange.toFixed(2)}` : ''} 
                              ({selectedCompany.changePercent >= 0 ? '+' : ''}{selectedCompany.changePercent.toFixed(2)}%)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-brand-400 font-mono mt-1 px-2 py-0.5 rounded border border-brand-500/20 bg-brand-500/5">
                          ● Market Active | Real Feed
                        </div>
                      </div>
                    </div>

                    {/* Stock Daily Details Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-6 pt-6 border-t border-white/5">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Open</p>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          {selectedCompany.open !== undefined && selectedCompany.open !== null ? `$${selectedCompany.open.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Previous Close</p>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          {selectedCompany.previousClose !== undefined && selectedCompany.previousClose !== null ? `$${selectedCompany.previousClose.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Day High</p>
                        <p className="text-sm font-mono font-bold text-brand-400 mt-0.5">
                          {selectedCompany.dayHigh !== undefined && selectedCompany.dayHigh !== null ? `$${selectedCompany.dayHigh.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Day Low</p>
                        <p className="text-sm font-mono font-bold text-red-400 mt-0.5">
                          {selectedCompany.dayLow !== undefined && selectedCompany.dayLow !== null ? `$${selectedCompany.dayLow.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Volume</p>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          {selectedCompany.volume !== undefined && selectedCompany.volume !== null ? selectedCompany.volume.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Market Cap</p>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          {selectedCompany.marketCap !== undefined && selectedCompany.marketCap !== null 
                            ? `$${(selectedCompany.marketCap / 1e9).toFixed(2)}B` 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Currency</p>
                        <p className="text-sm font-mono font-bold text-brand-500 mt-0.5 uppercase">
                          {selectedCompany.currency || 'USD'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE STOCK CHART */}
                  <StockChart symbol={selectedCompany.ticker} />

                  {/* METRICS & CHARTS GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Charts (3 Cols) */}
                    <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-3 mb-3">
                        <div>
                          <h3 className="font-bold text-base text-white">Financial Trajectory</h3>
                          <p className="text-[11px] text-gray-400 font-medium">Interactive financial performance logs.</p>
                        </div>
                        {/* Selector Tabs */}
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 no-print flex-wrap">
                          {[
                            { id: 'revenue_profit', label: 'Rev / Net' },
                            { id: 'eps', label: 'EPS' },
                            { id: 'market_cap', label: 'Mcap' },
                            { id: 'pe', label: 'P/E' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setActiveChartTab(t.id as any)}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded transition-all duration-150
                                ${activeChartTab === t.id 
                                  ? 'bg-brand-600 text-white shadow-md' 
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        {renderChart()}
                      </div>
                    </div>

                    {/* Financial Metrics Cards (2 Cols) */}
                    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-white mb-1">Extracted Key Ratios</h3>
                        <p className="text-xs text-gray-400 mb-4">Underlying ratios computed during analysis state.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { 
                            label: 'P/E Multiple', 
                            val: selectedCompany.financialRatios.peRatio !== null ? `${selectedCompany.financialRatios.peRatio}x` : 'N/A', 
                            status: selectedCompany.financialRatios.peRatio !== null ? (selectedCompany.financialRatios.peRatio < 30 ? 'Good' : 'High') : 'N/A' 
                          },
                          { 
                            label: 'P/B Multiple', 
                            val: selectedCompany.financialRatios.pbRatio !== null ? `${selectedCompany.financialRatios.pbRatio}x` : 'N/A', 
                            status: selectedCompany.financialRatios.pbRatio !== null ? (selectedCompany.financialRatios.pbRatio < 15 ? 'Moderate' : 'Premium') : 'N/A' 
                          },
                          { 
                            label: 'Debt/Equity Ratio', 
                            val: selectedCompany.financialRatios.debtToEquity !== null ? selectedCompany.financialRatios.debtToEquity.toString() : 'N/A', 
                            status: selectedCompany.financialRatios.debtToEquity !== null ? (selectedCompany.financialRatios.debtToEquity < 1.0 ? 'Conservative' : 'Leveraged') : 'N/A' 
                          },
                          { 
                            label: 'Current Ratio', 
                            val: selectedCompany.financialRatios.currentRatio !== null ? `${selectedCompany.financialRatios.currentRatio}x` : 'N/A', 
                            status: selectedCompany.financialRatios.currentRatio !== null ? (selectedCompany.financialRatios.currentRatio > 1.2 ? 'Liquid' : 'Tight') : 'N/A' 
                          },
                          { 
                            label: 'ROE', 
                            val: selectedCompany.financialRatios.roe !== null ? `${selectedCompany.financialRatios.roe}%` : 'N/A', 
                            status: selectedCompany.financialRatios.roe !== null ? (selectedCompany.financialRatios.roe > 25 ? 'Exceptional' : 'Low') : 'N/A' 
                          },
                          { 
                            label: 'Profit Margin', 
                            val: selectedCompany.financialRatios.profitMargin !== null ? `${selectedCompany.financialRatios.profitMargin}%` : 'N/A', 
                            status: selectedCompany.financialRatios.profitMargin !== null ? (selectedCompany.financialRatios.profitMargin > 20 ? 'High' : 'Moderate') : 'N/A' 
                          }
                        ].map((metric, idx) => (
                          <div key={idx} className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all duration-150 group">
                            <span className="text-[10px] text-gray-500 font-semibold uppercase">{metric.label}</span>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="font-mono font-bold text-base text-white">{metric.val}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold
                                ${metric.status === 'Good' || metric.status === 'Liquid' || metric.status === 'Exceptional' || metric.status === 'Conservative'
                                  ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                                  : metric.status === 'N/A'
                                    ? 'bg-white/5 text-gray-400 border border-white/10'
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                }`}
                              >
                                {metric.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SWOT & NEWS/RISKS ROW */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SWOT Grid */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-white">SWOT Matrix</h3>
                        <p className="text-xs text-gray-400">Qualitative findings mapped by the agent.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="p-4 rounded-xl bg-brand-500/[0.02] border border-brand-500/10">
                          <span className="text-xs font-bold text-brand-500 flex items-center gap-1.5 mb-2 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                            Strengths
                          </span>
                          <ul className="space-y-1.5 text-[11px] text-gray-300 pl-1 list-inside list-disc">
                            {selectedCompany.swot.strengths.map((s, idx) => (
                              <li key={idx} className="leading-normal">{s}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-4 rounded-xl bg-red-500/[0.02] border border-red-500/10">
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-2 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Weaknesses
                          </span>
                          <ul className="space-y-1.5 text-[11px] text-gray-300 pl-1 list-inside list-disc">
                            {selectedCompany.swot.weaknesses.map((w, idx) => (
                              <li key={idx} className="leading-normal">{w}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="p-4 rounded-xl bg-blue-500/[0.02] border border-blue-500/10">
                          <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Opportunities
                          </span>
                          <ul className="space-y-1.5 text-[11px] text-gray-300 pl-1 list-inside list-disc">
                            {selectedCompany.swot.opportunities.map((o, idx) => (
                              <li key={idx} className="leading-normal">{o}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div className="p-4 rounded-xl bg-yellow-500/[0.02] border border-yellow-500/10">
                          <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5 mb-2 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            Threats
                          </span>
                          <ul className="space-y-1.5 text-[11px] text-gray-300 pl-1 list-inside list-disc">
                            {selectedCompany.swot.threats.map((t, idx) => (
                              <li key={idx} className="leading-normal">{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* news / sentiment analysis */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-white">Sentiment Sources</h3>
                        <p className="text-xs text-gray-400">Aggregated press headlines curated by Tavily agents.</p>
                      </div>

                      <div className="space-y-3.5">
                        {selectedCompany.news.map((item) => (
                          <div key={item.id} className="p-3 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-150 flex items-start gap-3">
                            <div className="pt-0.5">
                              <span className={`w-2.5 h-2.5 rounded-full block
                                ${item.sentiment === 'Bullish' ? 'bg-brand-500' : item.sentiment === 'Bearish' ? 'bg-red-500' : 'bg-gray-500'}`}
                              ></span>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="text-xs font-semibold text-white leading-snug">{item.title}</h4>
                                <span className="text-[9px] text-gray-500 font-mono whitespace-nowrap">{item.publishedAt}</span>
                              </div>
                              <p className="text-[10px] text-gray-400 leading-relaxed">{item.summary}</p>
                              <div className="flex items-center gap-2 pt-0.5 text-[9px] text-gray-500 font-mono">
                                <span>{item.source}</span>
                                <span>•</span>
                                <span className={item.sentiment === 'Bullish' ? 'text-brand-500' : item.sentiment === 'Bearish' ? 'text-red-500' : 'text-gray-400'}>
                                  {item.sentiment} Sentiment
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risks & Headwinds segment */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                        Identified Risks & Headwinds
                      </h3>
                      <p className="text-xs text-gray-400">Summary of risk audits compiled by the risk assessment node.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedCompany.risks.map((risk, idx) => (
                        <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl relative overflow-hidden">
                          <span className={`absolute top-0.5 right-2 text-[9px] font-mono uppercase tracking-widest font-bold
                            ${risk.severity === 'High' 
                              ? 'text-red-400' 
                              : risk.severity === 'Medium' 
                                ? 'text-yellow-400' 
                                : 'text-blue-400'
                            }`}
                          >
                            {risk.severity} Risk
                          </span>
                          <h4 className="text-xs font-bold text-white mb-1.5">{risk.title}</h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI INVESTMENT RECOMMENDATION (Verdict decision & Reasoning Thesis/Anti-Thesis stacked together) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Verdict Decision Card */}
                    <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center relative overflow-hidden bg-gradient-to-b from-white/[0.01] to-white/[0.03]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Agent Verdict Decision
                      </span>

                      {/* Giant glowing indicator (Radial Confidence Ring) */}
                      <div className="my-4 flex flex-col items-center justify-center relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            stroke={selectedCompany.verdict === 'INVEST' ? '#22c55e' : '#ef4444'}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 50}
                            strokeDashoffset={2 * Math.PI * 50 * (1 - selectedCompany.confidenceScore / 100)}
                            strokeLinecap="round"
                            className={`transition-all duration-1000 ease-out
                              ${selectedCompany.verdict === 'INVEST' ? 'glow-invest' : 'glow-pass'}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-black tracking-wider leading-none
                            ${selectedCompany.verdict === 'INVEST' ? 'text-brand-500' : 'text-red-500'}`}
                          >
                            {selectedCompany.verdict}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono font-semibold uppercase mt-1">
                            {selectedCompany.confidenceScore}% Conf
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400">
                          Compiled under <span className="text-white font-medium">{selectedCompany.strategy}</span> parameters.
                        </p>
                        <p className="text-[10px] text-gray-500 max-w-[200px]">
                          This is an AI-orchestrated verdict based on fundamental metrics and news sentiment parameters.
                        </p>
                      </div>
                    </div>

                    {/* Thesis & Anti-Thesis Reasoning */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                      {/* Thesis */}
                      <div className="glass-panel p-6 rounded-2xl border border-l-4 border-l-brand-500 border-white/10 flex-1 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-2 right-2 p-1.5 bg-brand-500/10 rounded-lg border border-brand-500/20">
                          <TrendingUp className="w-4 h-4 text-brand-500" />
                        </div>
                        <h3 className="font-bold text-base text-white mb-2">AI Investment Thesis</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">{selectedCompany.thesis}</p>
                      </div>

                      {/* Anti-thesis */}
                      <div className="glass-panel p-6 rounded-2xl border border-l-4 border-l-red-500 border-white/10 flex-1 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-2 right-2 p-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                        <h3 className="font-bold text-base text-white mb-2">AI Risk Anti-Thesis</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">{selectedCompany.antiThesis}</p>
                      </div>
                    </div>
                  </div>

                  {/* Markdown Report Render Card */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h3 className="font-bold text-base text-white">Full Markdown Report</h3>
                        <p className="text-xs text-gray-400">Standard formatted publication compiled by report nodes.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const mockReport = `# INVESTMENT RESEARCH REPORT: ${selectedCompany.ticker}\n\n## VERDICT: ${selectedCompany.verdict} (Confidence Score: ${selectedCompany.confidenceScore}/100)\n\n### Executive Thesis\n${selectedCompany.thesis}\n\n### SWOT Audit Overview\n- Strengths: ${selectedCompany.swot.strengths.join(', ')}\n- Weaknesses: ${selectedCompany.swot.weaknesses.join(', ')}`;
                          navigator.clipboard.writeText(mockReport);
                          alert('Report copied to clipboard!');
                        }}
                        className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white border border-white/10 transition-all duration-150 no-print"
                      >
                        Copy Report
                      </button>
                    </div>
                    <div className="bg-black/60 rounded-xl p-5 border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto no-scrollbar">
{`# INVESTMENT RESEARCH REPORT: ${selectedCompany.ticker}

## VERDICT: ${selectedCompany.verdict} (Confidence Score: ${selectedCompany.confidenceScore}/100)

---

### Executive Thesis
${selectedCompany.thesis}

### Key Headwinds / Anti-Thesis
${selectedCompany.antiThesis}

---

### Financial Scorecard
- P/E Multiple: ${selectedCompany.financialRatios.peRatio}x
- ROE: ${selectedCompany.financialRatios.roe}%
- Profit Margin: ${selectedCompany.financialRatios.profitMargin}%
- Debt to Equity: ${selectedCompany.financialRatios.debtToEquity}

### SWOT Audit Overview
- Strengths: ${selectedCompany.swot.strengths.join(', ')}
- Weaknesses: ${selectedCompany.swot.weaknesses.join(', ')}
- Opportunities: ${selectedCompany.swot.opportunities.join(', ')}
- Threats: ${selectedCompany.swot.threats.join(', ')}

---
*Report compiled by VALO AI Investment Agent.*`}
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {activeTab === 'watchlist' && (
            <div className="max-w-4xl mx-auto space-y-6 text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-brand-500/5 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 glow-invest">
                <Bookmark className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="font-bold text-xl text-white">Your Saved Watchlist</h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                No stock audits have been saved to your portfolio yet. Search and click &quot;Export PDF&quot; or run the backend model compiler to save your history.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <h3 className="font-bold text-xl text-white">AI Agent Diagnostics</h3>
              <p className="text-gray-400 text-xs">
                Monitor API rates, request latency, and debug execution node routes.
              </p>
              
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Tavily Engine Ping</span>
                    <p className="font-mono text-base font-bold text-white mt-1">42ms</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Average LLM Token Latency</span>
                    <p className="font-mono text-base font-bold text-white mt-1">128ms/token</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">API Cache Hit Rate</span>
                    <p className="font-mono text-base font-bold text-white mt-1">84.2%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider pl-1">Configuration Profiles</h4>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Fallbacks for missing API Keys</span>
                      <span className="text-xs text-brand-500 font-mono">ENABLED</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Execution Timeout threshold</span>
                      <span className="text-xs text-gray-400 font-mono">30s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Prisma database connection pooling</span>
                      <span className="text-xs text-brand-500 font-mono">STANDBY (Local SQLite Mode)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating Toast Notification Panel */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 shadow-2xl glass-card transition-all duration-300 animate-slide-in
              ${toast.type === 'success' 
                ? 'border-brand-500/25 bg-brand-950/40 text-brand-400' 
                : toast.type === 'error' 
                  ? 'border-red-500/25 bg-red-950/40 text-red-400' 
                  : 'border-blue-500/25 bg-blue-950/40 text-blue-400'
              }`}
          >
            <div className="pt-0.5 flex-shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
              {toast.type === 'error' && <ShieldAlert className="w-4 h-4 text-red-500" />}
              {toast.type === 'info' && <Activity className="w-4 h-4 text-blue-500 animate-pulse" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
