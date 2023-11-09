import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/service/Chat/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private chatService: ChatService) { }
  chatContainerVisible = false;
  ngOnInit(): void {
  }

  openChatWindow(){

  }

  closeChatWindow() {

  }
}
