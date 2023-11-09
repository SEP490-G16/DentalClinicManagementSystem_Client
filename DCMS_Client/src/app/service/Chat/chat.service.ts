import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chatVisible: boolean = false;

  toggleChat() {
    this.chatVisible = !this.chatVisible;
  }
}
