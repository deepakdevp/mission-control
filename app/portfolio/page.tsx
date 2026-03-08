'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Image from 'next/image';

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

interface PortfolioData {
  binance: {
    totalValueUsd: number;
    holdings: BinanceHolding[];
  };
  zerodha: {
    totalValueInr: number;
    holdings: ZerodhaHolding[];
  };
}

// --- API FUNCTION ---
async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch('/api/portfolio');
  if (!res.ok) throw new Error('Failed to fetch portfolio data');
  return res.json();
}

// --- HELPER COMPONENTS ---
function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
    return (
        <div className="card">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{value}</p>
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
        return data.binance.holdings.map(h => ({ name: h.symbol, value: h.valueUsd }));
    }, [data]);

    if (isLoading) {
        return <div className="p-8">Loading portfolio...</div>;
    }

    if (!data) {
        return <div className="p-8">Could not load portfolio data.</div>;
    }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-10">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Investment Portfolio</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Crypto Portfolio (Binance)" 
                value={`$${data.binance.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="Total value in USD"
            />
            <StatCard 
                title="Stock Portfolio (Zerodha)" 
                value={`₹${data.zerodha.totalValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="Total value in INR"
            />
            {/* You would need an exchange rate API to show a combined total */}
            <StatCard 
                title="Combined Total (Approx)" 
                value="N/A"
                subtitle="Requires live USD-INR rates"
            />
        </div>

        {/* Binance Crypto Holdings */}
        <div className="card">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Binance Holdings (Crypto)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="md:col-span-2">
                    <div className="overflow-x-auto">
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
        </div>

        {/* Zerodha Stock Holdings */}
        <div className="card">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Zerodha Holdings (Stocks)</h2>
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
        </div>

      </div>
    </div>
  );
}
