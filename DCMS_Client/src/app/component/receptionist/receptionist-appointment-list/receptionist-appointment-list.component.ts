import { Component, OnInit } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { Detail, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
import { Router } from '@angular/router';
import {ConvertJson} from "../../../service/Lib/ConvertJson";


@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})
export class ReceptionistAppointmentListComponent implements OnInit {
  model!: NgbDateStruct;
  placement = 'bottom';
  constructor(private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService, private router:Router) {

    this.selectedAppointment = {
      appointment_id: '',
      patient_id: '',
      patient_name:'',
      doctor: '',
      procedure: '',
      phone_number: ''
    } as ISelectedAppointment
  }
  selectedProcedure: string = '';
  searchText:string='';
  filteredAppointments:any;
  appointmentList:any;
  startDate:any;
  endDate:string="2023-10-21";
  defaultDate:string="2023-10-23 00:00:00"
  ngOnInit(): void {
    this.startDate = this.defaultDate;
    this.getAppointmentList();
  }
  getAppointmentList(){
    let date = new Date(this.startDate);
    let date1 = new Date(this.endDate);
    let startDateTimestamp = date.getTime()/1000;
    let endDateTimestamp = date1.getTime()/1000;
    console.log(startDateTimestamp);
    this.appointmentService.getAppointmentList(startDateTimestamp,startDateTimestamp).subscribe(data=>{
      this.appointmentList = ConvertJson.processApiResponse(data);
      this.filteredAppointments = this.appointmentList;
      console.log(this.appointmentList);

    })
  }
  convertTimestampToDateString(timestampDate: any): string {
    const date = new Date(timestampDate * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
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
  filterAppointments() {
    if (this.selectedProcedure) {
      // Lọc danh sách appointments dựa trên selectedProcedure
      this.filteredAppointments = this.appointmentList
        .map((a:any) => {
          const filteredAppointments = a.appointments
            .filter((appointment:any) => appointment.procedure === parseInt(this.selectedProcedure));
          // Chỉ giữ lại các "appointment" có "details"
          return { ...a, appointments: filteredAppointments };
        })
        .filter((a:any) => a.appointments.length > 0);
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
    console.log("DateString",this.dateString);

    //Set Appointment
    this.selectedAppointment = appointment;
    //console.log(this.selectedAppointment.time);
    this.timeString = this.convertTimestampToTimeString(this.selectedAppointment.time);

    //Convert timestamp to Date in PopupEdit

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
        this.router.navigate(['/auth']);
    })
  }
}
