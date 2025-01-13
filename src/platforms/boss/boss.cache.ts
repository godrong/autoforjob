import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { logger } from '../../utils/logger';
import { BossDOMHelper } from './boss.helper';

export class JobCache {
  private cache = new Map<string, IJob>();
  private readonly cacheFile = path.resolve(process.cwd(), 'data', 'boss', 'job_cache.json');

  constructor() {
    this.loadCache();
  }

  private async loadCache() {
    try {
      const data = await readFile(this.cacheFile, 'utf8');
      const jobs = JSON.parse(data);
      jobs.forEach((job: IJob) => {
        this.cache.set(BossDOMHelper.getUniqueKey(job), job);
      });
      logger.info(`加载职位缓存: ${this.cache.size} 条记录`);
    } catch (error) {
      logger.warn('无法加载职位缓存:', error);
    }
  }

  private async saveCache() {
    try {
      await writeFile(
        this.cacheFile,
        JSON.stringify(Array.from(this.cache.values()), null, 2)
      );
    } catch (error) {
      logger.error('保存职位缓存失败:', error);
    }
  }

  set(job: IJob): void {
    const key = BossDOMHelper.getUniqueKey(job);
    this.cache.set(key, job);
    this.saveCache();
  }

  get(key: string): IJob | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
} 