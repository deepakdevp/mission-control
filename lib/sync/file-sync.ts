import chokidar, { FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';

export class FileSyncService extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private baseDir: string;
  private watchPaths: string[];
  private isInitialized = false;

  constructor(baseDir: string = process.cwd()) {
    super();
    this.baseDir = baseDir;
    this.watchPaths = [
      'clawd/tasks',
      'clawd/approvals',
      'clawd/projects',
      'clawd/people',
      'clawd/calendar',
      'clawd/memory',
      'clawd/docs',
      'clawd/cron',
    ].map(p => path.join(baseDir, p));
  }

  async start() {
    if (this.isInitialized) {
      console.log('File sync already initialized');
      return;
    }

    // Ensure directories exist
    await this.ensureDirectories();

    // Start watching
    this.watcher = chokidar.watch(this.watchPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileChange('add', filePath))
      .on('change', (filePath) => this.handleFileChange('change', filePath))
      .on('unlink', (filePath) => this.handleFileChange('unlink', filePath))
      .on('error', (error) => console.error('Watcher error:', error));

    this.isInitialized = true;
    console.log('File sync service started, watching:', this.watchPaths);
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.isInitialized = false;
      console.log('File sync service stopped');
    }
  }

  private async ensureDirectories() {
    for (const dir of this.watchPaths) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  private handleFileChange(type: 'add' | 'change' | 'unlink', filePath: string) {
    const relativePath = path.relative(this.baseDir, filePath);
    
    console.log(`File ${type}: ${relativePath}`);
    
    this.emit('change', {
      type,
      path: relativePath,
      absolutePath: filePath,
    });
  }

  async syncToDatabase(filePath: string, content: any) {
    // This would sync file content to a database if we had one
    // For now, we're just using files as the source of truth
    console.log('Sync to database:', filePath);
  }

  async syncToFile(filePath: string, content: any) {
    // Sync from database to file
    const fullPath = path.join(this.baseDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(content, null, 2), 'utf-8');
    console.log('Synced to file:', filePath);
  }
}

// Singleton instance
let syncService: FileSyncService | null = null;

export function getFileSyncService(): FileSyncService {
  if (!syncService) {
    syncService = new FileSyncService();
  }
  return syncService;
}
