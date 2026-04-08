#!/usr/bin/env node
import readline from 'readline';
import { getCliOptions } from './cli';
import { loadConfig } from './config';
import { appendAssistantMessage, appendUserMessage, readFiles, scanDirectory } from './file-handler';
import { callAI, callAIStream } from './ai-client';

const readUserInputFromTerminal = async (): Promise<string> => {
  console.log('Enter user message. Finish with Ctrl+Z then Enter (Windows), or Ctrl+D (macOS/Linux).');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const lines: string[] = [];
  for await (const line of rl) {
    lines.push(line);
  }

  rl.close();
  return lines.join('\n').trim();
};

async function main() {
  try {
    const cliOptions = getCliOptions();
    const config = loadConfig(cliOptions);

    if (!config.apiKey) {
      console.error('Error: AI API key is required');
      process.exit(1);
    }

    console.log(`Scanning directory: ${config.directory}`);
    let files = scanDirectory(config.directory);

    if (config.inputMode) {
      const userContent = await readUserInputFromTerminal();
      if (!userContent) {
        console.error('Error: Empty input. Nothing was written.');
        process.exit(1);
      }

      const userFilePath = appendUserMessage(config.directory, files, userContent);
      console.log(`Saved user message: ${userFilePath}`);
      files = scanDirectory(config.directory);
    }

    if (files.length === 0) {
      console.error('Error: No files found matching the pattern [{idx}]{role}.md');
      process.exit(1);
    }

    console.log(`Found ${files.length} files. Reading content...`);
    const messages = readFiles(files);

    console.log(`Calling AI API with ${messages.length} messages...`);
    let response = '';
    if (config.format === 'json') {
      response = await callAI(
        config.apiKey,
        config.apiBaseUrl,
        config.model,
        messages
      );
      console.log(JSON.stringify({ response }, null, 2));
    } else {
      console.log('\nAI Response:');
      console.log('=' .repeat(50));
      response = await callAIStream(
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

    if (config.continueMode) {
      const savedPath = appendAssistantMessage(config.directory, files, response);
      console.log(`Saved assistant reply: ${savedPath}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
