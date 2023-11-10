import { Injectable } from '@angular/core';
import {error} from "@angular/compiler-cli/src/transformers/util";
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  messageReceived: Subject<string> = new Subject<string>();
  private socket: WebSocket | undefined;

  constructor() { }
  connect():void{
    this.socket = new WebSocket("wss://x2boqaizqc.execute-api.ap-southeast-1.amazonaws.com/demo/");
    this.socket.onopen = ()=>{
      console.log('WebSocket connection established.');
    };
    this.socket.onmessage = (event)=>{

      console.log(event);
      const message = event.data;
      console.log("Received message:",event.data);
      this.messageReceived.next(message);
    };
    this.socket.onclose = (even)=>{
      console.log('WebSocket connection closed:',event);
    };
    this.socket.onerror = (error) =>{
      console.log('WebSocket error:',error);
    }
  }
  sendMessage(message: any):void {
    //const messageBody = JSON.stringify(message);
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
