import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read and parse a JSON file
async function readPortfolioFile(filePath: string) {
    try {
        const fullPath = path.join(process.cwd(), '..', filePath); // Navigate up from .next/ to project root
        const data = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        // If file not found, return a default structure
        if (error.code === 'ENOENT') {
            console.warn(`Portfolio file not found at: ${fullPath}`);
            return { error: 'File not found', holdings: [], summary: {} };
        }
        console.error(`Error reading portfolio file ${filePath}:`, error);
        return { error: 'Failed to read data', holdings: [], summary: {} };
    }
}

export async function GET() {
    try {
        const binanceData = await readPortfolioFile('portfolio/binance-portfolio.json');
        const zerodhaData = await readPortfolioFile('portfolio/zerodha-portfolio.json');

        // Basic transformation to standardize the data for the frontend
        const portfolio = {
            binance: {
                totalValueUsd: binanceData.total_value_usd || 0,
                holdings: binanceData.assets?.map((asset: any) => ({
                    symbol: asset.asset,
                    name: asset.asset_name,
                    amount: parseFloat(asset.total_balance),
                    valueUsd: parseFloat(asset.value_usd),
                    logo: asset.logo_url
                })) || [],
            },
            zerodha: {
                totalValueInr: zerodhaData.total_value_inr || 0,
                holdings: zerodhaData.holdings?.map((holding: any) => ({
                    symbol: holding.tradingsymbol,
                    name: holding.instrument_token, // Placeholder, might need a mapping for full names
                    amount: parseFloat(holding.quantity),
                    valueInr: parseFloat(holding.last_price) * parseFloat(holding.quantity),
                    pnlPercentage: parseFloat(holding.pnl_percentage)
                })) || [],
            }
        };

        return NextResponse.json(portfolio);
    } catch (error) {
        console.error('Failed to build portfolio data:', error);
        return NextResponse.json({ error: 'Failed to consolidate portfolio data' }, { status: 500 });
    }
}
