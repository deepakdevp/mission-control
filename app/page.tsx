'use client';

import { useState } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';

// Import shadcn components we'll use
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Since we are not fetching live data in this refactor, we'll use placeholder data
const placeholderPortfolio = {
  usStocks: { totalValueUsd: 12560.75, totalGainUsd: 2500.30 },
  mutualFunds: { totalValueInr: 580320.50 },
  binance: { totalValueUsd: 4350.90 },
  zerodha: { totalValueInr: 0 },
};

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget components
function PortfolioWidget({ title, value, gain }: { title: string; value: string; gain?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
        {gain && <p className="text-sm font-semibold text-green-600">{gain}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [layouts, setLayouts] = useState<Record<string, Layout[]>>({
    lg: [
      { i: 'us-stocks', x: 0, y: 0, w: 1, h: 1 },
      { i: 'mutual-funds', x: 1, y: 0, w: 1, h: 1 },
      { i: 'crypto', x: 2, y: 0, w: 1, h: 1 },
      { i: 'indian-stocks', x: 3, y: 0, w: 1, h: 1 },
    ],
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-10">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Dashboard</h1>
          {/* Add settings/edit button here later */}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={150}
          onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
        >
          <div key="us-stocks">
            <PortfolioWidget
              title="US Stocks"
              value={`$${placeholderPortfolio.usStocks.totalValueUsd.toLocaleString()}`}
              gain={`+$${placeholderPortfolio.usStocks.totalGainUsd.toLocaleString()}`}
            />
          </div>
          <div key="mutual-funds">
            <PortfolioWidget
              title="Mutual Funds (INR)"
              value={`₹${placeholderPortfolio.mutualFunds.totalValueInr.toLocaleString()}`}
            />
          </div>
          <div key="crypto">
            <PortfolioWidget
              title="Crypto (Binance)"
              value={`$${placeholderPortfolio.binance.totalValueUsd.toLocaleString()}`}
            />
          </div>
          <div key="indian-stocks">
            <PortfolioWidget
              title="Indian Stocks (INR)"
              value={`₹${placeholderPortfolio.zerodha.totalValueInr.toLocaleString()}`}
            />
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
