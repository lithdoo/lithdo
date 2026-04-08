import fs from 'fs';
import path from 'path';
import { getCliOptions } from './cli';
import { loadConfig } from './config';
import { scanDirectory, readFiles } from './file-handler';
import { callAI, callAIStream } from './ai-client';

const writeOutputIfConfigured = (outputPath: string | undefined, content: string) => {
  if (!outputPath) {
    return;
  }

  const resolvedPath = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, content, 'utf8');
  return resolvedPath;
};

async function main() {
  try {
    const cliOptions = getCliOptions();
    const config = loadConfig(cliOptions);

    if (!config.apiKey) {
      console.error('Error: AI API key is required');
      process.exit(1);
    }

    const files = scanDirectory(config.directory);
    
    if (files.length === 0) {
      console.error('Error: No files found matching the pattern [{idx}]{role}.md or [{idx}]{role}.json');
      process.exit(1);
    }

    const messages = readFiles(files);
    const quiet = config.quiet;

    if (config.format === 'json') {
      const response = await callAI(
        config.apiKey,
        config.apiBaseUrl,
        config.model,
        messages
      );
      writeOutputIfConfigured(config.output, response);
      if (!quiet) {
        process.stdout.write(`${JSON.stringify({ response }, null, 2)}\n`);
      }
    } else {
      const response = await callAIStream(
        config.apiKey,
        config.apiBaseUrl,
        config.model,
        messages,
        (chunk) => {
          if (!quiet) {
            process.stdout.write(chunk);
          }
        }
      );
      writeOutputIfConfigured(config.output, response);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
