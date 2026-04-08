import { getCliOptions } from './cli';
import { loadConfig } from './config';
import { scanDirectory, readFiles } from './file-handler';
import { callAI, callAIStream } from './ai-client';

async function main() {
  try {
    const cliOptions = getCliOptions();
    const config = loadConfig(cliOptions);

    if (!config.apiKey) {
      console.error('Error: AI API key is required');
      process.exit(1);
    }

    console.log(`Scanning directory: ${config.directory}`);
    const files = scanDirectory(config.directory);
    
    if (files.length === 0) {
      console.error('Error: No files found matching the pattern [{idx}]{role}.md');
      process.exit(1);
    }

    console.log(`Found ${files.length} files. Reading content...`);
    const messages = readFiles(files);

    console.log(`Calling AI API with ${messages.length} messages...`);
    if (config.format === 'json') {
      const response = await callAI(
        config.apiKey,
        config.apiBaseUrl,
        config.model,
        messages
      );
      console.log(JSON.stringify({ response }, null, 2));
    } else {
      console.log('\nAI Response:');
      console.log('=' .repeat(50));
      const response = await callAIStream(
        config.apiKey,
        config.apiBaseUrl,
        config.model,
        messages,
        (chunk) => process.stdout.write(chunk)
      );
      if (!response) {
        console.log('(empty response)');
      } else {
        console.log('');
      }
      console.log('=' .repeat(50));
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
