import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export class FileWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;

  start(paths: string[]) {
    this.watcher = chokidar.watch(paths, {
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('add', (path) => this.emit('change', { type: 'add', path }));
    this.watcher.on('change', (path) => this.emit('change', { type: 'change', path }));
    this.watcher.on('unlink', (path) => this.emit('change', { type: 'unlink', path }));
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

export const globalWatcher = new FileWatcher();
