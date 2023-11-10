import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {WebsocketService} from "../../service/Chat/websocket.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  messageContent:string='';
  receivedMessages:any[]=[];
  messageBody={
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }
  constructor(private webSocketService: WebsocketService) { }
  ngOnInit(): void {
    this.webSocketService.connect();
    this.webSocketService.messageReceived.subscribe((message:any)=>{
      const parsedMessage = JSON.parse(message);
      this.receivedMessages.push({ message: parsedMessage, timestamp: new Date() });
      console.log(this.receivedMessages)
    })
  }
  chatContainerVisible = false;

  sendMessage() {
    if (this.messageContent.trim() !== '' && sessionStorage.getItem('sub-id') != null && sessionStorage.getItem('username') != null) {
      this.messageBody = {
        action: "sendMessage",
        message:`{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
      };
      console.log(this.messageBody);
      this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
      this.messageContent = '';
    }

  }
  close(){
    this.webSocketService.closeConnection();
    this.chatContainerVisible = false;
  }
}
