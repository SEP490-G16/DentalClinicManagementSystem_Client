import { WebsocketService } from "src/app/service/Chat/websocket.service";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SendMessageSocket {

    constructor(private webSocketService: WebsocketService) {
        
    }

    messageContent: string = ``;
    messageBody = {
        action: '',
        message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
    }

    //UpdateAnalysesTotal@@@
    sendMessageSocket(content:any, param:any, where:any) {
        this.messageContent = `${content},${param},${where}`;
        this.messageBody = {
            action: '',
            message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
        }
        if (this.messageContent.trim() !== '' && sessionStorage.getItem('sub-id') != null && sessionStorage.getItem('username') != null) {
            this.messageBody = {
                action: "sendMessage",
                message: `{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
            };
            console.log(this.messageBody);
            this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
        }
    }
}