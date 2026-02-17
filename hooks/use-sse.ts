"use client";

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface SSEEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
}

export function useSSE(onEvent?: (event: SSEEvent) => void) {
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        
        // Show toast notification
        const fileName = data.path.split('/').pop();
        if (data.type === 'add') {
          toast.success(`New file: ${fileName}`);
        } else if (data.type === 'change') {
          toast.info(`Updated: ${fileName}`);
        } else if (data.type === 'unlink') {
          toast.error(`Deleted: ${fileName}`);
        }

        // Call custom handler
        if (onEvent) {
          onEvent(data);
        }
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [onEvent]);
}

export function useAutoRefresh(refreshFn: () => void, watchPaths: string[]) {
  const handleEvent = useCallback((event: SSEEvent) => {
    // Check if the event path matches any of the watch paths
    const shouldRefresh = watchPaths.some(path => event.path.includes(path));
    if (shouldRefresh) {
      refreshFn();
    }
  }, [refreshFn, watchPaths]);

  useSSE(handleEvent);
}
