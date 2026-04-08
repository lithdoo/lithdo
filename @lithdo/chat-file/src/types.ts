export interface Message {
  role: string;
  content: string;
}

export interface FileInfo {
  path: string;
  idx: number;
  role: string;
}

export interface Config {
  directory: string;
  model: string;
  apiKey: string;
  apiBaseUrl: string;
  format: 'text' | 'json';
}
