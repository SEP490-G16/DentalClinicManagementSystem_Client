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
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
  currentDate: any;
  //Filter
  procedureFilter: string = '0';
  status: string = '1';
  listTemp: any[] = [];

  listPatientId: any[] = [];

  //Call Api
  PUT_WAITINGROO: any;


  //Role
  roleId: any;

  selectedColor: string = "#000"

  //Socket
  Socket_Patient_Id: any = "";
  realTimeWaiting: any[] = [];
  realTimeExaminated:any [] = []
  // messageContent: string = `CheckRealTime,${this.Socket_Patient_Id}`;
  //Socket
  CheckRealTimeWaiting: any[] = [];
  messageContent: string = '';
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }

  constructor(private waitingRoomService: ReceptionistWaitingRoomService,
    private router: Router,
    private toastr: ToastrService,
    private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private sendMessageSocket: SendMessageSocket,
    private dataService:DataService
  ) { }

  ngOnInit(): void {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    const day = currentDateGMT7.date();
    const month = currentDateGMT7.month() + 1; // Tháng bắt đầu từ 0
    const year = currentDateGMT7.year();
    this.currentDate = day + "/" + month + "/" + year;
    this.authorize();
    this.getListGroupService();
    this.getWaitingRoomData(null);
    this.enableBehaviorSubject();
  }

  authorize() {
    let co = sessionStorage.getItem('role');
    (co != null) ? this.roleId = co.split(',') : '';
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

  getWaitingRoomData(exRoomDetail: any) {
    return this.waitingRoomService.getWaitingRooms()
      .subscribe(data => {
        this.exRooms = data;

        this.exRooms.forEach((exRoom: any) => {
          exRoom.date = this.timestampToTime(exRoom.epoch);
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        this.exRooms.sort((exRoomBefore: any, exRoomAfter: any) => {
          const orderA = statusOrder[exRoomBefore.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[exRoomAfter.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });

        // Đồng bộ danh sách phòng chờ
        this.waitingRoomService.updateData(this.exRooms);

        this.exRooms = data.filter((waittingRoom: any) => waittingRoom.status == 2 || waittingRoom.status == 3);

        // Thống kê trên navbar
        // this.realTimeWaiting = [...this.exRooms].filter((waitingRoom:any) => waitingRoom.status == 2);
        // this.realTimeExaminated = [...this.exRooms].filter((waitingRoom:any) => waitingRoom.status == 3);

        //this.dataService.UpdateWaitingRoomTotal(3, data.length);

        // Cache
        this.listPatientId = this.exRooms.map((item: any) => item.patient_id);
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        localStorage.setItem("ListPatientWaiting", JSON.stringify(this.realTimeWaiting));

        if (exRoomDetail) {
          this.toastr.success('Chỉnh sửa hàng chờ thành công');
          if (exRoomDetail.status == 3) {
            sessionStorage.setItem("examination_reason", exRoomDetail.reason);
            this.router.navigate(['/benhnhan/danhsach/tab/thanhtoan', exRoomDetail.patient_id]);
          }
        }
      }),
      catchError(error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
        return throwError(error);
      })
  }


  onPutStatus(wtr: any, epoch: number) {
    wtr.animateChange = true;
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
    this.waitingRoomService.putWaitingRoom(this.PUT_WAITINGROO)
      .subscribe((res) => {
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
                  }
                })
              }
            }
          }
        }
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
        setTimeout(() => wtr.animateChange = false, 2000);
        this.getWaitingRoomData(wtr)
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROO, error);
        }
      )
  }

  stopClick(event: Event) {
    event.stopPropagation();
  }

  goTreatmentCoursePage(patientId: any, wtr:any) {
    sessionStorage.setItem("patient", JSON.stringify(wtr))
    sessionStorage.setItem("examination_reason", wtr.reason);
    this.router.navigate(['benhnhan/danhsach/tab/lichtrinhdieutri', patientId]);
  }

  filterProcedure() {
      console.log("aa");
    if (this.procedureFilter === '0') {
      this.filteredWaitingRoomData = [...this.exRooms];
    } else {
      this.filteredWaitingRoomData = this.exRooms.filter((item: IPostWaitingRoom) => item.produce_id === this.procedureFilter);
    }
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }
}
