import OpenAI from 'openai';
import { config } from 'dotenv';
import { IAiConfig, IAiFilter } from './ai.types';
import { logger } from '../common/logger';

config();

export class AiService {
  private openai: OpenAI;
  private config: IAiConfig;

  constructor(config: IAiConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.API_KEY,
      baseURL: process.env.BASE_URL
    });
  }

  async checkJobMatch(
    keyword: string,
    jobName: string,
    jobDescription: string
  ): Promise<IAiFilter> {
    const content = this.formatPrompt(keyword, jobName, jobDescription);
    const response = await this.sendRequest(content);
    
    return {
      result: !response.includes('false'),
      message: response
    };
  }

  async sendRequest(content: string): Promise<string> {
    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: process.env.MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.config.introduce },
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const duration = Date.now() - startTime;
      logger.info({
        type: 'AI_REQUEST',
        duration: `${duration}ms`,
        content,
        response: response.choices[0]?.message?.content
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('AI request failed:', error);
      throw error;
    }
  }

  private formatPrompt(keyword: string, jobName: string, jd: string): string {
    return this.config.prompt
      .replace('{keyword}', keyword)
      .replace('{jobName}', jobName)
      .replace('{jd}', jd);
  }
}
