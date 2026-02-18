// app/api/system/route.ts
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

function getCPU(): number {
  try {
    const output = execSync('top -l 1 | grep "CPU usage"', { encoding: 'utf-8' });
    const match = output.match(/(\d+\.\d+)% user/);
    return match ? parseFloat(match[1]) : 0;
  } catch {
    return 0;
  }
}

function getRAM(): number {
  try {
    const output = execSync('vm_stat', { encoding: 'utf-8' });
    const pageSize = 4096;
    const active = output.match(/Pages active:\s+(\d+)/)?.[1];
    const wired = output.match(/Pages wired down:\s+(\d+)/)?.[1];
    const free = output.match(/Pages free:\s+(\d+)/)?.[1];
    
    if (!active || !wired || !free) return 0;
    
    const totalPages = parseInt(active) + parseInt(wired) + parseInt(free);
    const usedPages = parseInt(active) + parseInt(wired);
    return (usedPages / totalPages) * 100;
  } catch {
    return 0;
  }
}

function getDisk(): number {
  try {
    const output = execSync('df -h / | awk \'NR==2 {print $5}\'', { encoding: 'utf-8' });
    return parseFloat(output.replace('%', ''));
  } catch {
    return 0;
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const data = {
      cpu: getCPU(),
      ram: getRAM(),
      disk: getDisk(),
      timestamp: Date.now(),
    };
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('System vitals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system vitals', details: String(error) },
      { status: 500 }
    );
  }
}
