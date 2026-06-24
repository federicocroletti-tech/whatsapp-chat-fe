export type ChatMessageRole = 'user' | 'assistant';

export interface ChatSource {
  title: string;
  fileName?: string;
  score?: number;
  url?: string;
}

export type ChatSourceType = 'internal' | 'web' | 'none';

export interface ChatMessage {
  role: ChatMessageRole;
  text: string;
  createdAt: Date;
  sourceType?: ChatSourceType;
  sources?: ChatSource[];
}
