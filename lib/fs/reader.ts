import fs from 'fs/promises';
import path from 'path';

export class FileReader {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  async readJSON<T>(relativePath: string): Promise<T | null> {
    try {
      const fullPath = path.join(this.baseDir, relativePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async readMarkdown(relativePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.baseDir, relativePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async listFiles(directory: string, extension?: string): Promise<string[]> {
    try {
      const fullPath = path.join(this.baseDir, directory);
      const files = await fs.readdir(fullPath);
      
      if (extension) {
        return files.filter(f => f.endsWith(extension));
      }
      return files;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
}
