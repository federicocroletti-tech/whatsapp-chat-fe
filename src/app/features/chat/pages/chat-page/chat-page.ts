import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ChatFacade } from '../../state/chat-facade';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.scss',
})
export class ChatPage {
  message = '';

  constructor(public chatFacade: ChatFacade) {}

  send(): void {
    const text = this.message.trim();

    if (!text || this.chatFacade.loading()) {
      return;
    }

    this.chatFacade.sendMessage(text);
    this.message = '';
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.send();
  }

  clear(): void {
    this.chatFacade.clear();
  }
}
