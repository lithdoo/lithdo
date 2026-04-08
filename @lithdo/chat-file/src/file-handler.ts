import fs from 'fs';
import path from 'path';
import { FileInfo, Message } from './types';

const FILE_PATTERN = /^\[(\d+)\](.+?)\.md$/;

export const scanDirectory = (directory: string): FileInfo[] => {
  const files: FileInfo[] = [];
  
  const traverse = (currentPath: string) => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const match = entry.name.match(FILE_PATTERN);
        if (match) {
          files.push({
            path: fullPath,
            idx: parseInt(match[1], 10),
            role: match[2]
          });
        }
      }
    }
  };
  
  traverse(directory);
  return files.sort((a, b) => a.idx - b.idx);
};

export const readFiles = (files: FileInfo[]): Message[] => {
  return files.map(file => {
    const content = fs.readFileSync(file.path, 'utf8');
    return {
      role: file.role,
      content
    };
  });
};

export const appendAssistantMessage = (
  directory: string,
  files: FileInfo[],
  content: string
): string => {
  return appendMessage(directory, files, 'assistant', content);
};

export const appendUserMessage = (
  directory: string,
  files: FileInfo[],
  content: string
): string => {
  return appendMessage(directory, files, 'user', content);
};

const appendMessage = (
  directory: string,
  files: FileInfo[],
  role: string,
  content: string
): string => {
  const maxIdx = files.reduce((max, file) => Math.max(max, file.idx), -1);
  let nextIdx = maxIdx + 1;
  let filePath = path.join(directory, `[${nextIdx}]${role}.md`);

  while (fs.existsSync(filePath)) {
    nextIdx += 1;
    filePath = path.join(directory, `[${nextIdx}]${role}.md`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
};
