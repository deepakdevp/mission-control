import { getFileSyncService } from '../sync/file-sync';

// Use the file sync service as the global watcher
export const globalWatcher = getFileSyncService();

// Initialize the watcher when this module is loaded
if (typeof window === 'undefined') {
  // Server-side only
  globalWatcher.start().catch(console.error);
}
