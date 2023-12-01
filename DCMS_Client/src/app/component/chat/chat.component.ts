import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {WebsocketService} from "../../service/Chat/websocket.service";
import {ResponseHandler} from "../utils/libs/ResponseHandler";
import {ReceptionistWaitingRoomService} from "../../service/ReceptionistService/receptionist-waitingroom.service";
import * as moment from "moment/moment";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit,OnDestroy  {

  messageContent:string='';
  receivedMessages:any[]=[];
  messageSound = new Audio('assets/Messenger_Facebook.mp3');
  messageBody={
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }
  isHovered = false;
  unreadMessagesCount = 0;
  constructor(private webSocketService: WebsocketService,
              private waitingRoomService: ReceptionistWaitingRoomService) { }
  ngOnInit(): void {
    this.webSocketService.connect();
    this.webSocketService.messageReceived.subscribe((message:any)=>{
      const parsedMessage = JSON.parse(message);
      console.log("message", parsedMessage.content);
      if (parsedMessage.content == 'CheckRealTime'){
        window.location.reload();
        console.log("Load lại trang")
        this.webSocketService.closeConnection();
      }else {
        this.receivedMessages.push({ message: parsedMessage, timestamp: new Date() });
        if (!this.chatContainerVisible) {
          this.unreadMessagesCount++;
        }
        this.playMessageSound();
        console.log(this.receivedMessages)
      }

    })
  }
  ngOnDestroy() {
    // Lifecycle hook này được gọi khi component sắp bị hủy
    this.close();
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
  setHover(value: boolean) {
    this.isHovered = value;
  }
  isSentMessage(subId: string): boolean {
    console.log(subId)
    return subId === sessionStorage.getItem('sub-id');
    console.log(subId);
  }
  connectWebSocket() {
    this.unreadMessagesCount = 0;
    this.chatContainerVisible = true;
  }
  playMessageSound() {
    this.messageSound.play().catch(error => console.error('Error playing sound:', error));
  }
}
