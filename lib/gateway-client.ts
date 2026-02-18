// lib/gateway-client.ts
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:18789';

export async function fetchGatewaySessions() {
  const res = await fetch(`${GATEWAY_URL}/api/sessions/list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Gateway unreachable');
  return res.json();
}

export async function fetchGatewayStatus() {
  const res = await fetch(`${GATEWAY_URL}/api/status`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Gateway unreachable');
  return res.json();
}

export async function restartGateway() {
  const res = await fetch('/api/gateway/restart', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Restart failed');
  return res.json();
}
