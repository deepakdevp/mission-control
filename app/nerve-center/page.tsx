import { ThoughtStream } from '@/components/nerve-center/thought-stream';
import { APIFuelGauge } from '@/components/nerve-center/api-fuel-gauge';
import { SystemVitals } from '@/components/nerve-center/system-vitals';
import { SoulMemoryEditor } from '@/components/nerve-center/soul-memory-editor';
import { HITLQueue } from '@/components/nerve-center/hitl-queue';
import { ErrorBoundary } from '@/components/nerve-center/error-boundary';

export default function NerveCenterPage() {
  return (
    <div className="min-h-screen">
      {/* Header - matching JMobbin style */}
      <div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-40">
        <div className="h-14 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Nerve Center</h1>
          </div>
        </div>
      </div>

      {/* Main Content - 32px horizontal, 24px vertical padding per spec */}
      <div className="px-8 py-6">
        <div className="mb-5">
          <p className="text-sm text-[#6B7280]">
            Real-time monitoring of AI agent activity and system health
          </p>
        </div>

        {/* Grid Layout - 20px gap per spec */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-5">
            <ErrorBoundary>
              <ThoughtStream />
            </ErrorBoundary>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-5">
            <ErrorBoundary>
              <APIFuelGauge />
            </ErrorBoundary>
            <ErrorBoundary>
              <SystemVitals />
            </ErrorBoundary>
            <ErrorBoundary>
              <HITLQueue />
            </ErrorBoundary>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <SoulMemoryEditor />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
