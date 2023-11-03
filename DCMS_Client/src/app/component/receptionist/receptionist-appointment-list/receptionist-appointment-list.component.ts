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

@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})
export class ReceptionistAppointmentListComponent implements OnInit {
  model!: NgbDateStruct;
  placement = 'bottom';

  @ViewChild(PopupAddAppointmentComponent) addAppointmentComponent!: PopupAddAppointmentComponent;

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
  endDate: string = "2024-01-01";

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
    this.appointmentService.getAppointmentList(startDateTimestamp, 1704070800).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      this.filteredAppointments = this.appointmentList;
      console.log("Appointment List: ", this.appointmentList);

      this.appointmentDateInvalid();
    })
  }

  datesDisabled: any;
  appointmentDateInvalid() {
    this.datesDisabled = this.appointmentList
      .filter((item: any) => {
        const totalProcedures = item.appointments.reduce((total: number, appointment: any) => total + appointment.procedure, 0);
        console.log(totalProcedures);
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
    //console.log("DateTimestamp", dateTimestamp);
    const date = new Date(dateTimestamp * 1000);
    this.dateString = this.formatDateToCustomString(date);
    console.log("DateString", this.dateString);

    //Set Appointment
    this.selectedAppointment = appointment;
    //console.log(this.selectedAppointment.time);
    this.timeString = this.convertTimestampToTimeString(this.selectedAppointment.time);
  }


  openAddAppointmentModal() {
    this.datesDisabled = this.datesDisabled;
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
      this.router.navigate(['/login']);
    })
  }

}
