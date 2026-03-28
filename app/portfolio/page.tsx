'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';

// --- TYPES ---
interface BinanceHolding {
  symbol: string; name: string; amount: number; valueUsd: number; logo: string;
}
interface ZerodhaHolding {
  symbol: string; name: string; amount: number; valueInr: number; pnlPercentage: number;
}
interface USStockHolding {
  Symbol: string; Name: string; Quantity: number; "Market Value (USD)": number; "Gain (USD)": number; "Gain (%)": number;
}
interface MutualFundHolding {
  scheme_name: string; units: number; nav: number; current_value: number;
}

interface PortfolioData {
  binance: { totalValueUsd: number; holdings: BinanceHolding[]; };
  zerodha: { totalValueInr: number; holdings: ZerodhaHolding[]; };
  usStocks: { totalValueUsd: number; totalGainUsd: number; holdings: USStockHolding[]; };
  mutualFunds: { totalValueInr: number; holdings: MutualFundHolding[]; };
}

// --- API FUNCTION ---
async function fetchPortfolio(): Promise<PortfolioData> {
  const [binanceRes, zerodhaRes, usStocksRes, mutualFundsRes] = await Promise.all([
    fetch('/binance-portfolio.json'),
    fetch('/zerodha-portfolio.json'),
    fetch('/us-stocks.json'),
    fetch('/mutual_funds.json')
  ]);

  if (!binanceRes.ok || !zerodhaRes.ok || !usStocksRes.ok || !mutualFundsRes.ok) {
    throw new Error('Failed to fetch one or more portfolio data files');
  }

  const binanceData = await binanceRes.json();
  const zerodhaData = await zerodhaRes.json();
  const usStocksData = await usStocksRes.json();
  const mutualFundsData = await mutualFundsRes.json();

  const usStocksHoldings = usStocksData.holdings || [];
  const totalUsStocksValue = usStocksHoldings.reduce((acc: number, h: USStockHolding) => acc + h["Market Value (USD)"], 0);
  const totalUsStocksGain = usStocksHoldings.reduce((acc: number, h: USStockHolding) => acc + h["Gain (USD)"], 0);
  
  const mutualFundsHoldings = mutualFundsData.holdings || [];
  const totalMutualFundsValue = mutualFundsHoldings.reduce((acc: number, h: MutualFundHolding) => acc + h.current_value, 0);

  const portfolio = {
      binance: {
          totalValueUsd: binanceData.total_value_usd || 0,
          holdings: binanceData.assets?.map((asset: any) => ({
              symbol: asset.asset, name: asset.asset_name, amount: parseFloat(asset.total_balance), valueUsd: parseFloat(asset.value_usd), logo: asset.logo_url
          })) || [],
      },
      zerodha: {
          totalValueInr: zerodhaData.total_value_inr || 0,
          holdings: zerodhaData.holdings?.map((holding: any) => ({
              symbol: holding.tradingsymbol, name: holding.instrument_token, amount: parseFloat(holding.quantity), valueInr: parseFloat(holding.last_price) * parseFloat(holding.quantity), pnlPercentage: parseFloat(holding.pnl_percentage)
          })) || [],
      },
      usStocks: {
          totalValueUsd: totalUsStocksValue,
          totalGainUsd: totalUsStocksGain,
          holdings: usStocksHoldings,
      },
      mutualFunds: {
          totalValueInr: totalMutualFundsValue,
          holdings: mutualFundsHoldings,
      }
  };

  return portfolio;
}


