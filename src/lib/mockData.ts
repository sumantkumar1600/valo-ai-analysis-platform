import { CompanyAnalysis } from '@/types';

export const mockCompanyData: Record<string, CompanyAnalysis> = {
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Technology / Consumer Electronics',
    price: 189.84,
    changePercent: 1.42,
    verdict: 'INVEST',
    strategy: 'Growth Focus',
    confidenceScore: 88,
    thesis: 'Apple continues to demonstrate immense pricing power, a highly sticky ecosystem of over 2.2 billion active devices, and expanding services revenue margins (70%+). The pending integration of device-level AI features (Apple Intelligence) is poised to kick off a multi-year iPhone upgrade supercycle, driving hardware growth.',
    antiThesis: 'Hardware replacement cycles are lengthening globally. High exposure to manufacturing concentration in China presents supply chain geopolitical risks, and increasing regulatory pressure on App Store fees could limit Services margin growth.',
    financialRatios: {
      peRatio: 28.4,
      pbRatio: 38.2,
      debtToEquity: 1.6,
      currentRatio: 1.05,
      roe: 154.2,
      freeCashFlowGrowth: 8.5,
      profitMargin: 26.16
    },
    swot: {
      strengths: [
        'Global brand loyalty and high ecosystem switching costs',
        'Exceptional capital return program ($110B buyback)',
        'Unrivaled custom silicon architecture (M & A-series chips)'
      ],
      weaknesses: [
        'High dependence on iPhone sales (approx. 50% of total revenue)',
        'Relatively slow initial entry into enterprise generative AI markets'
      ],
      opportunities: [
        'Premium services expansion (Health, Finance, Apple TV+)',
        'AI hardware upgrades driving localized LLM run capabilities'
      ],
      threats: [
        'DOJ and EU antitrust rulings restricting digital marketplace operations',
        'Intensified high-end smartphone competition in China'
      ]
    },
    risks: [
      {
        title: 'Antitrust Litigation',
        description: 'US Department of Justice and European Union investigations targeting ecosystem lock-in and distribution fees.',
        severity: 'High'
      },
      {
        title: 'Geopolitical Supply Chain',
        description: 'High reliance on Foxconn and Taiwanese chip fabricators (TSMC) exposes Apple to hardware production disruptions.',
        severity: 'Medium'
      },
      {
        title: 'Valuation Premium',
        description: 'P/E ratio of 28.4 is above historical averages, requiring sustained growth to support current stock levels.',
        severity: 'Low'
      }
    ],
    news: [
      {
        id: '1',
        title: 'Apple Announces Apple Intelligence, Partnering with OpenAI for Siri Integration',
        source: 'Bloomberg Tech',
        summary: 'Apple launched its new AI features, promising strict privacy guards and local processing. High-end hardware requirement will force upgrades.',
        sentiment: 'Bullish',
        publishedAt: '2 hours ago'
      },
      {
        id: '2',
        title: 'EU Fines Apple €1.8 Billion in Spotify Antitrust Case',
        source: 'Reuters Financial',
        summary: 'Regulators rules that Apple restricted music-streaming developers from informing users about cheaper alternative purchases outside the App Store.',
        sentiment: 'Bearish',
        publishedAt: '1 day ago'
      },
      {
        id: '3',
        title: 'Apple Q2 Earnings: Revenue Beats Estimates, Unveils Historic $110B Buyback Program',
        source: 'Wall Street Journal',
        summary: 'Despite slight decline in iPhone unit sales, services revenue hit a record high and the record share repurchase delighted investors.',
        sentiment: 'Bullish',
        publishedAt: '3 days ago'
      }
    ],
    chartData: [
      { year: 2021, revenue: 365817, netIncome: 94680, freeCashFlow: 92953, eps: 5.61, marketCap: 2200, peRatio: 26.5 },
      { year: 2022, revenue: 394328, netIncome: 99803, freeCashFlow: 111443, eps: 6.11, marketCap: 2400, peRatio: 28.0 },
      { year: 2023, revenue: 383285, netIncome: 96995, freeCashFlow: 99584, eps: 6.13, marketCap: 2600, peRatio: 27.5 },
      { year: 2024, revenue: 391035, netIncome: 100411, freeCashFlow: 104500, eps: 6.42, marketCap: 2800, peRatio: 28.4 }
    ]
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    sector: 'Consumer Discretionary / Electric Vehicles',
    price: 177.46,
    changePercent: -2.18,
    verdict: 'PASS',
    strategy: 'Speculative Growth',
    confidenceScore: 72,
    thesis: 'While Tesla retains the highest EV manufacturing margin globally and is leading in Dojo-based autonomous driving models, short-to-medium term prospects are constrained. Slower global EV adoption, aggressive price wars in China, and execution delays on Robotaxi deployment challenge the growth multiples.',
    antiThesis: 'If Tesla achieves true Level 4 autonomy ahead of schedule and licenses its Full Self-Driving (FSD) software to legacy automakers, its software Services margins will shift the business to an exceptionally high-margin model.',
    financialRatios: {
      peRatio: 52.8,
      pbRatio: 8.9,
      debtToEquity: 0.08,
      currentRatio: 1.72,
      roe: 22.4,
      freeCashFlowGrowth: -25.2,
      profitMargin: 12.12
    },
    swot: {
      strengths: [
        'Market-leading battery efficiency and charging network infrastructure',
        'Industry-leading cost structure in gigafactories',
        'Robust balance sheet with virtually zero net debt'
      ],
      weaknesses: [
        'Declining operating margins due to rolling vehicle price discounts',
        'Distraction risks related to multi-company leadership structure'
      ],
      opportunities: [
        'Dojo supercomputing scaling and licensing of FSD software',
        'Tesla Energy storage deployments growing at triple-digit rates'
      ],
      threats: [
        'Hyper-aggressive pricing from subsidized domestic EV competitors in China',
        'Regulatory audits and liabilities concerning Autopilot safety'
      ]
    },
    risks: [
      {
        title: 'Declining Profit Margins',
        description: 'Auto gross margins (excluding credits) have compressed from 28% to below 16% due to promotional vehicle pricing.',
        severity: 'High'
      },
      {
        title: 'Regulatory & FSD Liability',
        description: 'Federal highway administration (NHTSA) investigations on autopilot recall execution and liability risks.',
        severity: 'High'
      },
      {
        title: 'Key Person Risk',
        description: 'Extreme dependency on CEO Elon Musk for corporate direction, branding, and capital markets confidence.',
        severity: 'Medium'
      }
    ],
    news: [
      {
        id: '1',
        title: 'Tesla Delays Robotaxi Unveiling Event to October',
        source: 'TechCrunch',
        summary: 'CEO announced the delay to allow design iterations on the front-end bumpers and to incorporate more software changes.',
        sentiment: 'Bearish',
        publishedAt: '4 hours ago'
      },
      {
        id: '2',
        title: 'Tesla Megapack installations hit record levels in Q2',
        source: 'Renewable Now',
        summary: 'Tesla energy division deployed 9.4 GWh of storage, signaling rapid scaling of its commercial grid battery division.',
        sentiment: 'Bullish',
        publishedAt: '1 day ago'
      },
      {
        id: '3',
        title: 'EV Market Sales Growth Drops Globally; Tesla Feels the Pinch',
        source: 'Financial Times',
        summary: 'Consumer preferences shifting towards hybrid powertrains, leading to vehicle build-up in inventories.',
        sentiment: 'Bearish',
        publishedAt: '5 days ago'
      }
    ],
    chartData: [
      { year: 2021, revenue: 53823, netIncome: 5519, freeCashFlow: 5015, eps: 1.63, marketCap: 750, peRatio: 82.0 },
      { year: 2022, revenue: 81462, netIncome: 12587, freeCashFlow: 7566, eps: 3.62, marketCap: 850, peRatio: 65.5 },
      { year: 2023, revenue: 96773, netIncome: 14997, freeCashFlow: 4357, eps: 4.30, marketCap: 650, peRatio: 55.0 },
      { year: 2024, revenue: 98110, netIncome: 11200, freeCashFlow: 3200, eps: 3.55, marketCap: 580, peRatio: 52.8 }
    ]
  },
  MSFT: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    sector: 'Technology / Software & Cloud Services',
    price: 421.90,
    changePercent: 0.85,
    verdict: 'INVEST',
    strategy: 'Value Investing',
    confidenceScore: 94,
    thesis: 'Microsoft has established an impregnable lead in the enterprise AI category. Its early alliance with OpenAI has permitted commercializing Copilot integrations throughout Office, Windows, and Azure. With double-digit top and bottom line growth at enterprise scale, Microsoft remains an core long-term investment.',
    antiThesis: 'High capital expenditure (CapEx) targets to acquire NVIDIA clusters could drag short-term free cash flow margins. In addition, regulatory pushback on antitrust could limit larger acquisitions.',
    financialRatios: {
      peRatio: 36.1,
      pbRatio: 12.4,
      debtToEquity: 0.45,
      currentRatio: 1.24,
      roe: 38.5,
      freeCashFlowGrowth: 18.2,
      profitMargin: 35.88
    },
    swot: {
      strengths: [
        'Impregnable enterprise lock-in with Azure and MS Office suite',
        'Leading monetization of generative AI tools (Copilot)',
        'Extremely high operating margin (~44%) generating massive FCF'
      ],
      weaknesses: [
        'Increased security vulnerabilities leading to government infrastructure audit reviews',
        'Heavy dependence on hardware supply chains for Azure data center buildouts'
      ],
      opportunities: [
        'Azure market share expansion relative to AWS and GCP',
        'PC hardware refreshments powered by AI-equipped Windows Copilot+ computers'
      ],
      threats: [
        'Aggressive anti-monopoly scrutinies over AI startup investments and cloud practices',
        'Escalating energy constraints and costs for powering data centers'
      ]
    },
    risks: [
      {
        title: 'Capital Expenditure Scaling',
        description: 'CapEx has spiked to over $14B quarterly, primarily focused on AI chip inventory, which could drag free cash flows if demand slows.',
        severity: 'Medium'
      },
      {
        title: 'Cybersecurity Infiltrations',
        description: 'Recent exploits of executive email boxes by state-sponsored actors present reputational risks in government contract pipelines.',
        severity: 'Medium'
      },
      {
        title: 'Market Valuation Multiples',
        description: 'Trading at 36x P/E is near historical peaks, pricing in perfect execution across AI cloud lines.',
        severity: 'Low'
      }
    ],
    news: [
      {
        id: '1',
        title: 'Microsoft Azure Sales Grow 31% Driven by Cloud AI Demand',
        source: 'CNBC',
        summary: 'Cloud division margins expanded as commercial customers migrated data infrastructures to leverage OpenAI model frameworks.',
        sentiment: 'Bullish',
        publishedAt: '3 hours ago'
      },
      {
        id: '2',
        title: 'Microsoft Yields Observer Seat on OpenAI Board Amid Regulatory Pressures',
        source: 'Financial Times',
        summary: 'The step-back aims to ease regulatory inquiries from UK CMA and European Commission over the nature of their multibillion dollar relationship.',
        sentiment: 'Neutral',
        publishedAt: '2 days ago'
      },
      {
        id: '3',
        title: 'Microsoft Unveils Copilot+ PCs, Re-imagining Windows Around Local NPU Systems',
        source: 'Wired',
        summary: 'New devices boast 40+ TOPs local compute to handle real-time image creation, recall histories, and local language models.',
        sentiment: 'Bullish',
        publishedAt: '4 days ago'
      }
    ],
    chartData: [
      { year: 2021, revenue: 168088, netIncome: 61271, freeCashFlow: 56118, eps: 8.05, marketCap: 1800, peRatio: 32.0 },
      { year: 2022, revenue: 198270, netIncome: 72738, freeCashFlow: 65149, eps: 9.65, marketCap: 2100, peRatio: 35.0 },
      { year: 2023, revenue: 211915, netIncome: 72361, freeCashFlow: 59475, eps: 9.68, marketCap: 2300, peRatio: 34.5 },
    ]
  }
};
export const popularTickers = ['AAPL', 'MSFT', 'TSLA'];

