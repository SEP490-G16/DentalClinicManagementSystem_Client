import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { DateDisabledItem, Detail, IEditAppointmentBody, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
import { Router } from '@angular/router';
import { ConvertJson } from "../../../service/Lib/ConvertJson";
import { PopupAddAppointmentComponent } from '../../utils/pop-up/appointment/popup-add-appointment/popup-add-appointment.component';

import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import {WebsocketService} from "../../../service/Chat/websocket.service";
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ResponseHandler} from "../../utils/libs/ResponseHandler";

@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})

export class ReceptionistAppointmentListComponent implements OnInit {

  loading:boolean = false;

  model!: NgbDateStruct;
  placement = 'bottom';
  DELETE_APPOINTMENT_BODY: IEditAppointmentBody

  constructor(private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private webSocketService:WebsocketService,
    private medicaoProcedureGroupService:MedicalProcedureGroupService,
    private receptionistWaitingRoom: ReceptionistWaitingRoomService
  ) {
    this.DELETE_APPOINTMENT_BODY = {
      epoch: 0,    //x
      new_epoch: 0,
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure_id: "1",  //x
        doctor: '',
        status: 2, //x
        time: 0  //x
      }
    } as IEditAppointmentBody;
    this.selectedAppointment = {
      appointment_id: '',
      patient_id: '',
      patient_name: '',
      doctor: '',
      procedure: '',
      phone_number: ''
    } as ISelectedAppointment
  }

  selectedProcedure: string = '';
  searchText: string = '';
  filteredAppointments: any;
  appointmentList: RootObject[] = [];
  listGroupService: any[] = [];

  startDate: any;
  endDate: string = "2023-12-31";


  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  ngOnInit(): void {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;

    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7);
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);

    this.getAppointmentList();
    this.getListGroupService();
    // console.log(this.cognitoService.getUser());
  }

  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any) => {
      this.listGroupService = res.data;
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url+"/medical-procedure-group", error);
      }
      )
  }

  abcd: any[] = [];
  dateEpoch: string = "";
  ePoch: string ="";

  getAppointmentList() {
    this.loading = true;
    this.startDateTimestamp = this.dateToTimestamp(this.startDate);
    this.appointmentService.getAppointmentList(this.startDateTimestamp, this.endDateTimestamp).subscribe(data => {
    this.appointmentList = ConvertJson.processApiResponse(data);
    this.filteredAppointments = this.appointmentList.filter(app => app.date === this.startDateTimestamp);
      this.filteredAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
      this.loading = false;
      console.log(this.filteredAppointments);
      this.appointmentDateInvalid();
    },
    error => {
      this.loading = false;
      ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl+"/appointment/"+this.startDateTimestamp+"/"+this.endDateTimestamp, error);
    })
  }

  toggleChat() {
    this.webSocketService.toggleChat();
  }

  dateDis = {
    date: 0,
    procedure:'',
    count: 0,
  }
  //datesDisabled: DateDisabledItem[] = [];
  datesDisabled: any[] = [];
  listDate: any [] = [];
  appointmentDateInvalid() {
    var today = new Date();
    var date = today.getFullYear()+' - '+(today.getMonth()+1) + ' - '+today.getDate();
    var time = today.getHours()+':'+today.getMinutes()+ ':'+today.getSeconds();
    var dateTime = date+ ' '+"00:00:00";
    var startTime = this.dateToTimestamp(dateTime);
    var endTime = this.dateToTimestamp(today.getFullYear()+' - '+(today.getMonth()+1) + ' - '+(today.getDate() + 4)+' '+"23:59:59");
    this.appointmentService.getAppointmentList(startTime, endTime).subscribe(data => {
      this.listDate = ConvertJson.processApiResponse(data);
      this.listDate.forEach((a: any) => {
        a.appointments.forEach((b: any) => {
          this.dateDis.date = a.date;
          this.dateDis.procedure = b.procedure_id;
          this.dateDis.count = b.count;
          this.datesDisabled.push(this.dateDis);
          this.dateDis = {
            date: 0,
            procedure: '',
            count: 0,
          }
        })
      })
    },
    error => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl+"/appointment/"+startTime+"/"+endTime, error);
    })
  }


  filterAppointments() {
    if (this.selectedProcedure) {
      this.filteredAppointments = this.appointmentList
        .map((a: any) => {
          const filteredAppointments = a.appointments
            .filter((appointment: any) => appointment.procedure_id === this.selectedProcedure);
          // Chỉ giữ lại các "appointment" có "details"
          return { ...a, appointments: filteredAppointments };
        })
        .filter((a: any) => a.appointments.length > 0);
        this.filteredAppointments.forEach((a: any) => {
          this.dateEpoch = this.timestampToDate(a.date);
          this.ePoch = a.date;
          a.appointments.forEach((b: any) => {
            b.details = b.details.sort((a: any, b: any) => a.time - b.time);
          })
        })
    } else {
      // Nếu không có selectedProcedure, hiển thị toàn bộ danh sách
      this.filteredAppointments = this.appointmentList;
      this.filteredAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        this.ePoch = a.date;
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
    }
  }

  searchAppointments() {
    const searchText = this.searchText.toLowerCase().trim();
    console.log(searchText);
    if (searchText) {
      this.filteredAppointments = this.appointmentList
        .map((a: any) => ({
          ...a,
          appointments: a.appointments.map((ap: any) => ({
            ...ap,
            details: ap.details.filter((detail: any) => {
              const patientName = detail.patient_name ? detail.patient_name.toLowerCase() : '';
              const patientId = detail.patient_id ? detail.patient_id.toLowerCase() : '';
              return patientName.includes(searchText) || patientId.includes(searchText);
            })
          })).filter((ap: any) => ap.details.length > 0)
        }))
        .filter((a: any) => a.appointments.length > 0);
    } else {
      this.filteredAppointments = this.appointmentList;
    }
  }

  selectedAppointment: ISelectedAppointment;
  dateString: any;
  timeString: any;
  openEditModal(appointment: any, dateTimestamp: any) {
    console.log("DateTimestamp", dateTimestamp);
    this.dateString = this.timestampToDate(dateTimestamp);
    console.log("DateString", this.dateString);

    this.selectedAppointment = appointment;
    this.timeString = this.timestampToTime(appointment.time);
    console.log("Time, ", this.timeString);
  }

  deleteAppointment(appointment: any, dateTimestamp: any) {
    this.DELETE_APPOINTMENT_BODY = {
      epoch: dateTimestamp,
      new_epoch: 0,
      appointment: {
        patient_id: ' ',
        patient_name: ' ',
        procedure_id: ' ',
        procedure_name: ' ',
        phone_number: ' ',
        doctor: ' ',
        status: 2,
        time: 0
      }

    } as IEditAppointmentBody;
    this.appointmentService.deleteAppointment(dateTimestamp, appointment.appointment_id).subscribe(response => {
      console.log("Xóa thành công");
      this.showSuccessToast('Xóa lịch hẹn thành công!');
        window.location.reload();
    }, error => {
      this.showErrorToast("Lỗi khi cập nhật");
      this.showErrorToast("Lỗi khi xóa");
    });
  }

  Exchange = {
      epoch: 0,
      produce_id: "0",
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 1
  }

  postExchangeAppointmentToWaitingRoom(a:any, b:any) {
    const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    this.Exchange.epoch = Math.floor(currentDateTimeGMT7.valueOf()/1000);
    this.Exchange.patient_id = b.patient_id;
    this.Exchange.patient_name = b.patient_name;
    this.Exchange.produce_id = b.procedure_id;
    this.Exchange.produce_name = b.procedure_name;
    this.receptionistWaitingRoom.postWaitingRoom(this.Exchange).subscribe(
      (data) => {
        this.Exchange = {
            epoch: 0,
            produce_id: "0",
            produce_name: '',
            patient_id: '',
            patient_name: '',
            reason: '',
            status: 1
        }
        window.location.href="/letan/phong-cho";
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.receptionistWaitingRoom.apiUrl+"/waiting-room", error);
        //this.showErrorToast('Lỗi khi tạo lịch hẹn!');
      }
    );
  }


  openAddAppointmentModal() {
    // this.datesDisabled = this.datesDisabled;
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() /1000;
    return timestamp;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  checkDate(date:any) {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    if (this.timestampToDate(date) < currentDateGMT7) {
      return false;
    }
    return true;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }

  addItem(newItem: any) {
    this.filteredAppointments.push({appointment_id: '', attribute_name: '',
    doctor: newItem.appointment.doctor, epoch: newItem.epoch,  migrated: false, patient_id: newItem.appointment.patient_id, patient_name : newItem.appointment.patient_name, phone_number: newItem.appointment.phone_number,
    procedure_id: newItem.appointment.procedure_id, procedure_name: newItem.appointment.procedure_name, time: newItem.appointment.time});

    console.log(this.filteredAppointments);
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
}
