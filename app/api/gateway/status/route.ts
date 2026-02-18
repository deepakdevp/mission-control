// app/api/gateway/status/route.ts
import { NextResponse } from 'next/server';

const GATEWAY_URL = 'http://localhost:18789';

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/status`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch status' },
        { status: 500 }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Gateway status error:', error);
    return NextResponse.json(
      { error: 'Gateway unreachable' },
      { status: 502 }
    );
  }
}
