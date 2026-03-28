'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { KPICard } from '@/components/dashboard/kpi-card';
import { TrendingUp, Bitcoin, BarChart2, PieChart, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface BinanceHolding {
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  logo: string;
}

interface ZerodhaHolding {
  symbol: string;
  name: string;
  amount: number;
  valueInr: number;
  pnlPercentage: number;
}

interface USStockHolding {
  Symbol: string;
  Name: string;
  Quantity: number;
  'Market Value (USD)': number;
  'Gain (USD)': number;
  'Gain (%)': number;
}

interface MutualFundHolding {
  scheme_name: string;
  units: number;
  nav: number;
  current_value: number;
}

interface PortfolioData {
  binance: { totalValueUsd: number; holdings: BinanceHolding[] };
  zerodha: { totalValueInr: number; holdings: ZerodhaHolding[] };
  usStocks: { totalValueUsd: number; totalGainUsd: number; holdings: USStockHolding[] };
  mutualFunds: { totalValueInr: number; holdings: MutualFundHolding[] };
}

// --- HELPERS ---
function fmtUsd(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtInr(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)}`;
}

async function fetchPortfolio(): Promise<PortfolioData> {
  const [binanceRes, zerodhaRes, usStocksRes, mutualFundsRes] = await Promise.all([
    fetch('/binance-portfolio.json').catch(() => null),
    fetch('/zerodha-portfolio.json').catch(() => null),
    fetch('/us-stocks.json').catch(() => null),
    fetch('/mutual_funds.json').catch(() => null),
  ]);

  const binanceData = binanceRes?.ok ? await binanceRes.json() : {};
  const zerodhaData = zerodhaRes?.ok ? await zerodhaRes.json() : {};
  const usStocksData = usStocksRes?.ok ? await usStocksRes.json() : {};
  const mutualFundsData = mutualFundsRes?.ok ? await mutualFundsRes.json() : {};

  const usStocksHoldings: USStockHolding[] = usStocksData.holdings || [];
  const totalUsStocksValue = usStocksHoldings.reduce((a, h) => a + (h['Market Value (USD)'] || 0), 0);
  const totalUsStocksGain = usStocksHoldings.reduce((a, h) => a + (h['Gain (USD)'] || 0), 0);

  const mutualFundsHoldings: MutualFundHolding[] = mutualFundsData.holdings || [];
  const totalMutualFundsValue = mutualFundsHoldings.reduce((a, h) => a + (h.current_value || 0), 0);

  return {
    binance: {
      totalValueUsd: binanceData.total_value_usd || 0,
      holdings: (binanceData.assets || []).map((a: Record<string, string>) => ({
        symbol: a.asset,
        name: a.asset_name,
        amount: parseFloat(a.total_balance) || 0,
        valueUsd: parseFloat(a.value_usd) || 0,
        logo: a.logo_url || '',
      })),
    },
    zerodha: {
      totalValueInr: zerodhaData.total_value_inr || 0,
      holdings: (zerodhaData.holdings || []).map((h: Record<string, string>) => ({
        symbol: h.tradingsymbol,
        name: h.instrument_token,
        amount: parseFloat(h.quantity) || 0,
        valueInr: (parseFloat(h.last_price) || 0) * (parseFloat(h.quantity) || 0),
        pnlPercentage: parseFloat(h.pnl_percentage) || 0,
      })),
    },
    usStocks: {
      totalValueUsd: totalUsStocksValue,
      totalGainUsd: totalUsStocksGain,
      holdings: usStocksHoldings,
    },
    mutualFunds: {
      totalValueInr: totalMutualFundsValue,
      holdings: mutualFundsHoldings,
    },
  };
}

// --- TABS ---
const TABS = ['Crypto', 'US Stocks', 'Mutual Funds', 'Indian Stocks'] as const;
type Tab = typeof TABS[number];

// --- SORTABLE TABLE HEADER ---
function SortHeader({ label, field, sortBy, onSort }: {
  label: string;
  field: string;
  sortBy: { field: string; dir: 'asc' | 'desc' };
  onSort: (f: string) => void;
}) {
  return (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 select-none"
    >
      {label}
      {sortBy.field === field && (
        <span className="ml-1">{sortBy.dir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  );
}

// --- MAIN ---
export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Crypto');
  const [sortBy, setSortBy] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: 'value', dir: 'desc' });

  useEffect(() => {
    fetchPortfolio()
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSort = (field: string) => {
    setSortBy(prev => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const totalUsdGainPct = data && data.usStocks.totalValueUsd > 0
    ? ((data.usStocks.totalGainUsd / (data.usStocks.totalValueUsd - data.usStocks.totalGainUsd)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Investment Portfolio" description="Track your investments across all platforms" />
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse space-y-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="h-7 w-32 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Investment Portfolio" />
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">Could not load portfolio data. Check if JSON files are in /public.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Investment Portfolio" description="Track your investments across all platforms" />

      <div className="px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Crypto (Binance)"
            value={fmtUsd(data.binance.totalValueUsd)}
            change="Binance"
            changeType="neutral"
            icon={<Bitcoin className="w-5 h-5" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <KPICard
            title="US Stocks"
            value={fmtUsd(data.usStocks.totalValueUsd)}
            change={data.usStocks.totalGainUsd >= 0 ? `+${totalUsdGainPct.toFixed(1)}%` : `${totalUsdGainPct.toFixed(1)}%`}
            changeType={data.usStocks.totalGainUsd >= 0 ? 'positive' : 'negative'}
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Mutual Funds"
            value={fmtInr(data.mutualFunds.totalValueInr)}
            change="India"
            changeType="neutral"
            icon={<PieChart className="w-5 h-5" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <KPICard
            title="Indian Stocks (Zerodha)"
            value={data.zerodha.totalValueInr > 0 ? fmtInr(data.zerodha.totalValueInr) : '–'}
            change="Zerodha"
            changeType="neutral"
            icon={<BarChart2 className="w-5 h-5" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* Tabs + Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-3.5 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="overflow-x-auto">
            {activeTab === 'Crypto' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Asset</th>
                    <SortHeader label="Amount" field="amount" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="Value (USD)" field="value" sortBy={sortBy} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {data.binance.holdings.length === 0 ? (
                    <tr><td colSpan={3} className="py-12 text-center text-sm text-gray-400">No crypto holdings</td></tr>
                  ) : [...data.binance.holdings]
                    .sort((a, b) => sortBy.dir === 'desc' ? b.valueUsd - a.valueUsd : a.valueUsd - b.valueUsd)
                    .map(h => (
                      <tr key={h.symbol} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {h.logo ? (
                              <Image src={h.logo} alt={h.name || h.symbol} width={28} height={28} className="rounded-full" />
                            ) : (
                              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                {h.symbol.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{h.symbol}</p>
                              <p className="text-xs text-gray-400">{h.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{h.amount.toFixed(6)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fmtUsd(h.valueUsd)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {activeTab === 'US Stocks' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</th>
                    <SortHeader label="Qty" field="qty" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="Market Value" field="value" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="Gain (%)" field="gain" sortBy={sortBy} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {data.usStocks.holdings.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-sm text-gray-400">No US stock holdings</td></tr>
                  ) : [...data.usStocks.holdings]
                    .sort((a, b) => {
                      const aV = sortBy.field === 'qty' ? a.Quantity : sortBy.field === 'gain' ? a['Gain (%)'] : a['Market Value (USD)'];
                      const bV = sortBy.field === 'qty' ? b.Quantity : sortBy.field === 'gain' ? b['Gain (%)'] : b['Market Value (USD)'];
                      return sortBy.dir === 'desc' ? bV - aV : aV - bV;
                    })
                    .map(h => (
                      <tr key={h.Symbol} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{h.Symbol}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{h.Name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{h.Quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fmtUsd(h['Market Value (USD)'])}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-sm font-semibold',
                            h['Gain (%)'] >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {h['Gain (%)'] >= 0 ? '+' : ''}{h['Gain (%)'].toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Mutual Funds' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Scheme</th>
                    <SortHeader label="Units" field="units" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="NAV" field="nav" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="Current Value" field="value" sortBy={sortBy} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {data.mutualFunds.holdings.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-sm text-gray-400">No mutual fund holdings</td></tr>
                  ) : [...data.mutualFunds.holdings]
                    .sort((a, b) => {
                      const aV = sortBy.field === 'units' ? a.units : sortBy.field === 'nav' ? a.nav : a.current_value;
                      const bV = sortBy.field === 'units' ? b.units : sortBy.field === 'nav' ? b.nav : b.current_value;
                      return sortBy.dir === 'desc' ? bV - aV : aV - bV;
                    })
                    .map(h => (
                      <tr key={h.scheme_name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900 max-w-xs">{h.scheme_name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{h.units.toFixed(4)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">₹{h.nav.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{h.current_value.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Indian Stocks' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Symbol</th>
                    <SortHeader label="Qty" field="qty" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="Value (INR)" field="value" sortBy={sortBy} onSort={handleSort} />
                    <SortHeader label="P&L (%)" field="pnl" sortBy={sortBy} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {data.zerodha.holdings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <p className="text-sm text-gray-500">No Indian stocks held in Zerodha account</p>
                      </td>
                    </tr>
                  ) : [...data.zerodha.holdings]
                    .sort((a, b) => {
                      const aV = sortBy.field === 'qty' ? a.amount : sortBy.field === 'pnl' ? a.pnlPercentage : a.valueInr;
                      const bV = sortBy.field === 'qty' ? b.amount : sortBy.field === 'pnl' ? b.pnlPercentage : b.valueInr;
                      return sortBy.dir === 'desc' ? bV - aV : aV - bV;
                    })
                    .map(h => (
                      <tr key={h.symbol} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{h.symbol}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{h.amount}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fmtInr(h.valueInr)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-sm font-semibold',
                            h.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {h.pnlPercentage >= 0 ? '+' : ''}{h.pnlPercentage.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
