// lib/gateway-client.ts
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:18789';

interface GatewaySession {
  sessionKey: string;
  messages?: any[];
  [key: string]: any;
}

interface GatewayStatus {
  model?: string;
  tokens?: number;
  [key: string]: any;
}

interface RestartResponse {
  success: boolean;
  message: string;
  timestamp: number;
}

export async function fetchGatewaySessions(): Promise<GatewaySession[]> {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/sessions/list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      throw new Error(`Gateway sessions fetch failed: ${res.status} ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(`Failed to fetch gateway sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchGatewayStatus(): Promise<GatewayStatus> {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      throw new Error(`Gateway status fetch failed: ${res.status} ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(`Failed to fetch gateway status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function restartGateway(): Promise<RestartResponse> {
  try {
    const res = await fetch('/api/gateway/restart', {
      method: 'POST',
    });
    
    if (!res.ok) {
      throw new Error(`Gateway restart failed: ${res.status} ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(`Failed to restart gateway: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
