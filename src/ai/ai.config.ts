import { IAiConfig } from './ai.types';
import { loadConfig } from '../common/config.loader';

export class AiConfig implements IAiConfig {
  introduce: string;
  prompt: string;

  constructor(config: Partial<IAiConfig> = {}) {
    this.introduce = config.introduce || '';
    this.prompt = config.prompt || '';
  }

  static async init(): Promise<AiConfig> {
    const config = await loadConfig<IAiConfig>('ai');
    return new AiConfig(config);
  }
}
