import dotenv from 'dotenv';
import { Config } from './types';

dotenv.config();

export const loadConfig = (options: Partial<Config>): Config => {
  return {
    directory: options.directory || process.env.DEFAULT_DIRECTORY || './messages',
    model: options.model || process.env.AI_MODEL || 'gpt-3.5-turbo',
    apiKey: options.apiKey || process.env.AI_API_KEY || '',
    apiBaseUrl: options.apiBaseUrl || process.env.AI_API_BASE_URL || 'https://api.openai.com/v1',
    format: options.format || 'text'
  };
};
