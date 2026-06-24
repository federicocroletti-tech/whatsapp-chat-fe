import { Routes } from '@angular/router';
import { ChatPage } from './features/chat/pages/chat-page/chat-page';

export const routes: Routes = [
  {
    path: '',
    component: ChatPage,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
