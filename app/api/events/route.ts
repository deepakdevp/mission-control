import { globalWatcher } from '@/lib/fs/watcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const listener = (event: any) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      globalWatcher.on('change', listener);

      // Cleanup on close
      const cleanup = () => {
        globalWatcher.off('change', listener);
      };

      // Handle client disconnect
      return () => cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
