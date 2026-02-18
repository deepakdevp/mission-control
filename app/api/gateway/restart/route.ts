// app/api/gateway/restart/route.ts
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(): Promise<NextResponse> {
  try {
    execSync('clawdbot gateway restart', {
      stdio: 'pipe',
      timeout: 5000,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Gateway restart initiated',
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('Gateway restart error:', error);
    return NextResponse.json(
      { error: 'Failed to restart gateway', details: String(error) },
      { status: 500 }
    );
  }
}
