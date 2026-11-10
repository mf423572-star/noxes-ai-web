export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: {
    data: string;
    mimeType: string;
  };
  generatedImage?: {
    url: string;
    title?: string;
  };
  audioUrl?: string;
  type?: 'text' | 'voice';
  duration?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
