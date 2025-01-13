import { BossService } from './platforms/boss/boss.service';
import { AiService } from './ai/ai.service';
import { loadConfig } from './common/config.loader';
import { logger } from './common/logger';
import { IBossConfig } from './platforms/boss/boss.types';

async function main() {
  try {
    const aiService = new AiService({
      introduce: '',
      prompt: ''
    });
    
    const bossConfig = await loadConfig<IBossConfig>('boss');
    const bossService = new BossService(bossConfig, aiService);
    
    await bossService.init();
    await bossService.postJobs();
  } catch (error) {
    logger.error('Application failed:', error);
    process.exit(1);
  }
}

main();