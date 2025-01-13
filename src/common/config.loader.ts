import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { logger } from './logger';
import path from 'path';

export async function loadConfig<T>(section: string): Promise<T> {
  try {
    const configPath = path.resolve(process.cwd(), 'config', 'default.yaml');
    const file = await readFile(configPath, 'utf8');
    const config = parse(file);
    
    if (!config || !config[section]) {
      throw new Error(`Configuration section '${section}' not found`);
    }
    
    return config[section] as T;
  } catch (error) {
    logger.error(`Failed to load config for section ${section}:`, error);
    throw error;
  }
}
