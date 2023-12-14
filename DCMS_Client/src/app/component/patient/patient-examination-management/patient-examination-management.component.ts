import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { WebsocketService } from 'src/app/service/Chat/websocket.service';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { DataService } from '../../shared/services/DataService.service';
import { SendMessageSocket } from '../../shared/services/SendMessageSocket.service';
import * as moment from 'moment';
import { ResponseHandler } from '../../utils/libs/ResponseHandler';

@Component({
  selector: 'app-patient-examination-management',
  templateUrl: './patient-examination-management.component.html',
  styleUrls: ['./patient-examination-management.component.css']
})
export class PatientExaminationManagementComponent implements OnInit {
  //Display
  exRooms: any;
  groupServices: any[] = [];
  filteredWaitingRoomData: any[] = [];

  //Filter
  procedureFilter: string = '0';
  status: string = '1';
  listTemp: any[] = [];

  listPatientId: any[] = [];

  //Call Api
  putExamination!: IPostWaitingRoom;

  //Role
  roleId: any;

  selectedColor: string = "#000"

  PUT_WAITINGROO: any;
  patient_Id: any = "";

  //Socket
  CheckRealTimeWaiting: any[] = [];
  messageContent: string = `CheckRealTime,${this.patient_Id}`;
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }

  constructor(private waitingRoomService: ReceptionistWaitingRoomService,
    private appointmentService: ReceptionistAppointmentService,
    private router: Router,
    private toastr: ToastrService,
    private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private dataService: DataService,
    private sendMessageSocket: SendMessageSocket
  ) { }

  ngOnInit(): void {
    this.authorize();
    this.enableBehaviorSubject();
  }

  authorize() {
    let co = sessionStorage.getItem('role');
    if (co != null) {
      this.roleId = co.split(',');
    }
    this.getListGroupService();
    this.getWaitingRoomData();

  }

  enableBehaviorSubject() {
    this.waitingRoomService.data$.subscribe((dataList) => {
      this.filteredWaitingRoomData = dataList;
    })
  }

  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.groupServices = res.data;
      localStorage.setItem("ListGroupProcedure", JSON.stringify(this.groupServices));
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url + "/medical-procedure-group", error);
      }
    )
  }

  getWaitingRoomData() {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.exRooms = data.filter((appointment: any) => appointment.status == 2 || appointment.status == 3);
        console.log(data);
        console.log(this.exRooms);
        this.filteredWaitingRoomData = this.exRooms;
        this.exRooms.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        this.exRooms.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
        this.listPatientId = this.exRooms.map((item: any) => item.patient_id);
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.CheckRealTimeWaiting = [...this.exRooms];
        if (this.roleId.includes('2') || this.roleId.includes('4') || this.roleId.includes('5')) {
          this.CheckRealTimeWaiting = this.CheckRealTimeWaiting.filter((item) => item.status.includes('2'));
        }
        this.waitingRoomService.updateData(this.CheckRealTimeWaiting);
        this.dataService.UpdateWaitingRoomTotal(3, this.CheckRealTimeWaiting.length);
        localStorage.setItem("ListPatientWaiting", JSON.stringify(this.CheckRealTimeWaiting));
      },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
  }


  filterProcedure() {
    if (this.procedureFilter === '0') {
      this.filteredWaitingRoomData = [...this.exRooms];
    } else {
      this.filteredWaitingRoomData = this.exRooms.filter((item: IPostWaitingRoom) => item.produce_id === this.procedureFilter);
    }
  }

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
    if (this.PUT_WAITINGROO.status_value == 4) {
      this.listTemp = this.filteredWaitingRoomData;
      localStorage.setItem("ListPatientWaiting", JSON.stringify(this.filteredWaitingRoomData));
      localStorage.setItem('listPatientId', JSON.stringify(this.listTemp));
      this.waitingRoomService.deleteWaitingRooms(this.PUT_WAITINGROO)
        .subscribe((data) => {
          this.exRooms.sort((a: any, b: any) => a.epoch - b.epoch);
          this.toastr.success('Xóa hàng chờ thành công');
          this.sendMessageSocket.sendMessageSocket("CheckRealTimeWaitingRoom@@@", `${wtr.patient_id}`, `${Number('4')}`);
          this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "minus", "wtr1");
          this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "minus", "wtr");
          this.getWaitingRoomData();
        },
          (error) => {
            ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROO, error);
          }
        )
    } else {
      this.waitingRoomService.putWaitingRoom(this.PUT_WAITINGROO)
        .subscribe(data => {
          if (this.PUT_WAITINGROO.status_value == "2") {
            this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "plus", "wtr1");
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
            this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "minus", "wtr1");
            const checkTotal = localStorage.getItem('patient_examinated');
            if (checkTotal != null) {
              var check = JSON.parse(checkTotal);
              check.total = check.total + 1;
              localStorage.setItem("patient_examinated", JSON.stringify({ total: check.total, currentDate: check.currentDate }));
            }
            this.sendMessageSocket.sendMessageSocket("UpdateAnalysesTotal@@@", "plus", "wtr2");
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
          this.exRooms.sort((a: any, b: any) => a.epoch - b.epoch);
          this.toastr.success('Chỉnh sửa hàng chờ thành công');
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

          if (wtr.status == 3) {
            this.router.navigate(['/benhnhan/danhsach/tab/thanhtoan', wtr.patient_id])
          }

        },
          (error) => {
            ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROO, error);
          }
        )
    }
  }


  stopClick(event: Event) {
    event.stopPropagation();
  }

  goTreatmentCoursePage(patientId: any) {
    this.router.navigate(['benhnhan/danhsach/tab/lichtrinhdieutri', patientId]);
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }


}
