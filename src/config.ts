import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import yaml from 'yaml';

dotenv.config();

interface PlatformConfig {
  boss: BossConfig;
  lagou: LagouConfig;
  liepin: LiepinConfig;
  zhilian: ZhilianConfig;
  job51: Job51Config;
}

export const loadConfig = (): PlatformConfig => {
  const configFile = readFileSync('./config/default.yaml', 'utf8');
  return yaml.parse(configFile);
};

export const config = {
  openai: {
    apiKey: process.env.API_KEY,
    baseUrl: process.env.BASE_URL,
    model: process.env.MODEL,
  },
  webhook: {
    url: process.env.HOOK_URL,
  },
  selenium: {
    waitTime: 10000,
  }
};
