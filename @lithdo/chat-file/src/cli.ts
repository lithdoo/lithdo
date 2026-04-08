import { Command } from 'commander';
import { Config } from './types';

const program = new Command();

program
  .name('chat-file')
  .description('Process markdown files into AI messages and get AI response')
  .version('1.0.0')
  .option('-d, --directory <path>', 'Directory to scan for files')
  .option('-m, --model <model>', 'AI model to use')
  .option('-k, --api-key <key>', 'AI API key')
  .option('-b, --api-base-url <url>', 'AI API base URL')
  .option('-f, --format <format>', 'Output format (text or json)', 'text')
  .option('-i, --input', 'Read user input from terminal and append as next user message')
  .option('-c, --continue', 'Append assistant reply to next message file')
  .parse(process.argv);

export const getCliOptions = (): Partial<Config> => {
  const options = program.opts();
  return {
    directory: options.directory,
    model: options.model,
    apiKey: options.apiKey,
    apiBaseUrl: options.apiBaseUrl,
    format: options.format as 'text' | 'json',
    continueMode: Boolean(options.continue),
    inputMode: Boolean(options.input)
  };
};
