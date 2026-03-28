import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const portfolioDir = process.env.PORTFOLIO_DIR || '/Users/deepak.panwar/clawd/portfolio'

  try {
    const readJson = (file: string) => {
      try {
        return JSON.parse(readFileSync(join(portfolioDir, file), 'utf8'))
      } catch {
        return null
      }
    }

    const summary = readJson('summary.json')
    const binance = readJson('binance-portfolio.json')
    const usStocks = readJson('us_stocks.json')
    const mutualFunds = readJson('mutual_funds.json')
    const indianStocks = readJson('indian_stocks.json')

    // Compute totals from real data
    const usdInrRate = summary?.usd_inr_rate || 83.5

    const cryptoUsd = binance?.total_usdt || 0
    const usStocksValue = usStocks?.[0]?.current_value || 0
    const usStocksInvested = usStocks?.[0]?.invested_value || 0
    const mfTotal = mutualFunds
      ? mutualFunds.reduce((sum: number, f: { current_value: number }) => sum + f.current_value, 0)
      : 0
    const mfInvested = mutualFunds
      ? mutualFunds.reduce((sum: number, f: { invested_value: number }) => sum + f.invested_value, 0)
      : 0
    const indianTotal = indianStocks
      ? indianStocks.reduce((sum: number, s: { current_value: number }) => sum + s.current_value, 0)
      : 0

    const netWorthInr = summary?.net_worth_inr || 0

    return NextResponse.json({
      netWorthInr,
      usdInrRate,
      crypto: {
        totalUsd: cryptoUsd,
        numAssets: binance?.num_assets || 0,
        topHoldings: (binance?.holdings || []).slice(0, 3).map((h: { asset: string; usdt_value: number }) => ({
          asset: h.asset,
          valueUsd: h.usdt_value,
        })),
      },
      usStocks: {
        totalUsd: usStocksValue,
        investedUsd: usStocksInvested,
        gainUsd: usStocksValue - usStocksInvested,
      },
      mutualFunds: {
        totalInr: mfTotal,
        investedInr: mfInvested,
        gainInr: mfTotal - mfInvested,
        count: mutualFunds?.length || 0,
      },
      indianStocks: {
        totalInr: indianTotal,
        count: indianStocks?.length || 0,
      },
      timestamp: summary?.timestamp || new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Portfolio data unavailable' }, { status: 503 })
  }
}
