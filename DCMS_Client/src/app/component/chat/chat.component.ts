import {Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import { NgForm } from "@angular/forms";
import { WebsocketService } from "../../service/Chat/websocket.service";
import { ResponseHandler } from "../utils/libs/ResponseHandler";
import { ReceptionistWaitingRoomService } from "../../service/ReceptionistService/receptionist-waitingroom.service";
import * as moment from "moment/moment";
import { Location } from '@angular/common';
import { CheckRealTimeService } from 'src/app/service/CheckRealTime/CheckRealTime.service';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { DataService } from '../shared/services/DataService.service';
import { PatientService } from 'src/app/service/PatientService/patient.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked{
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
  //POST_WAITTINGROOM: IPostWaitingRoom;
  constructor(private webSocketService: WebsocketService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private location: Location,
    private dataService: DataService,
    private patientService: PatientService) {
    // this.POST_WAITTINGROOM = {
    //   epoch: Math.floor(this.currentDateTimeGMT7.valueOf() / 1000).toString(),
    //   produce_id: '',
    //   produce_name: '',
    //   patient_id: "P-000157",
    //   patient_name: '',
    //   reason: '',
    //   status: "1",
    //   appointment_id: '',
    //   appointment_epoch: '',
    //   patient_created_date: '',
    // } as IPostWaitingRoom
  }

  ngAfterViewChecked(): void {
        this.scrollToBottom();
    }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
  filteredWaitingRoomData = [] as IPostWaitingRoom[];
  searchPatientsList: any[] = [];
  analyses = {
    total_appointment: 0,
    total_waiting_room: 0,
    total_patient: 0
  }
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
    this.webSocketService.messageReceived.subscribe((message: any) => {
      const parsedMessage = JSON.parse(message);
      console.log("check content:", parsedMessage.content);
      const check = parsedMessage.content.split(',');
      var checkPa = true;
      if (check[0] == 'CheckRealTimeWaitingRoom@@@') {
        var shouldBreakFor = false;
        let postInfo = check[1].split(' - ');
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
        const currentUrl = this.location.path();

        if (this.POST_WAITTINGROOM.reason == "pa") {
          //alert("vô nha")
          let patientOb = {
            patient_id: this.POST_WAITTINGROOM.epoch,
            patient_name: this.POST_WAITTINGROOM.produce_id,
            date_of_birth: "",
            gender: 1,
            phone_number: this.POST_WAITTINGROOM.produce_name,
            full_medical_history: "",
            dental_medical_history: "",
            email: "",
            address: this.POST_WAITTINGROOM.patient_id,
            description: "",
            profile_image: null,
            active: 1,
            created_date: this.POST_WAITTINGROOM.patient_name
          }
          this.POST_WAITTINGROOM.status = "";
          this.searchPatientsList.push(patientOb);
          this.patientService.updateData(this.searchPatientsList);
        }
        if (this.filteredWaitingRoomData.length == 0 && this.POST_WAITTINGROOM.patient_id != "" && this.POST_WAITTINGROOM.patient_name != "" && this.POST_WAITTINGROOM.patient_name != null 
        && this.POST_WAITTINGROOM.patient_name != null && this.POST_WAITTINGROOM.patient_created_date != "" && this.POST_WAITTINGROOM.patient_created_date != null 
        && this.POST_WAITTINGROOM.patient_created_date != undefined) {
          //alert("check add successful trước")
          this.filteredWaitingRoomData.push(this.POST_WAITTINGROOM);
          this.waitingRoomService.updateData(this.filteredWaitingRoomData);
          shouldBreakFor = true;
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
        } else {
          this.filteredWaitingRoomData.forEach((item: any) => {
            if (item.patient_id == check[1]) {
              if (check[2] == "4") {
                const index = this.filteredWaitingRoomData.findIndex(it => it.patient_id == check[1]);
                if (index != -1) {
                  this.filteredWaitingRoomData.splice(index, 1);
                  this.waitingRoomService.updateData(this.filteredWaitingRoomData);
                }
              } else {
                item.status = check[2];
              }
            } else if (shouldBreakFor == false && this.POST_WAITTINGROOM.patient_id != "" && this.POST_WAITTINGROOM.patient_name != null 
            && this.POST_WAITTINGROOM.patient_name != null && this.POST_WAITTINGROOM.produce_id != "" && this.POST_WAITTINGROOM.patient_created_date != "" && this.POST_WAITTINGROOM.patient_created_date != null 
            && this.POST_WAITTINGROOM.patient_created_date != undefined) {
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
              localStorage.setItem("ListPatientWaiting", JSON.stringify(this.filteredWaitingRoomData));
              shouldBreakFor = true;
            }
          })
        }
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        if (this.filteredWaitingRoomData.length > 0) {
          this.filteredWaitingRoomData.sort((a: any, b: any) => {
            const orderA = statusOrder[a.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
            const orderB = statusOrder[b.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
            return orderA - orderB;
          });
          this.waitingRoomService.updateData(this.filteredWaitingRoomData);
        } else {
          this.waitingRoomService.updateData(this.filteredWaitingRoomData);
        }
        // }
      } else if (check[0] == 'UpdateAnalysesTotal@@@') {
        if (check[1] == 'plus') {
          if (check[2] == 'wtr') {
            this.dataService.UpdateWaitingRoomTotal(1, 0);
          } else if (check[2] == 'app') {
            this.dataService.UpdateAppointmentTotal(1, 0);
          } else if (check[2] == 'pat') {
            this.dataService.UpdatePatientTotal(1, 0);
          } else if (check[2] == 'wtr1') {
            this.dataService.UpdatePatientExaminate(1, 0);
          } else if (check[2] == 'wtr2') {
            var total = localStorage.getItem('patient_examinated');
            var final = 0;
            if (total != null) {
              var a = JSON.parse(total);
              final = parseInt(a.total);
            }
            this.dataService.UpdatePatientExaminated(final, 0);
          }
        }
        else if (check[1] == 'minus') {
          if (check[2] == 'wtr') {
            this.dataService.UpdateWaitingRoomTotal(0, 0);
          } else if (check[2] == 'app') {
            this.dataService.UpdateAppointmentTotal(0, 0);
          } else if (check[2] == 'pat') {
            this.dataService.UpdatePatientTotal(0, 0);
          } else if (check[2] == 'wtr1') {
            this.dataService.UpdatePatientExaminate(0, 0);
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
