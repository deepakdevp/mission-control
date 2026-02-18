// app/api/gateway/sessions/route.ts
import { NextResponse } from 'next/server';

const GATEWAY_URL = 'http://localhost:18789';

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/sessions/list`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gateway unreachable' },
      { status: 502 }
    );
  }
}
