import { AiService } from './ai/ai.service';
import { AiConfig } from './ai/ai.config';

async function test() {
  try {
    const config = await AiConfig.init();
    const aiService = new AiService(config);
    await aiService.test();
    console.log('AI service test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
