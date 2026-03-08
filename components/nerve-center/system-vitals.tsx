// components/nerve-center/system-vitals.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface VitalData {
  cpu: number;
  ram: number;
  disk: number;
  timestamp: number;
}

interface SparklineProps {
  data: number[];
  label: string;
  current: number;
  color: string;
}

function Sparkline({ data, label, current, color }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const max = Math.max(...data, 100);
    const xStep = width / (data.length - 1);

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, i) => {
      const x = i * xStep;
      const y = height - (value / max) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data, color]);

  return (
    <div className="bg-[#F9FAFB] border border-[#EEEEEE] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-[#6B7280]">{label}</h4>
        <span className="text-2xl font-bold text-[#1A1A2E]">
          {current.toFixed(1)}%
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={60}
        className="w-full"
      />
    </div>
  );
}

export function SystemVitals() {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(60).fill(0));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(60).fill(0));
  const [diskHistory, setDiskHistory] = useState<number[]>(Array(60).fill(0));
  const [current, setCurrent] = useState<VitalData>({ cpu: 0, ram: 0, disk: 0, timestamp: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await fetch('/api/system');
        const data: VitalData = await res.json();
        
        setCurrent(data);
        setCpuHistory(prev => [...prev.slice(1), data.cpu]);
        setRamHistory(prev => [...prev.slice(1), data.ram]);
        setDiskHistory(prev => [...prev.slice(1), data.disk]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch vitals:', error);
        setIsLoading(false);
      }
    };

    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);
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
      <h3 className="text-base font-semibold text-[#1A1A2E] mb-4">System Vitals</h3>
      
      <div className="space-y-4">
        <Sparkline
          data={cpuHistory}
          label="CPU Load"
          current={current.cpu}
          color="#5B4EE8"
        />
        <Sparkline
          data={ramHistory}
          label="RAM Usage"
          current={current.ram}
          color="#10B981"
        />
        <Sparkline
          data={diskHistory}
          label="Disk Space"
          current={current.disk}
          color="#F59E0B"
        />
      </div>
    </div>
  );
}