export function generateDynamicMock(ticker: string, strategy: string): CompanyAnalysis {
  const cleanTicker = ticker.toUpperCase();
  
  let hash = 0;
  for (let i = 0; i < cleanTicker.length; i++) {
    hash = cleanTicker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  
  const price = 50 + (absHash % 450);
  const changePercent = parseFloat(((absHash % 100) / 20 - 2.5).toFixed(2));
  const peRatio = 15 + (absHash % 35);
  const pbRatio = 2 + (absHash % 15);
  const debtToEquity = parseFloat(((absHash % 200) / 100).toFixed(2));
  const currentRatio = parseFloat((1.0 + (absHash % 150) / 100).toFixed(2));
  const roe = 10 + (absHash % 40);
  const profitMargin = 5 + (absHash % 30);
  
  const score = 55 + (absHash % 35);
  const verdict = score >= 70 ? 'INVEST' : 'PASS';
  
  const companyName = `${cleanTicker.charAt(0) + cleanTicker.slice(1).toLowerCase()} Corp.`;
  const sector = absHash % 2 === 0 ? 'Technology / Semiconductors' : 'Consumer Goods / Electronics';
  
  const strengths = [
    `Strong market position and brand equity in ${cleanTicker} product categories.`,
    'Resilient balance sheet with adequate cash reserves for R&D expansion.',
    'Diversified global supply chain networks mitigating regional headwinds.'
  ];
  
  const weaknesses = [
    'Exposure to cyclical demand fluctuations in core consumer divisions.',
    `Compressed margins relative to high-growth peers in ${cleanTicker} competitive sectors.`,
    'Elevated capital expenditures to sustain long-term capacity upgrades.'
  ];
  
  const opportunities = [
    'Expansion into emerging AI analytics services and enterprise markets.',
    'Strategic partnerships to co-develop cloud application suites.',
    'Product diversification leveraging proprietary sensor architectures.'
  ];
  
  const threats = [
    'Intense competitive pricing pressure from regional low-cost manufacturers.',
    'Evolving global regulatory standards concerning cross-border data privacy.',
    'Potential raw material supply chain disruptions and logistics bottlenecks.'
  ];

  const thesis = `${companyName} exhibits solid fundamentals with a robust capital structure. The quantitative investment score of ${score}/100 reflects a steady growth pattern with medium-term risk margins. Our committee recommends a ${verdict} decision under the ${strategy} framework.`;
  
  const antiThesis = `Risks are primarily driven by sector-specific competitive pressures and raw material price volatility. Global demand cycles remain a headwind.`;

  const risks = [
    { title: 'Sector Competition', description: `Aggressive market share acquisition by domestic and global players in the ${cleanTicker} sector.`, severity: 'High' as const },
    { title: 'Margin Volatility', description: 'Fluctuations in core product margins due to input material cost spikes.', severity: 'Medium' as const },
    { title: 'Regulatory Compliance', description: 'Costs related to adapting to international sustainability and emissions protocols.', severity: 'Low' as const }
  ];

  const news = [
    { id: '1', title: `${companyName} launches next-generation hardware lineup.`, source: 'Bloomberg', summary: 'The announcement was made during the annual developer conference.', sentiment: 'Bullish' as const, publishedAt: '3 hours ago' },
    { id: '2', title: `Supply chain bottlenecks impact ${cleanTicker} shipment volumes.`, source: 'Reuters', summary: 'Logistics constraints in shipping ports delay core inventory arrivals.', sentiment: 'Bearish' as const, publishedAt: '1 day ago' },
    { id: '3', title: `${companyName} reports steady quarterly earnings matching forecasts.`, source: 'WSJ', summary: 'Revenue and operating profits tracked consensus expectations.', sentiment: 'Neutral' as const, publishedAt: '3 days ago' }
  ];

  const chartData = [
    { year: 2021, revenue: Math.round(price * 400), netIncome: Math.round(price * 40), freeCashFlow: Math.round(price * 30), eps: parseFloat((price / 100 * 1.5).toFixed(2)), marketCap: Math.round(price * 15), peRatio: peRatio - 2 },
    { year: 2022, revenue: Math.round(price * 440), netIncome: Math.round(price * 45), freeCashFlow: Math.round(price * 35), eps: parseFloat((price / 100 * 1.7).toFixed(2)), marketCap: Math.round(price * 17), peRatio: peRatio - 1 },
    { year: 2023, revenue: Math.round(price * 480), netIncome: Math.round(price * 42), freeCashFlow: Math.round(price * 28), eps: parseFloat((price / 100 * 1.6).toFixed(2)), marketCap: Math.round(price * 16), peRatio: peRatio },
    { year: 2024, revenue: Math.round(price * 520), netIncome: Math.round(price * 50), freeCashFlow: Math.round(price * 40), eps: parseFloat((price / 100 * 1.9).toFixed(2)), marketCap: Math.round(price * 18), peRatio: peRatio + 1 }
  ];

  return {
    ticker: cleanTicker,
    companyName,
    sector,
    price,
    changePercent,
    verdict,
    strategy,
    confidenceScore: score,
    thesis,
    antiThesis,
    financialRatios: {
      peRatio,
      pbRatio,
      debtToEquity,
      currentRatio,
      roe,
      profitMargin,
      freeCashFlowGrowth: parseFloat(((absHash % 100) / 10).toFixed(2)),
    },
    swot: { strengths, weaknesses, opportunities, threats },
    news,
    risks,
    chartData,
    markdownReport: `# INVESTMENT AUDIT REPORT: ${cleanTicker}

## RECOMMENDATION DECISION: ${verdict}
- **Investment Score**: ${score}/100
- **Confidence Rating**: ${score}%
- **Generated On**: ${new Date().toISOString().split('T')[0]}

---

### 1. Executive Summary
${thesis}

---

### 2. Company Overview
Target ticker symbol: **${cleanTicker}**. Audited using strategy guidelines framework: **${strategy}**.
Profiles indicate active market positioning within structural tech cycles.

---

### 3. Financial Analysis
Extracted metrics from balance sheets and earnings statements:

| Financial Attribute | Value |
| :--- | :--- |
| **P/E Ratio** | ${peRatio}x |
| **P/B Ratio** | ${pbRatio}x |
| **Debt to Equity** | ${debtToEquity} |
| **Current Ratio** | ${currentRatio}x |
| **Return on Equity (ROE)** | ${roe}% |
| **Profit Margin** | ${profitMargin}% |
| **Latest Stock Price** | $${price} |

---

### 4. Latest News
Headlines tracked by search nodes during audit phase:
${news.map(n => `- **${n.title}** (${n.source}) - *${n.sentiment} Sentiment*`).join('\n')}

---

### 5. SWOT Analysis

#### Strengths
${strengths.map(s => `- ${s}`).join('\n')}

#### Weaknesses
${weaknesses.map(w => `- ${w}`).join('\n')}

#### Opportunities
${opportunities.map(o => `- ${o}`).join('\n')}

#### Threats
${threats.map(t => `- ${t}`).join('\n')}

---

### 6. Risk Analysis
Key vulnerabilities compiled by risk assessment node:
${risks.map((r, i) => `- **Risk ${i+1}**: ${r.title} (${r.severity} Severity) - ${r.description}`).join('\n')}

---

### 7. Future Outlook
Expected to track industry baseline metrics with medium-term volatility and market share consolidation.

---
*Report generated automatically by Antigravity VALO Agentic Research Platform.*`
  };
}
