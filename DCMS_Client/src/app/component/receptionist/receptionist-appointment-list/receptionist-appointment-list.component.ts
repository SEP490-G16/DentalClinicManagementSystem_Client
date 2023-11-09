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
  endDate: string = "2023-11-11";

  ngOnInit(): void {
    const today = new Date(); // Lấy ngày hôm nay
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Lưu ý rằng tháng bắt đầu từ 0
    const day = today.getDate().toString().padStart(2, '0');
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');

    // Format ngày thành chuỗi "YYYY-MM-DD" (hoặc theo định dạng bạn muốn)
    const defaultDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours}:${minutes}`;
    this.startDate = defaultDate;

    this.getAppointmentList();

    console.log(this.cognitoService.getUser());
  }

  getAppointmentList() {
    let date = new Date(this.startDate);
    let date1 = new Date(this.endDate);
    let startDateTimestamp = date.getTime() / 1000;
    let endDateTimestamp = date1.getTime() / 1000;

    // console.log(startDateTimestamp);
    this.appointmentService.getAppointmentList(startDateTimestamp, startDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      this.filteredAppointments = this.appointmentList;
      console.log("Appointment List: ", this.appointmentList);

      this.appointmentDateInvalid();
    })
  }



  datesDisabled: any;
  appointmentDateInvalid() {
    //Get Date
    // const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    // const currentDateTimeStamp = this.dateToTimestamp(currentDateGMT7);
    // this.appointmentService.getAppointmentList(currentDateTimeStamp, currentDateTimeStamp).subscribe(data => {
    //   this.appointmentList = ConvertJson.processApiResponse(data);
    //   this.filteredAppointments = this.appointmentList;
    //   console.log("Appointment List: ", this.appointmentList);

    //   this.appointmentDateInvalid();
    // })

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
    this.dateString = this.timestampToGMT7Date(dateTimestamp);
    console.log("DateString", this.dateString);

    //Set Appointment
    this.selectedAppointment = appointment;
    this.timeString = this.timestampToGMT7String(1699500180);
    console.log("Tiem, ", this.timeString);
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
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm:ss');
    return dateTimeString;
  }

  timestampToGMT7Date(timestamp: number): string {
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ GMT+7

    // Sử dụng moment.tz để chuyển đổi timestamp sang đối tượng ngày với múi giờ GMT+7
    const date = moment.tz(timestamp * 1000, timeZone);

    // Định dạng ngày theo mong muốn
    const formattedDate = date.format('YYYY-MM-DD'); // Định dạng ngày giờ

    return formattedDate;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf();
    return timestamp;
  }


  convertTimestampToDateString(timestamp: any): string {
    const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  }
  convertTimestampToTimesString(timestamp: any): string {
    const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const formattedDate = `${hours}:${minutes}`;
    return formattedDate;
  }
  padZero(value: number): string {
    if (value < 10) {
      return `0${value}`;
    }
    return value.toString();
  }

  formatDateToCustomString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm số 0 ở đầu nếu cần
    const day = date.getDate().toString().padStart(2, '0'); // Thêm số 0 ở đầu nếu cần
    return `${year}-${month}-${day}`;
  }


  convertTimestampToTimeString(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
    const hours = date.getHours().toString().padStart(2, '0'); // Lấy giờ và đảm bảo có 2 chữ số
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Lấy phút và đảm bảo có 2 chữ số
    return `${hours}:${minutes}`;
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/dangnhap']);
    })
  }

}
