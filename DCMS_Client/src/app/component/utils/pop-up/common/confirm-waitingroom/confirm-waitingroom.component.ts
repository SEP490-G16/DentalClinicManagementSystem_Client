import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from 'ngx-toastr';
import { WebsocketService } from 'src/app/service/Chat/websocket.service';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';

@Component({
  selector: 'app-confirm-waitingroom',
  templateUrl: './confirm-waitingroom.component.html',
  styleUrls: ['./confirm-waitingroom.component.css']
})
export class ConfirmWaitingroomComponent implements OnInit {
  @Input() message!: string;
  @Input() content:any;
  messageContent: string = '';
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }
  constructor(public modal: NgbActiveModal, 
    private waitingRoomService: ReceptionistWaitingRoomService,
    private webSocketService: WebsocketService,
    private toastr: ToastrService) { }

  ngOnInit(): void {

  }

  UpdateStatusPatient() {
    console.log("check content: ", this.content);
    this.waitingRoomService.putWaitingRoom(this.content)
        .subscribe(data => {
          //this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
          this.showSuccessToast('Chỉnh sửa hàng chờ thành công');
          //this.getWaitingRoomData();
          this.messageContent = `CheckRealTimeWaitingRoom@@@,${this.content.patient_id},${parseInt(this.content.status_value)}`;
          this.messageBody = {
            action: '',
            message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
          }
          if (this.messageContent.trim() !== '' && sessionStorage.getItem('sub-id') != null && sessionStorage.getItem('username') != null) {
            this.messageBody = {
              action: "sendMessage",
              message: `{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
            };
            this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
          }
        })
    this.modal.close(true)
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, 
    });
  }
}
