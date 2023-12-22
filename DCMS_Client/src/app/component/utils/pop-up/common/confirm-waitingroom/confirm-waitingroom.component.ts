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
    let a = {
      time_attr: this.content.epoch,
      produce_id: this.content.produce_id,
      produce_name: this.content.produce_name,
      patient_id: this.content.patient_id,
      patient_name: this.content.patient_name,
      is_new: this.content.patient_created_date == '1' ? true : false,
      reason: this.content.reason,
      status_attr: this.content.status_value,
      foreign_sk: this.content.fk,
    }

    this.waitingRoomService.putWaitingRoomNew(this.content.sk, a)
        .subscribe(data => {
          //this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
          this.showSuccessToast('Chỉnh sửa hàng chờ thành công');
          //this.getWaitingRoomData();
          localStorage.setItem("ob", `CheckRealTimeWaitingRoom@@@,${this.content.patient_id},${parseInt(this.content.status_value)}`);
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
