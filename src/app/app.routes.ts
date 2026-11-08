import { Routes } from '@angular/router';
import { ChatPage } from './features/chat/pages/chat-page/chat-page';
import { OperatorPage } from './features/operator/pages/operator-page/operator-page';

export const routes: Routes = [
  {
    path: 'operator',
    component: OperatorPage,
  },
  {
    path: '',
    component: ChatPage,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
