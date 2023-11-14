import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { DateDisabledItem, Detail, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
import { Router } from '@angular/router';
import { ConvertJson } from "../../../service/Lib/ConvertJson";
import { PopupAddAppointmentComponent } from './popup-add-appointment/popup-add-appointment.component';

import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import {WebsocketService} from "../../../service/Chat/websocket.service";
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})

export class ReceptionistAppointmentListComponent implements OnInit {

  loading:boolean = false;

  model!: NgbDateStruct;
  placement = 'bottom';

  constructor(private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private webSocketService:WebsocketService, 
    private medicaoProcedureGroupService:MedicalProcedureGroupService, 
    private receptionistWaitingRoom: ReceptionistWaitingRoomService
  ) {
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
    })
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
      this.filteredAppointments.forEach((a:any) => { 
        this.dateEpoch = this.convertTimestampToVNDateString(a.date);
        this.ePoch = a.date;
        a.appointments.forEach((b: any) => {
          this.abcd = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
      console.log("Appointment List: ", this.abcd);
      console.log("Filter List: ", this.filteredAppointments);

      this.loading = false;
      this.appointmentDateInvalid();
    },
    () => {
      this.loading = false;
    })
  }

  toggleChat() {
    this.webSocketService.toggleChat();
  }


  datesDisabled: DateDisabledItem[] = [];
  appointmentDateInvalid() {
    // Get Date
    this.datesDisabled = this.appointmentList
      .filter(item => item.appointments.some(appointment => appointment.count > 1))
      .map(item => ({ date: item.date, procedure: item.appointments[0].procedure }));

    console.log("Date disabled: ", this.datesDisabled);
  }


  filterAppointments() {
    if (this.selectedProcedure) {
      // Lọc danh sách appointments dựa trên selectedProcedure
      this.filteredAppointments = this.appointmentList
        .map((a: any) => {
          const filteredAppointments = a.appointments
            .filter((appointment: any) => appointment.procedure === parseInt(this.selectedProcedure));
          // Chỉ giữ lại các "appointment" có "details"
          return { ...a, appointments: filteredAppointments };
        })
        .filter((a: any) => a.appointments.length > 0);
    } else {
      // Nếu không có selectedProcedure, hiển thị toàn bộ danh sách
      this.filteredAppointments = this.appointmentList;
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
    this.dateString = this.convertTimestampToDateString(dateTimestamp);
    console.log("DateString", this.dateString);
  
    this.selectedAppointment = appointment;
    this.timeString = this.timestampToGMT7String(appointment.time);
    console.log("Time, ", this.timeString);
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
    this.Exchange.epoch = a;
    this.Exchange.patient_id = b.patient_id;
    this.Exchange.produce_id = b.procedure_id;
    this.Exchange.produce_name = b.procedure_name;
    this.Exchange.reason= '';
    this.receptionistWaitingRoom.postWaitingRoom(this.Exchange).subscribe(
      (data) => {
        alert('Đã chuyển qua hàng đợi:');
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
        alert("lỗi");
        //this.showErrorToast('Lỗi khi tạo lịch hẹn!');
      }
    );
  }


  openAddAppointmentModal() {
    // this.datesDisabled = this.datesDisabled;
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    // Kiểm tra xem timestamp có đơn vị giây hay mili giây
    const timestampInMilliseconds = timestamp * (timestamp > 1e12 ? 1 : 1000);

    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestampInMilliseconds, 'Asia/Ho_Chi_Minh').format('HH:mm');

    return dateTimeString;
  }


  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf();
    return timestamp;
  }

  convertTimestampToDateString(timestamp: number): string {
    return moment(timestamp).format('YYYY-MM-DD');
  }

  convertTimestampToVNDateString(timestamp: number): string {
    return moment(timestamp).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
  }

  addItem(newItem: any) {   
    this.filteredAppointments.push({appointment_id: '', attribute_name: '', 
    doctor: newItem.appointment.doctor, epoch: newItem.epoch,  migrated: false, patient_id: newItem.appointment.patient_id, patient_name : newItem.appointment.patient_name, phone_number: newItem.appointment.phone_number, 
    procedure_id: newItem.appointment.procedure_id, procedure_name: newItem.appointment.procedure_name, time: newItem.appointment.time});
    alert("đã vô đây");
    console.log(this.filteredAppointments);
  }
}