// --- HELPER COMPONENTS ---
function StatCard({ title, value, subtitle, gain, gainColor }: { title: string; value: string; subtitle?: string; gain?: string; gainColor?: string }) {
    return (
        <div className="card">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{value}</p>
              {gain && <p className={`text-sm font-semibold ${gainColor}`}>{gain}</p>}
            </div>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}

const COLORS = ['#5B4EE8', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

// --- MAIN PAGE COMPONENT ---
export default function PortfolioPage() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const portfolioData = await fetchPortfolio();
                setData(portfolioData);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        // A simple combined chart would require currency conversion.
        // For now, let's stick to crypto allocation.
        return data.binance.holdings.map(h => ({ name: h.symbol, value: h.valueUsd }));
    }, [data]);

    if (isLoading) {
        return (
          <div className="min-h-screen bg-gray-50">
            <PageHeader title="Investment Portfolio" />
            <div className="px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                    <div className="h-7 w-32 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
              <div className="card animate-pulse space-y-3">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-3 w-full bg-gray-100 rounded" />)}
              </div>
            </div>
          </div>
        );
    }

    if (!data) {
        return <div className="p-8 text-[var(--text-secondary)]">Could not load portfolio data. Check if all JSON files are present in /public.</div>;
    }

    const totalUsdGainPercent = (data.usStocks.totalGainUsd / (data.usStocks.totalValueUsd - data.usStocks.totalGainUsd)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Investment Portfolio" description="Track your investments across all platforms" />

      {/* Main Content */}
      <div className="px-8 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
                title="US Stocks" 
                value={`$${data.usStocks.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                gain={`+$${data.usStocks.totalGainUsd.toFixed(2)} (${totalUsdGainPercent.toFixed(2)}%)`}
                gainColor="text-green-600"
            />
            <StatCard 
                title="Mutual Funds (India)" 
                value={`₹${data.mutualFunds.totalValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <StatCard 
                title="Crypto (Binance)" 
                value={`$${data.binance.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <StatCard 
                title="Indian Stocks (Zerodha)" 
                value={`₹${data.zerodha.totalValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
        </div>
        
        {/* US Stocks */}
        <div className="card">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">US Stocks</h2>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-xs text-gray-500 uppercase">
                            <th className="py-2">Symbol</th>
                            <th>Quantity</th>
                            <th>Market Value (USD)</th>
                            <th className="text-right">Gain (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.usStocks.holdings.map(h => (
                            <tr key={h.Symbol} className="border-b">
                                <td className="py-2 font-bold">{h.Symbol} <span className="font-normal text-gray-400">{h.Name}</span></td>
                                <td>{h.Quantity}</td>
                                <td>${h["Market Value (USD)"].toFixed(2)}</td>
                                <td className={`text-right font-medium ${h["Gain (%)"] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {h["Gain (%)"].toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Mutual Funds */}
        <div className="card">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Mutual Funds (India)</h2>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-xs text-gray-500 uppercase">
                            <th className="py-2">Scheme Name</th>
                            <th>Units</th>
                            <th className="text-right">Current Value (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.mutualFunds.holdings.map(h => (
                            <tr key={h.scheme_name} className="border-b">
                                <td className="py-2 font-bold">{h.scheme_name}</td>
                                <td>{h.units.toFixed(4)}</td>
                                <td className="text-right">₹{h.current_value.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Binance Crypto Holdings */}
        <div className="card">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Binance Holdings (Crypto)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="md:col-span-2 max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        {data.binance.holdings.map(h => (
                            <tr key={h.symbol} className="border-b">
                                <td className="py-2 flex items-center gap-3">
                                    <Image src={h.logo} alt={h.name} width={24} height={24} className="rounded-full" />
                                    <div>
                                        <p className="font-bold">{h.symbol}</p>
                                        <p className="text-xs text-gray-500">{h.name}</p>
                                    </div>
                                </td>
                                <td>{h.amount.toFixed(6)}</td>
                                <td className="text-right font-medium">${h.valueUsd.toFixed(2)}</td>
                            </tr>
                        ))}
                    </table>
                </div>
            </div>
        </div>

        {/* Zerodha Stock Holdings */}
        <div className="card">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Zerodha Holdings (Indian Stocks)</h2>
            {data.zerodha.holdings.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs text-gray-500 uppercase">
                                <th className="py-2">Symbol</th>
                                <th>Quantity</th>
                                <th>Value (INR)</th>
                                <th className="text-right">P&L (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.zerodha.holdings.map(h => (
                                <tr key={h.symbol} className="border-b">
                                    <td className="py-2 font-bold">{h.symbol}</td>
                                    <td>{h.amount}</td>
                                    <td>₹{h.valueInr.toFixed(2)}</td>
                                    <td className={`text-right font-medium ${h.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {h.pnlPercentage.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">No Indian stocks held in Zerodha account.</p>
            )}
        </div>
      </div>
    </div>
  );
}
