import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WebsocketService } from "../../service/Chat/websocket.service";
import { ResponseHandler } from "../utils/libs/ResponseHandler";
import { ReceptionistWaitingRoomService } from "../../service/ReceptionistService/receptionist-waitingroom.service";
import * as moment from "moment/moment";
import { JsonPipe, Location } from '@angular/common';
import { CheckRealTimeService } from 'src/app/service/CheckRealTime/CheckRealTime.service';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { DataService } from '../shared/services/DataService.service';
import { PatientService } from 'src/app/service/PatientService/patient.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
  messageContent: string = '';
  receivedMessages: any[] = [];
  messageSound = new Audio('assets/Messenger_Facebook.mp3');
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }
  POST_WAITTINGROOM = {
    epoch: '',
    produce_id: '',
    produce_name: '',
    patient_id: '',
    patient_name: '',
    reason: '',
    status: "1",
    appointment_id: '',
    appointment_epoch: '',
    date: '',
    patient_created_date: '',
  }
  isHovered = true;
  unreadMessagesCount = 0;
  msg: any;
  constructor(private webSocketService: WebsocketService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private location: Location,
    private dataService: DataService,
    private patientService: PatientService) {
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
  filteredWaitingRoomData = [] as IPostWaitingRoom[];
  searchPatientsList: any[] = [];
  analyses = {
    total_appointment: 0,
    total_waiting_room: 0,
    total_patient: 0
  }
  check: any[] = [];
  //CheckRealTimeWaiting: any[] = [];
  ngOnInit(): void {
    this.waitingRoomService.data$.subscribe((dataList) => {
      this.filteredWaitingRoomData = dataList;
    })

    this.patientService.data$.subscribe((dataList) => {
      this.searchPatientsList = dataList;
    })


    this.dataService.dataAn$.subscribe((data) => {
      this.analyses = data;
    })

    this.webSocketService.connect();
    var count = 0;
    this.webSocketService.messageReceived.subscribe((message: any) => {
      console.log("check msg: ", this.msg)
      if (count == 0 && this.msg != message) {
        count++;
        this.msg = message == undefined ? '' : message;
        const parsedMessage = JSON.parse(message);
        console.log("check content:", parsedMessage.content);
        if (parsedMessage.content != undefined) {
            this.check = parsedMessage.content.split(',');
        } else {
          console.log("vô nha");
          let ob = localStorage.getItem('ob');
          console.log("check ob đc truyền", ob)
          if (ob != null) {
            
            this.check = ob.split(',');
            console.log("split check: ", this.check)
          }
          localStorage.removeItem('ob');
        }
        
        if (this.check[0] == 'CheckRealTimeWaitingRoom@@@') {
          var shouldBreakFor = false;
          let postInfo;
          if (this.check[1] != undefined && this.check[1] != '') {
            postInfo = this.check[1].split(' - ');
          } 
          // else {
          //   let ob = localStorage.getItem('ob');
          //   if (ob != null) {
          //     postInfo = ob.split(' - ');
          //   }
          //   localStorage.removeItem('ob');
          // }
          console.log("check add new patient: ", postInfo);
          this.POST_WAITTINGROOM.epoch = postInfo[0];
          this.POST_WAITTINGROOM.produce_id = postInfo[1];
          this.POST_WAITTINGROOM.produce_name = postInfo[2];
          this.POST_WAITTINGROOM.patient_id = postInfo[3];
          this.POST_WAITTINGROOM.patient_name = postInfo[4];
          this.POST_WAITTINGROOM.reason = postInfo[5];
          this.POST_WAITTINGROOM.status = postInfo[6];
          this.POST_WAITTINGROOM.appointment_id = postInfo[7];
          this.POST_WAITTINGROOM.appointment_epoch = postInfo[8];
          this.POST_WAITTINGROOM.patient_created_date = postInfo[9];
          this.POST_WAITTINGROOM.date = this.timestampToTime(postInfo[0]);

          if (this.POST_WAITTINGROOM.epoch == 'notification') {
            console.log('Check notification');
            this.POST_WAITTINGROOM.epoch = '';
            var pa;
            if (this.check[2] != null && this.check[2] != undefined) {
              const pa = this.check[2].split(' - ');
              let notification = {
                status: '2',
                content: {
                  epoch: pa[0],
                  produce_id: pa[1],
                  produce_name: pa[2],
                  patient_id: pa[3],
                  patient_name: pa[4],
                  reason: pa[5],
                  patient_created_date: pa[6],
                  status_value: '2',
                  appointment_id: pa[8],
                  appointment_epoch: pa[9],
                  fk: pa[10],
                  sk: pa[11]
                }
              }
              console.log("check noti:", notification);
              localStorage.removeItem('pawtr');
              this.waitingRoomService.updateAnalysesData(notification);
            } else {
              var result = localStorage.getItem('pawtr');
              if (result != null) {
                pa = JSON.parse(result);
                let notification = {
                  status: '2',
                  content: {
                    epoch: pa.epoch,
                    produce_id: pa.produce_id,
                    produce_name: pa.produce_name,
                    patient_id: pa.patient_id,
                    patient_name: pa.patient_name,
                    reason: pa.reason,
                    patient_created_date: pa.patient_created_date,
                    status_value: '2',
                    appointment_id: pa.appointment_id,
                    appointment_epoch: pa.appointment_epoch,
                  }
                }
                console.log("check noti:", notification);
                localStorage.removeItem('pawtr');
                this.waitingRoomService.updateAnalysesData(notification);
              }
            }
          }
          var noLoop = false;
          this.filteredWaitingRoomData.forEach((item: any) => {
            if (item.patient_id == this.check[1]) {
              if (this.check[2] == "4") {
                const index = this.filteredWaitingRoomData.findIndex(it => it.patient_id == this.check[1]);
                if (index != -1) {
                  console.log("delete patient wait");
                  this.filteredWaitingRoomData.splice(index, 1);
                  this.dataService.UpdateWaitingRoomTotal(0, 0);
                  this.dataService.UpdatePatientExaminate(0, 0);
                  //this.waitingRoomService.updateData(this.filteredWaitingRoomData);
                }
              } else {
                item.status = this.check[2];
                if (item.status == "2") {
                  this.dataService.UpdateWaitingRoomTotal(0, 0);
                  console.log("check log");
                  this.dataService.UpdatePatientExaminate(1, 0);
                } else if (item.status == "3") {
                  this.dataService.UpdatePatientExaminate(0, 0);
                  this.dataService.UpdatePatientExaminated(1, 0);
                }
              }
            } else {
              if (noLoop == false && this.POST_WAITTINGROOM.patient_id != "" && this.POST_WAITTINGROOM.patient_name != null
                && this.POST_WAITTINGROOM.patient_name != undefined) {
                console.log("add patient1");
                this.dataService.UpdateWaitingRoomTotal(1, 0);
                this.filteredWaitingRoomData.push(this.POST_WAITTINGROOM);
                this.POST_WAITTINGROOM = {
                  epoch: '',
                  produce_id: '',
                  produce_name: '',
                  patient_id: '',
                  patient_name: '',
                  reason: '',
                  status: "1",
                  appointment_id: '',
                  appointment_epoch: '',
                  date: '',
                  patient_created_date: '',
                }
                //this.waitingRoomService.updateData(this.filteredWaitingRoomData);
                noLoop = true;
                return;
              }
            }
          })
          if (noLoop == false && this.filteredWaitingRoomData.length == 0 && this.POST_WAITTINGROOM.patient_id != "" && this.POST_WAITTINGROOM.patient_name != null
            && this.POST_WAITTINGROOM.patient_name != undefined) {
            console.log("addpatient 2");
            this.dataService.UpdateWaitingRoomTotal(1, 0);
            this.filteredWaitingRoomData.push(this.POST_WAITTINGROOM);
            this.POST_WAITTINGROOM = {
              epoch: '',
              produce_id: '',
              produce_name: '',
              patient_id: '',
              patient_name: '',
              reason: '',
              status: "1",
              appointment_id: '',
              appointment_epoch: '',
              date: '',
              patient_created_date: '',
            }
            noLoop = true;
            return;
          }
          const statusOrder: { [key: number]: number } = { 2: 1, 1: 2, 3: 3, 4: 4 };
          //{ 2: 1, 3: 2, 1: 3, 4: 4 };
          if (this.filteredWaitingRoomData.length >= 0) {
            this.filteredWaitingRoomData.sort((a: any, b: any) => {
              const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
              const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
              return orderA - orderB;
            });
            this.waitingRoomService.updateData(this.filteredWaitingRoomData);
          }
        } else if (this.check[0] == 'UpdateAnalysesTotal@@@') {
          if (this.check[1] == 'plus') {
            if (this.check[2] == 'app') {
              this.dataService.UpdateAppointmentTotal(1, 0);
            }
          }
          else if (this.check[1] == 'minus') {
            if (this.check[2] == 'app') {
              this.dataService.UpdateAppointmentTotal(0, 0);
            }
          }
        } else {
          this.receivedMessages.push({ message: parsedMessage, timestamp: new Date() });
          if (!this.chatContainerVisible) {
            this.unreadMessagesCount++;
          }
          this.playMessageSound();
          setTimeout(() => this.scrollToBottom(), 100);
        }
      }
      count = 0; 
    })
  }
  ngAfterViewInit() {
  }
  ngOnDestroy() {
    this.close();
  }
  chatContainerVisible = false;

  sendMessage() {
    if (this.messageContent.trim() !== '' && sessionStorage.getItem('sub-id') != null && sessionStorage.getItem('username') != null) {
      this.messageBody = {
        action: "sendMessage",
        message: `{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
      };

      this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
      this.messageContent = '';
    }
  }
  close() {
    this.webSocketService.closeConnection();
    this.chatContainerVisible = false;
  }

  isSentMessage(subId: string): boolean {

    return subId === sessionStorage.getItem('sub-id');
  }
  connectWebSocket() {
    this.unreadMessagesCount = 0;
    this.chatContainerVisible = true;
  }
  playMessageSound() {
    this.messageSound.play().catch(error => console.error('Error playing sound:', error));
  }
  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }
}
