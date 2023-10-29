import { Component, OnInit } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { Detail, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
import { format } from 'date-fns';
import { Router } from '@angular/router';
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
      procedure: '',
      phone_number: ''
    } as ISelectedAppointment
  }
  selectedProcedure: string = '';
  searchText: string = '';
  filteredAppointments: any;
  appointmentList: any;
  startDate: string = "1970-01-01 8:00:09";
  jsonData: any;
  jsonDataString: string = `
    {
        "date": 10,
        "appointments": [
            {
                "procedure": 1,
                "count": 5,
                "details": [
                    {"appointment_id":"1698176760730", "patient_id":"P-000001", "patient_name":"Nguyễn Văn Dũng", "phone_number":"0987654321", "procedure":1, "doctor":"nguyễn văn b", "time":123456, "attribute_name":"", "epoch":"", "migrated":"" },
                    {"appointment_id":"1698176587078", "patient_id":"P-000001", "patient_name":"Nguyễn Văn Dũng", "phone_number":"0987654321", "procedure":1, "doctor":"nguyễn văn b", "time":123456, "attribute_name":"", "epoch":"", "migrated":"" },
                    {"appointment_id":"1698176565255", "patient_id":"P-000001", "patient_name":"Nguyễn Văn Dũng", "phone_number":"0987654321", "procedure":1, "doctor":"nguyễn văn b", "time":123456, "attribute_name":"", "epoch":"", "migrated":"" },
                    {"appointment_id":"1698176313953", "patient_id":"P-000001", "patient_name":"Nguyễn Văn An", "phone_number":"0987654321", "procedure":1, "doctor":"nguyễn văn b", "time":123456, "attribute_name":"", "epoch":"", "migrated":"" },
                    {"appointment_id":"1698175939160", "patient_id":"P-000001", "patient_name":"Nguyễn Văn An", "phone_number":"0987654321", "procedure":1, "doctor":"nguyễn văn b", "time":123456, "attribute_name":"", "epoch":"", "migrated":"" }
                ]
            },
            {
                "procedure": 2,
                "count": 1,
                "details": [
                    {"appointment_id":"1698174152860", "patient_id":"P-000002", "patient_name":"Vũ Thị Anh", "phone_number":"0987654321", "procedure":2, "doctor":"nguyễn văn b", "time":"123456", "attribute_name":"", "epoch":"", "migrated":"" }
                ]
            }
        ]
    }
  `;
  ngOnInit(): void {
    this.getAppointmentList();
    this.filteredAppointments = this.appointmentList.appointments;

    //Convert timestamp to Date in PopupEdit
  }
  getAppointmentList() {
    let date = new Date(this.startDate);
    let startDateTimestamp = date.getTime() / 1000;
    console.log(startDateTimestamp);
    /*this.appointmentService.getAppointmentList(startDateTimestamp,startDateTimestamp).subscribe(data=>{
      /!*const jsonData = JSON.parse(data.appointments.details);
      console.log(jsonData);
      this.appointmentList = jsonData;
      console.log(this.appointmentList);*!/
      console.log(data)
      const jsonData = JSON.parse(data)
      console.log(jsonData)
    })*/
    this.jsonData = JSON.parse(this.jsonDataString);
    this.appointmentList = this.jsonData;
    console.log(this.appointmentList)
  }
  convertTimestampToDateString(timestamp: any): string {
    const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
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
      this.filteredAppointments = this.appointmentList.appointments
        .filter((appointment: any) => appointment.procedure === parseInt(this.selectedProcedure));
    } else {
      this.filteredAppointments = this.appointmentList.appointments;
    }
  }
  searchAppointments() {
    const searchText = this.searchText.toLowerCase().trim();
    if (this.searchText) {
      this.filteredAppointments = this.appointmentList.appointments
        .map((appointment: any) => ({
          ...appointment,
          details: appointment.details.filter((detail: any) => {
            const patientName = detail.patient_name ? detail.patient_name.toLowerCase() : '';
            const patientId = detail.patient_id ? detail.patient_id : '';
            return patientName.includes(searchText) || patientId.includes(searchText);
          })
        }))
        .filter((appointment: any) => appointment.details.length > 0);
    } else {
      this.filteredAppointments = this.appointmentList.appointments;
    }
  }

  selectedAppointment: ISelectedAppointment;
  dateString: any;
  timeString: any;
  openEditModal(appointment: any, dateTimestamp: any) {
    // console.log(dateTimestamp);
    // console.log(this.appointmentList.date);
    const date = new Date(this.appointmentList.date * 1000);
    this.dateString = this.formatDateToCustomString(date);
    console.log(this.dateString);

    //Set Appointment
    this.selectedAppointment = appointment;
    console.log(this.selectedAppointment.time);
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
