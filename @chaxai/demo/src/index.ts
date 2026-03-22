import Koa from 'koa';
import { IChaxStreamChunk, IMessage } from '@chaxai/core';
import { ChaxFSDBServiceBuilder } from '@chaxai/fsdb';
import {IChaxMessageProcessor} from '@chaxai/conversation'

/**
 * 简单的消息处理器实现
 * 模拟 AI 响应，实际项目中可以替换为真实的 AI 服务
 */
class SimpleMessageProcessor implements IChaxMessageProcessor {
    onChat(history: IMessage[], sendChunk: (chunk: IChaxStreamChunk) => void): void {
        // 模拟 AI 思考和响应过程
        setTimeout(() => {
            sendChunk({ type: 'init', content: '' });
            
            // 模拟流式响应
            const response = "这是一个模拟的 AI 响应。我是一个简单的聊天机器人，由 ChaxAI 框架提供支持。";
            let index = 0;
            const interval = setInterval(() => {
                const chunk = response.slice(index, index + 10);
                if (chunk) {
                    sendChunk({ type: 'chunk', content: chunk });
                    index += 10;
                } else {
                    clearInterval(interval);
                    sendChunk({ type: 'done', content: response });
                }
            }, 200);
        }, 500);
    }
}

// 创建消息处理器实例
const messageProcessor = new SimpleMessageProcessor();

// 使用 ChaxFSDBServiceBuilder 构建 Koa 中间件
const middleware = new ChaxFSDBServiceBuilder()
    .withMessageProcessor(messageProcessor)
    .withDirectoryPath('./demo-data')
    .buildMiddleWare();

// 创建 Koa 应用
const app = new Koa();

// 添加 ChaxAI 中间件
app.use(middleware.createMiddleware());

// 启动服务器
const port = 3000;
app.listen(port, () => {
    console.log(`ChaxAI demo server running on http://localhost:${port}`);
    console.log('API endpoints:');
    console.log('  GET  /ai/record/list - 获取会话列表');
    console.log('  GET  /ai/message/list/{conversationId} - 获取会话消息');
    console.log('  POST /ai/chat - 发送消息');
    console.log('  GET  /ai/message/content/{msgId} - 获取消息内容');
    console.log('  GET  /ai/message/stream/{msgId} - 流式获取消息');
});
