// components/nerve-center/api-fuel-gauge.tsx
'use client';

import { useEffect, useState } from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
}

function CircularGauge({ value, max, label, unit }: GaugeProps) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isWarning = percentage > 80;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={isWarning ? '#F59E0B' : '#5B4EE8'}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1A1A2E]">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-[#9CA3AF]">{unit}</span>
      </div>
      
      <p className="mt-3 text-sm font-medium text-[#1A1A2E]">{label}</p>
      <p className="text-xs text-[#6B7280]">of {max.toLocaleString()}</p>
    </div>
  );
}

export function APIFuelGauge() {
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/gateway/status');
        const data = await res.json();
        
        // TODO: Parse actual token usage from Gateway response
        const tokenUsage = data.tokens || 0;
        const estimatedCost = (tokenUsage / 1000) * 0.003; // Claude Sonnet pricing
        
        setTokens(tokenUsage);
        setCost(estimatedCost);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-[#1A1A2E] mb-6">API Fuel Gauges</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <CircularGauge
          value={tokens}
          max={100000}
          label="Token Usage"
          unit="tokens"
        />
        <CircularGauge
          value={cost}
          max={10}
          label="Estimated Cost"
          unit="USD"
        />
      </div>
    </div>
  );
}
