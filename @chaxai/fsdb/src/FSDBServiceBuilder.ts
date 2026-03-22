import { IChaxMessageProcessor, CoreConversationManager } from "@chaxai/conversation";
import { ChaxFSDBService } from "./FSDBService";
import { ChaxKoaMiddleWare } from "@chaxai/koa";

/**
 * ChaxFSDBServiceBuilder - 链式构建器，用于配置和创建 ChaxFSDBService 实例
 * 
 * 提供链式调用接口，方便配置：
 * - IChaxMessageProcessor：消息处理器
 * - dirPath：存储目录路径
 * 
 * 使用示例：
 * ```typescript
 * // 构建 FSDB 服务
 * const fsdbService = new ChaxFSDBServiceBuilder()
 *   .withMessageProcessor(myProcessor)
 *   .withDirectoryPath('./custom/storage')
 *   .build();
 * 
 * // 直接构建 Koa 中间件
 * const middleware = new ChaxFSDBServiceBuilder()
 *   .withMessageProcessor(myProcessor)
 *   .withDirectoryPath('./custom/storage')
 *   .buildMiddleWare();
 * ```
 */
export class ChaxFSDBServiceBuilder {
    private messageProcessor: IChaxMessageProcessor | null = null;
    private directoryPath?: string;

    /**
     * 配置消息处理器
     * @param processor IChaxMessageProcessor 实例
     * @returns 构建器实例，支持链式调用
     */
    withMessageProcessor(processor: IChaxMessageProcessor): ChaxFSDBServiceBuilder {
        this.messageProcessor = processor;
        return this;
    }

    /**
     * 配置存储目录路径
     * @param path 目录路径
     * @returns 构建器实例，支持链式调用
     */
    withDirectoryPath(path: string): ChaxFSDBServiceBuilder {
        this.directoryPath = path;
        return this;
    }

    /**
     * 构建 ChaxFSDBService 实例
     * @returns 配置好的 ChaxFSDBService 实例
     * @throws 如果没有配置消息处理器
     */
    build() {
        if (!this.messageProcessor) {
            throw new Error('Message processor is required');
        }

        return ChaxFSDBService.build(
            {
                build: (history) => {
                    return new CoreConversationManager(this.messageProcessor!, history);
                }
            },
            this.directoryPath
        );
    }

    /**
     * 直接构建 Koa 中间件
     * @returns 配置好的 ChaxKoaMiddleWare 实例
     * @throws 如果没有配置消息处理器
     */
    buildMiddleWare() {
        const service = this.build();
        return new ChaxKoaMiddleWare(service);
    }
}
