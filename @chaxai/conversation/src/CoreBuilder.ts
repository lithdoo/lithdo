import { IMessage, IChaxConversation, IChaxConversationManager, IChaxHistroyService, IChaxMessageInfo, IChaxStreamChunk, IChaxConversationManagerBuilder } from "@chaxai/core";
import { v4 as uuidv4 } from 'uuid';

export interface IChaxMessageProcessor {
    onChat(
        history: IMessage[],
        sendChunk: (chunk: IChaxStreamChunk) => void
    ): void
}

export class CoreConversationManager implements IChaxConversationManager {


    constructor(
        private core: IChaxMessageProcessor,
        private history: IChaxHistroyService,
    ) {}


    async onCreateConversation(message: string): Promise<IChaxConversation> {
        if (!message || message.trim().length === 0) {
            throw new Error('Message cannot be empty');
        }

        const conversationId = uuidv4();
        const conversation: IChaxConversation = {
            conversationId,
            createTimestamp: Date.now(),
            updateTimestamp: Date.now(),
            title: message.slice(0, 50),
        };

        return conversation;
    }
    async onContinueConversation(conversationId: string, onChunk: (chunk: IChaxStreamChunk) => void) {

        let messages: IChaxMessageInfo[];

        try {
            messages = await this.history.onFetchChatMessages(conversationId);
        } catch (error) {
            onChunk({
                type: 'error',
                content: error instanceof Error ? error.message : 'Failed to fetch conversation history'
            });
            return;
        }


        const conversationMessages: IMessage[] = await Promise.all(
            messages
                .filter((msg: IChaxMessageInfo) => msg.visiableInClient)
                .map(async (msg: IChaxMessageInfo) => {
                    let content: string;
                    try {
                        const result = await this.history.onFetchContentMessage(msg.msgId);
                        content = result.content ? result.content : `生成失败: ${result.error || 'Unknown error'}`;
                    } catch (error) {
                        content = `生成失败: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                    return {
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content,
                    };
                })
        );
        this.core.onChat(
            conversationMessages,
            onChunk
        );
    }

}

export class CoreBuilder implements IChaxConversationManagerBuilder {
    constructor(private core: IChaxMessageProcessor) {}
    
    build(history: IChaxHistroyService): IChaxConversationManager {
        return new CoreConversationManager(this.core, history);
    }
}
