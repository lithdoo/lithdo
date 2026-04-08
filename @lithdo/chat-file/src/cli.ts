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
  .option('-o, --output <path>', 'Output file path for AI response')
  .option('-q, --quiet', 'Disable normal stdout logs and response output')
  .option('-f, --format <format>', 'Output format (text or json)', 'text')
  .parse(process.argv);

export const getCliOptions = (): Partial<Config> => {
  const options = program.opts();
  return {
    directory: options.directory,
    model: options.model,
    apiKey: options.apiKey,
    apiBaseUrl: options.apiBaseUrl,
    output: options.output,
    // Do not coerce with Boolean(): undefined must reach loadConfig so QUIET env applies.
    quiet: options.quiet as boolean | undefined,
    format: options.format as 'text' | 'json'
  };
};
