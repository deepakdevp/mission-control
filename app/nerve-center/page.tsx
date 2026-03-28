import { ThoughtStream } from '@/components/nerve-center/thought-stream';
import { APIFuelGauge } from '@/components/nerve-center/api-fuel-gauge';
import { SystemVitals } from '@/components/nerve-center/system-vitals';
import { SoulMemoryEditor } from '@/components/nerve-center/soul-memory-editor';
import { HITLQueue } from '@/components/nerve-center/hitl-queue';
import { ErrorBoundary } from '@/components/nerve-center/error-boundary';
import { PageHeader } from '@/components/page-header';

export default function NerveCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Nerve Center"
        description="Real-time monitoring of AI agent activity and system health"
      />

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Grid Layout */}
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
