import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WebsocketService } from "../../service/Chat/websocket.service";
import { ResponseHandler } from "../utils/libs/ResponseHandler";
import { ReceptionistWaitingRoomService } from "../../service/ReceptionistService/receptionist-waitingroom.service";
import * as moment from "moment/moment";
import { Location } from '@angular/common';
import { CheckRealTimeService } from 'src/app/service/CheckRealTime/CheckRealTime.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  messageContent: string = '';
  receivedMessages: any[] = [];
  messageSound = new Audio('assets/Messenger_Facebook.mp3');
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }
  isHovered = false;
  unreadMessagesCount = 0;
  constructor(private webSocketService: WebsocketService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private location: Location,
    private checkRealTime: CheckRealTimeService) { }
  filteredWaitingRoomData: any[] = [];
  //CheckRealTimeWaiting: any[] = [];
  ngOnInit(): void {
    this.waitingRoomService.data$.subscribe((dataList) => {
      this.filteredWaitingRoomData = dataList;
    })
    this.webSocketService.connect();
    this.webSocketService.messageReceived.subscribe((message: any) => {
      const parsedMessage = JSON.parse(message);
      const check = parsedMessage.content.split(',');
      console.log("Check messageContent", parsedMessage.content);
      var checkPa = true;
      if (check[0] == 'CheckRealTimeWaitingRoom@@@') {
        const currentUrl = this.location.path();
        if (currentUrl.includes('phong-cho')) {
          this.filteredWaitingRoomData.forEach((item: any) => {
            if (item.patient_id == check[1]) {
              if (check[2] == 4 && checkPa) {
                const index = this.filteredWaitingRoomData.findIndex((item: any) => { item.patient_id == check[1] });
                this.filteredWaitingRoomData.splice(index, 1);
                checkPa = false;
              } else {
                item.status = check[2];
              }
            }
          })
          const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
          this.filteredWaitingRoomData.sort((a: any, b: any) => {
            const orderA = statusOrder[a.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
            const orderB = statusOrder[b.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
            return orderA - orderB;
          });
          this.waitingRoomService.updateData(this.filteredWaitingRoomData);
        }
        //this.webSocketService.closeConnection();
      } else {
        this.receivedMessages.push({ message: parsedMessage, timestamp: new Date() });
        if (!this.chatContainerVisible) {
          this.unreadMessagesCount++;
        }
        this.playMessageSound();
        //this.webSocketService.closeConnection();
      }
    })
  }
  ngAfterViewInit() {
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
        message: `{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
      };
      console.log(this.messageBody);
      this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
      this.messageContent = '';
    }
  }
  close() {
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
