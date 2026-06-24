import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatSource, ChatSourceType } from '../../features/chat/models/chat-message.model';

interface ChatResponse {
  reply: string;
  sourceType?: ChatSourceType;
  sources?: ChatSource[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatApi {
  private readonly apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, {
      message,
    });
  }
}
