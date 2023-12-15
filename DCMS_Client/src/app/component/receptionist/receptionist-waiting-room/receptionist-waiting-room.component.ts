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

@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit, DoCheck {
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

  NEW: string = "new";
  public dataArray: any[] = [];

  constructor(private waitingRoomService: ReceptionistWaitingRoomService,
    private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService, private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private dataService: DataService,
    private sendMessageSocket: SendMessageSocket
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
  }

  ngDoCheck() {
    // if (this.filteredWaitingRoomData) {
    //   console.log("Check: ", this.filteredWaitingRoomData);
    // }
  }

  CheckRealTimeWaiting: any[] = [];
  getWaitingRoomData() {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        this.waitingRoomData.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        this.waitingRoomData.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
        this.listPatientId = this.waitingRoomData.map((item: any) => item.patient_id);
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.CheckRealTimeWaiting = [...this.waitingRoomData];
        if (this.roleId.includes('2') || this.roleId.includes('4') || this.roleId.includes('5')) {
          this.CheckRealTimeWaiting = this.CheckRealTimeWaiting.filter((item) => item.status.includes('2'));
        }
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
            if (wtr.patient_created_date == "1") {
              this.waitingRoomService.putNewPatientId(wtr.patient_id).subscribe((data) => {
              })
            }
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

  onNewWaitingRoomAdded(newWait:any) {
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
  details(id: any) {
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
