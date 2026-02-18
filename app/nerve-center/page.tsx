import { ThoughtStream } from '@/components/nerve-center/thought-stream';
import { APIFuelGauge } from '@/components/nerve-center/api-fuel-gauge';
import { SystemVitals } from '@/components/nerve-center/system-vitals';
import { SoulMemoryEditor } from '@/components/nerve-center/soul-memory-editor';
import { HITLQueue } from '@/components/nerve-center/hitl-queue';

export default function NerveCenterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Nerve Center
          </h1>
          <p className="text-zinc-400 text-sm">
            Real-time monitoring of AI agent activity and system health
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ThoughtStream />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-6">
            <APIFuelGauge />
            <SystemVitals />
            <HITLQueue />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <SoulMemoryEditor />
          </div>
        </div>
      </div>
    </div>
  );
}
