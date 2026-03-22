// 简单的测试脚本，用于验证 ChaxAI 框架的基本功能

console.log('Starting ChaxAI demo...');

// 测试导入
console.log('Testing imports...');
try {
  const { IChaxMessageProcessor, IChaxStreamChunk, IMessage } = require('@chaxai/core');
  const { ChaxFSDBServiceBuilder } = require('@chaxai/fsdb');
  const Koa = require('koa');
  
  console.log('Imports successful!');
  
  // 测试消息处理器
  console.log('Testing message processor...');
  class SimpleMessageProcessor {
    onChat(history, sendChunk) {
      console.log('onChat called with', history.length, 'messages');
      sendChunk({ type: 'init', content: '' });
      sendChunk({ type: 'chunk', content: 'Hello, world!' });
      sendChunk({ type: 'done', content: 'Hello, world!' });
    }
  }
  
  console.log('Message processor created!');
  
  // 测试构建器
  console.log('Testing FSDBServiceBuilder...');
  const messageProcessor = new SimpleMessageProcessor();
  const builder = new ChaxFSDBServiceBuilder();
  builder.withMessageProcessor(messageProcessor);
  builder.withDirectoryPath('./demo-data');
  
  console.log('Builder configured!');
  
  // 测试构建服务
  console.log('Testing service build...');
  const service = builder.build();
  console.log('Service built successfully!');
  
  // 测试构建中间件
  console.log('Testing middleware build...');
  const middleware = builder.buildMiddleWare();
  console.log('Middleware built successfully!');
  
  console.log('All tests passed! ChaxAI framework is working correctly.');
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}
