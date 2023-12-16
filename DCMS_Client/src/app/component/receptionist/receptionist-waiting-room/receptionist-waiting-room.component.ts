import { Component, DoCheck, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';


import { Auth } from 'aws-amplify';
import { CognitoService } from 'src/app/service/cognito.service';
import { Router } from '@angular/router';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { ToastrService } from 'ngx-toastr';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import * as moment from 'moment';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { WebsocketService } from "../../../service/Chat/websocket.service";
import { NullValidationHandler } from 'angular-oauth2-oidc';
import { DataService } from '../../shared/services/DataService.service';
import { SendMessageSocket } from '../../shared/services/SendMessageSocket.service';
import { TimestampFormat } from '../../utils/libs/timestampFormat';
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ConfirmWaitingroomComponent} from "../../utils/pop-up/common/confirm-waitingroom/confirm-waitingroom.component";

@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit {
  waitingRoomData: any;
  loading: boolean = false;
  procedure: string = '0';
  listGroupService: any[] = [];
  listTemp: any[] = [];
  status: string = '1';
  filteredWaitingRoomData: any[] = [];
  listPatientId: any[] = [];
  PUT_WAITINGROOM: IPostWaitingRoom;
  dataStorage: string = '';
  intervalId: any;
  roleId: any;
  notificationSound = new Audio('assets/Notification-13.mp3');
  NEW: string = "new";
  public dataArray: any[] = [];

  constructor(private waitingRoomService: ReceptionistWaitingRoomService,
    private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService, private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private dataService: DataService,
    private sendMessageSocket: SendMessageSocket,
    private modalService: NgbModal
  ) {

    this.PUT_WAITINGROOM = {
      epoch: "0",
      produce_id: "1",
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: "1"
    } as IPostWaitingRoom
  }

  notification = {
    status: '1',
    content: {
      epoch: '',
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      patient_created_date: '',
      status_value: '',
      appointment_id: '',
      appointment_epoch: '',
    }
  }

  ngOnInit(): void {
    let co = sessionStorage.getItem('role');
    if (co != null) {
      this.roleId = co.split(',');
    }
    this.getListGroupService();
    if (this.roleId.includes('2') || this.roleId.includes('4') || this.roleId.includes('5')) {
      this.getWaitingRoomData();
    } else {
      this.getWaitingRoomData();
    }
    this.waitingRoomService.data$.subscribe((dataList) => {
      this.filteredWaitingRoomData = dataList;
    })

    this.waitingRoomService.dataAn$.subscribe((data) => {
      this.notification = data;
      console.log("check update: ", this.notification);
      if (this.notification.status == '2') {
        this.openNotification(this.notification);
      }
    })
  }

  CheckRealTimeWaiting: any[] = [];
  getWaitingRoomData() {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        this.waitingRoomData.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 1: 2, 3: 3, 4: 4 };
        this.waitingRoomData.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
        this.listPatientId = this.waitingRoomData.map((item: any) => item.patient_id);
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.CheckRealTimeWaiting = [...this.waitingRoomData];
        console.log("Check realtime waiting: ", this.CheckRealTimeWaiting)
        this.waitingRoomService.updateData(this.CheckRealTimeWaiting);
        this.dataService.UpdateWaitingRoomTotal(3, this.CheckRealTimeWaiting.length);
        localStorage.setItem("ListPatientWaiting", JSON.stringify(this.CheckRealTimeWaiting));
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
  }
  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }
  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.listGroupService = res.data;
      localStorage.setItem("ListGroupProcedure", JSON.stringify(this.listGroupService));
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url + "/medical-procedure-group", error);
      }
    )
  }
  filterProcedure() {
    if (this.procedure === '0') {
      this.filteredWaitingRoomData = [...this.waitingRoomData];
      this.loading = false;
    } else {
      this.filteredWaitingRoomData = this.waitingRoomData.filter((item: IPostWaitingRoom) => item.produce_id === this.procedure);
      this.loading = false;
    }
  }

  selectedColor: string = '#000';
  PUT_WAITINGROO: any;
  patient_Id: any = "";
  onPutStatus(wtr: any, epoch: number) {
    this.PUT_WAITINGROO = {
      epoch: epoch,
      produce_id: wtr.produce_id,
      produce_name: wtr.produce_name,
      patient_id: wtr.patient_id,
      patient_name: wtr.patient_name,
      reason: wtr.reason,
      patient_created_date: wtr.patient_created_date,
      status_value: Number(wtr.status),
      appointment_id: wtr.appointment_id,
      appointment_epoch: wtr.appointment_epoch,
    }
    this.patient_Id = wtr.patient_id;
    this.loading = true;
    if (this.PUT_WAITINGROO.status_value == 4) {
      this.listTemp = this.filteredWaitingRoomData;
      localStorage.setItem("ListPatientWaiting", JSON.stringify(this.filteredWaitingRoomData));
      localStorage.setItem('listPatientId', JSON.stringify(this.listTemp));
      this.waitingRoomService.deleteWaitingRooms(this.PUT_WAITINGROO)
        .subscribe((data) => {
          this.loading = false;
          this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
          this.showSuccessToast('Xóa hàng chờ thành công');
          this.sendMessageSocket.sendMessageSocket("CheckRealTimeWaitingRoom@@@", `${wtr.patient_id}`, `${Number('4')}`);
          //this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "minus", "wtr1");
          //this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "minus", "wtr");
          this.getWaitingRoomData();
        },
          (error) => {
            this.loading = false;
            ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROO, error);
          }
        )
    } else {
      this.waitingRoomService.putWaitingRoom(this.PUT_WAITINGROO)
        .subscribe(data => {
          if (this.PUT_WAITINGROO.status_value == "2") {
            //this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "plus", "wtr1");
            const storeList = localStorage.getItem('ListPatientWaiting');
            let listWaiting;
            console.log("vô nha");
            if (storeList != null) {
              console.log("check storeList", storeList);
              listWaiting = JSON.parse(storeList);
              console.log("check list after: ", listWaiting)
              if (listWaiting.length > 0) {
                console.log("check patient đang khám");
                if (listWaiting != '' && listWaiting != null && listWaiting != undefined) {
                  listWaiting.forEach((item: any) => {
                    if (item.patient_id == this.PUT_WAITINGROO.patient_id) {
                      let a = {
                        epoch: parseInt(item.epoch),
                        new_epoch: parseInt(item.epoch),
                        appointment: {
                          patient_id: item.patient_id,
                          patient_name: item.patient_name,
                          phone_number: item.phone_number,
                          procedure_id: item.produce_id,
                          procedure_name: item.produce_name,
                          reason: item.reason,
                          doctor: '',
                          status: 3,
                          time: 0,
                          patient_created_date: item.patient_created_date
                        }
                      }
                      item.status = "3";
                      // this.appointmentService.putAppointment(a, this.PUT_WAITINGROO.appointment_id).subscribe((data) => {
                      //   this.showSuccessToast(`${item.patient_name} đang khám`);
                      // })
                    }
                  })
                }
              }
            }
          }

          if (this.PUT_WAITINGROO.status_value == "3") {
            //this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "minus", "wtr1");
            const checkTotal = localStorage.getItem('patient_examinated');
            if (checkTotal != null) {
              var check = JSON.parse(checkTotal);
              check.total = check.total + 1;
              localStorage.setItem("patient_examinated", JSON.stringify({ total: check.total, currentDate: check.currentDate }));
            }
            //this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "plus", "wtr2");

            //Chuyển từ bệnh nhân mới sang cũ
            if (wtr.patient_created_date == "1") {
              this.waitingRoomService.putNewPatientId(wtr.patient_id).subscribe((data) => {
              })
            }

            //Cập nhật lịch hẹn
            // console.log("WTR: ", wtr);
            // let PutAppointment = {
            //   epoch: epoch,
            //   new_epoch: epoch,
            //   appointment: {
            //     patient_id: wtr.patient_id,
            //     patient_name: wtr.patient_name,
            //     phone_number: wtr.phone_number || 0,
            //     procedure_id: wtr.produce_id,
            //     procedure_name: wtr.produce_name,
            //     reason: wtr.reason,
            //     doctor: wtr.doctor || "",
            //     status: 1,
            //     time: TimestampFormat.timeAndDateToTimestamp(wtr.date, TimestampFormat.timestampToGMT7Date(epoch)),
            //     patient_created_date: wtr.patient_created_date
            //   }
            // }
            // console.log("PutAppointment: ", PutAppointment);
            // this.appointmentService.putAppointment(PutAppointment, wtr.patient_id).subscribe((data) => {
            //   console.log("Cập nhật lịch hẹn thành công - Đã khám xong")
            // });

            //Cache
            const storeList = localStorage.getItem('ListPatientWaiting');
            let listWaiting;
            if (storeList != null) {
              listWaiting = JSON.parse(storeList);
              console.log("check list after: ", listWaiting)
              if (listWaiting.length > 0) {
                if (listWaiting != '' && listWaiting != null && listWaiting != undefined) {
                  listWaiting.forEach((item: any) => {
                    if (item.patient_id == this.PUT_WAITINGROO.patient_id) {
                      item.status = "1";
                      // this.appointmentService.putAppointment(item, this.PUT_WAITINGROO.appointment_id).subscribe((data) => {
                      //   this.showSuccessToast(`${item.patient_name} đã khám xong`);
                      // })
                    }
                  })
                }
              }
            }
          }

          // if (this.PUT_WAITINGROO.status_value == '2') {
          //   this.applyAnimation(wtr.patient_id, 'slide-in-top');
          // } else if (this.PUT_WAITINGROO.status_value == '3') {
          //   this.applyAnimation(wtr.patient_id, 'slide-out-bottom');
          // }

          this.loading = false;
          this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
          this.showSuccessToast('Chỉnh sửa hàng chờ thành công');
          this.getWaitingRoomData();
          this.messageContent = `CheckRealTimeWaitingRoom@@@,${wtr.patient_id},${Number(wtr.status)}`;
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
        },
          (error) => {
            this.loading = false;
            ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROO, error);
          }
        )
    }
  }

  applyAnimation(patientId: string, animationClass: string) {
    const patientElement = document.getElementById('patient-' + patientId);
    if (patientElement) {
      patientElement.classList.add(animationClass);
      patientElement.addEventListener('animationend', () => {
        patientElement.classList.remove(animationClass);
        this.getWaitingRoomData();
      });
    }
  }

  onNewWaitingRoomAdded(newWait: any) {
    this.filteredWaitingRoomData = newWait;
  }

  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(3);
    } else {
      return phoneNumber;
    }
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }
  stopClick(event: Event) {
    event.stopPropagation();
  }
  details(id: any, reason:any) {
    if (reason != '' || reason != null){
      sessionStorage.setItem('examination_reason', reason);
    }
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', id])
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      this.router.navigate(['dangnhap']);
    })
  }
  navigateHref(href: string, id: any) {
    this.router.navigate([href + id]);
  }

  updateStatus(id: any, status: any) {
    this.getWaitingRoomData();
  }

  openConfirmationModal(message: string, content: any): Promise<any> {
    const modalRef = this.modalService.open(ConfirmWaitingroomComponent);
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.content = content
    return modalRef.result;
  }

  openNotification(notification: any) {
    console.log("Xuống đây nha");
    if (this.roleId.includes('3') && notification.status == "2") {
      this.openConfirmationModal(`Mời bệnh nhân ${notification.content.patient_name} lên khám!`, notification.content).then((result) => {

      })
    }
    else {

    }
  }
  notificationSounds() {
    this.notificationSound.play().catch(error => console.error('Error playing sound:', error));
  }
  sendNotification(epoch:any, wtr:any) {
    this.notificationSounds();
    console.log("check: ",epoch);
    console.log("")
    let a = {
      epoch: epoch,
      produce_id: wtr.produce_id,
      produce_name: wtr.produce_name,
      patient_id: wtr.patient_id,
      patient_name: wtr.patient_name,
      reason: wtr.reason,
      patient_created_date: wtr.patient_created_date,
      status_value: Number(wtr.status),
      appointment_id: wtr.appointment_id,
      appointment_epoch: wtr.appointment_epoch,
    }

    const out = epoch+ " - "+wtr.produce_id+ " - "+wtr.produce_name+" - "+ wtr.patient_id+" - "+wtr.patient_name+" - "+
    wtr.reason+" - " + wtr.patient_created_date+" - "+ Number(wtr.status)+" - "+wtr.appointment_id+ " - "+wtr.appointment_epoch;
    localStorage.setItem("pawtr", JSON.stringify(a));
    this.sendMessageSocket.sendMessageSocket("CheckRealTimeWaitingRoom@@@", "notification", `${out}`);
  }

  messageContent: string = `CheckRealTime,${this.patient_Id}`;
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }
  // sendMessageWaitingRoom() {

  //   if (this.messageContent.trim() !== '' && sessionStorage.getItem('sub-id') != null && sessionStorage.getItem('username') != null) {
  //     this.messageBody = {
  //       action: "sendMessage",
  //       message: `{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
  //     };
  //     this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
  //   }
  //}
}
