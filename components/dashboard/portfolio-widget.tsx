'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface PortfolioData {
  netWorthInr: number
  usdInrRate: number
  crypto: { totalUsd: number; numAssets: number }
  usStocks: { totalUsd: number; gainUsd: number }
  mutualFunds: { totalInr: number; gainInr: number; count: number }
  indianStocks: { totalInr: number; count: number }
}

function formatInr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function formatUsd(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function PortfolioWidget() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    
    fetch('/api/portfolio-summary', { signal: controller.signal })
      .then(r => r.json())
      .then(d => { clearTimeout(timeout); setData(d); setLoading(false) })
      .catch(() => { clearTimeout(timeout); setLoading(false) })
    
    // Fallback: stop loading after 5 seconds
    const fallback = setTimeout(() => setLoading(false), 5000)
    return () => { controller.abort(); clearTimeout(timeout); clearTimeout(fallback) }
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-8 w-40 bg-gray-100 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-3/4 bg-gray-100 rounded" />
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
        Portfolio data unavailable
      </div>
    )
  }

  const assetBreakdown = [
    { label: 'US Stocks', value: formatUsd(data.usStocks.totalUsd), gain: data.usStocks.gainUsd > 0 },
    { label: 'Crypto', value: formatUsd(data.crypto.totalUsd), gain: true },
    { label: 'Mutual Funds', value: formatInr(data.mutualFunds.totalInr), gain: data.mutualFunds.gainInr > 0 },
    { label: 'Indian Stocks', value: formatInr(data.indianStocks.totalInr), gain: true },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] uppercase tracking-wide text-[var(--text-muted)] font-medium">Portfolio</span>
        <Link href="/portfolio" className="text-[var(--primary)] hover:underline text-xs flex items-center gap-0.5">
          View <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] leading-none">{formatInr(data.netWorthInr)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Net Worth</p>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {assetBreakdown.map((asset) => (
          <div key={asset.label} className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{asset.label}</span>
            <span className={`font-medium ${asset.gain ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
              {asset.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
