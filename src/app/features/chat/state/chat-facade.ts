import { Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ChatApi } from '../../../core/api/chat-api';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatFacade {
  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private chatApi: ChatApi) {}

  sendMessage(text: string): void {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      text: cleanText,
      createdAt: new Date(),
    };

    this.messages.update((currentMessages) => [...currentMessages, userMessage]);

    this.loading.set(true);
    this.error.set(null);

    this.chatApi
      .sendMessage(cleanText)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            text: response.reply,
            createdAt: new Date(),
          };

          this.messages.update((currentMessages) => [...currentMessages, assistantMessage]);
        },
        error: () => {
          this.error.set('Si è verificato un errore durante la risposta del bot.');
        },
      });
  }

  clear(): void {
    this.messages.set([]);
    this.error.set(null);
  }
}
