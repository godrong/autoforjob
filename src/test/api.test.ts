import { AiService } from '../ai/ai.service';
const aiService = new AiService({
    introduce: 'Test message',
    prompt: 'Say hello'
  });
async function testApiConnection() {
  try {
    const response = await aiService.sendRequest('Hello');
    process.stdout.write('\x1b[32m[SUCCESS]\x1b[0m API测试成功: ' + JSON.stringify(response) + '\n');
  } catch (error) {
    process.stdout.write('\x1b[31m[ERROR]\x1b[0m API测试失败: ' + error + '\n');
    
    // 添加延时重试逻辑
    const retryDelay = 3000; // 3秒延时
    process.stdout.write('\x1b[33m[RETRY]\x1b[0m 等待 ' + retryDelay/1000 + ' 秒后重试...\n');
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
      const retryResponse = await aiService.sendRequest('Hello');
      process.stdout.write('\x1b[32m[SUCCESS]\x1b[0m 重试成功: ' + JSON.stringify(retryResponse) + '\n');
    } catch (retryError) {
      process.stdout.write('\x1b[31m[ERROR]\x1b[0m 重试失败: ' + retryError + '\n');
    }
  }
}

testApiConnection(); 