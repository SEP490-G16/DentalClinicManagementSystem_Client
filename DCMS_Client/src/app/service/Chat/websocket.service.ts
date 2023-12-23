import { Injectable } from '@angular/core';
import { Observable, Subject} from 'rxjs';
import { io } from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  messageReceived: Subject<string> = new Subject<string>();
  private socket: WebSocket | undefined;
  checkEvent:any;
  constructor() { }
  connect():void{
    this.socket = new WebSocket("wss://x2boqaizqc.execute-api.ap-southeast-1.amazonaws.com/demo/");
    this.socket.onopen = ()=>{
      console.log('WebSocket connection established.');
    };
    this.socket.onmessage = (event)=>{
      console.log("Received message:",event.data);
      console.log("WebsocketService | onmessage | ",event.data)
        this.checkEvent = event.data;
        this.messageReceived.next(event.data);
    };
    this.socket.onclose = (even)=>{
      console.log('WebSocket connection closed:',event);
    };
    this.socket.onerror = (error) =>{
      console.log('WebSocket error:',error);
    }
  }
  sendMessage(message: any):void {
      this.socket?.send(message);
  }
  closeConnection():void{
    this.socket?.close();
  }

  chatVisible: boolean = false;

  toggleChat() {
    this.chatVisible = !this.chatVisible;
  }
}
