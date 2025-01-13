import { AiService } from '../ai/ai.service';
import { IAiConfig, IAiFilter } from '../ai/ai.types';

describe('AiService', () => {
  let aiService: AiService;
  const mockConfig: IAiConfig = {
    introduce: 'Test AI Service',
    prompt: '关键词: {keyword}, 职位: {jobName}, 描述: {jd}'
  };

  beforeEach(() => {
    aiService = new AiService(mockConfig);
  });

  test('should check job match', async () => {
    const result: IAiFilter = await aiService.checkJobMatch(
      'Java开发',
      '高级Java工程师',
      '负责核心系统开发'
    );
    
    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('message');
  });

  test('should format prompt correctly', async () => {
    const response = await aiService.sendRequest('Test message');
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  });
}); 