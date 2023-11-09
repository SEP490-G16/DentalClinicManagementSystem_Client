import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { Detail, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
import { Router } from '@angular/router';
import { ConvertJson } from "../../../service/Lib/ConvertJson";
import { PopupAddAppointmentComponent } from './popup-add-appointment/popup-add-appointment.component';

import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})
export class ReceptionistAppointmentListComponent implements OnInit {
  model!: NgbDateStruct;
  placement = 'bottom';

  chatContainerVisible = false;
  constructor(private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private renderer: Renderer2
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
  appointmentList: any;

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

    // console.log(this.cognitoService.getUser());
  }

  getAppointmentList() {

    // console.log(startDateTimestamp);
    this.appointmentService.getAppointmentList(this.startDateTimestamp, this.endDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      this.filteredAppointments = this.appointmentList;
      console.log("Appointment List: ", this.appointmentList);

      this.appointmentDateInvalid();
    })
  }



  datesDisabled: any;
  appointmentDateInvalid() {
    // Get Date
    this.datesDisabled = this.appointmentList
      .filter((item: any) => {
        const totalProcedures = item.appointments.reduce((total: number, appointment: any) => total + appointment.procedure, 0);
        console.log("Totla procedure", totalProcedures);
        return totalProcedures > 15;
      })
      .map((item: any) => item.date);

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

    //Set Appointment
    this.selectedAppointment = appointment;
    this.timeString = this.timestampToGMT7String(appointment.time);
    console.log("Time, ", this.timeString);
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
    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm');
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


  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/dangnhap']);
    })
  }

}
