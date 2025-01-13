export const AI_CONSTANTS = {
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 500,
  TIMEOUT: 30000
};

export const ERROR_MESSAGES = {
  API_ERROR: 'AI API request failed',
  INVALID_RESPONSE: 'Invalid AI response format',
  CONFIG_ERROR: 'AI configuration error',
  RATE_LIMIT: 'Rate limit exceeded'
}; 