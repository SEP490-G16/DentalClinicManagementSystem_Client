import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { ISelectedAppointment, RootObject } from 'src/app/model/IAppointment';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IPatient } from 'src/app/model/IPatient';
import {
  ConfirmDeleteModalComponent
} from "../../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import { DatePipe } from "@angular/common";
@Component({
  selector: 'app-patient-appointment-tab',
  templateUrl: './patient-appointment-tab.component.html',
  styleUrls: ['./patient-appointment-tab.component.css']
})
export class PatientAppointmentTabComponent implements OnInit {
  id: string = "";
  endDateTimestamp: number = 0;
  currentDateTimestamp: number = 0;
  Patient: any;
  patientAppointments: any[] = [];

  dateString: any;
  timeString: any;
  patientName: any;
  name: any
  selectedAppointment: ISelectedAppointment;
  dateDis = { date: 0, procedure: '', count: 0, }
  model!: NgbDateStruct;
  appointmentList: any[] = [];
  datesDisabled: any[] = [];
  listDate: any[] = [];
  roleId: string[] = [];
  constructor(
    private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private commonService: CommonService,
    private router: Router,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private toastr: ToastrService) {

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDateTimestamp = this.dateToTimestamp2(currentDateGMT7);
    console.log("Hum nay: ", this.currentDateTimestamp);
    this.endDateTimestamp = this.dateToTimestamp("2023-12-23 23:59:59");
    this.selectedAppointment = {} as ISelectedAppointment
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.name = sessionStorage.getItem('patient');
    console.log("Name Patient: ", this.name)

    this.patientService.getPatientById(this.id).subscribe((patient: any) => {
      console.log("Patient: ", patient);
      this.patientName = patient.patient_name;
      this.Patient = patient;
      sessionStorage.setItem('patient', JSON.stringify(patient));
    },
    err => {
      this.toastr.error("Bệnh nhân có thể đã bị xóa và hiện không tồn tại trong hệ thống");
    }
    )

    this.getAppointmentList();
  }

  // getAppointmentList() {
  //   const selectedYear = 2023;
  //   const selectedMonth = 12;
  //   const selectedDay = 20;
  //   const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
  //   // var dateTime = this.currentDate + ' ' + "00:00:00";
  //   //var startTime = this.dateToTimestamp(dateTime);
  //   // const currentDate = new Date();
  //   // const vnTimezoneOffset = 7 * 60;
  //   // const vietnamTime = new Date(currentDate.getTime() + vnTimezoneOffset * 60 * 1000);
  //   // const nextWeekDate = new Date(vietnamTime.getTime());
  //   // nextWeekDate.setDate(vietnamTime.getDate() + 7);
  //   // const dateFormatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
  //   // const formattedDate = dateFormatter.format(nextWeekDate);
  //   // var temp = formattedDate.split('/');
  //   // var endTime = temp[2] + '-' + temp[0] + '-' + temp[1] + ' 23:59:59';
  //   // this.nextDate = temp[2] + '-' + temp[0] + '-' + temp[1];
  //   this.APPOINTMENT_SERVICE.getAppointmentList(this.currentDateTimestamp, this.currentDateTimestamp).subscribe(data => {
  //     this.appointmentList = ConvertJson.processApiResponse(data);
  //     // localStorage.setItem("ListAppointment", JSON.stringify(this.appointmentList));
  //     // this.patientAppointments = this.appointmentList.filter(app => app.date === this.dateToTimestamp(selectedDate));
  //     // console.log("Appointment: ", this.appointmentList);
  //     // this.filteredAppointments.forEach((appointmentParent: any) => {
  //     //   this.dateEpoch = this.timestampToDate(appointmentParent.date);

  //     //   const allDetails = appointmentParent.appointments
  //     //     .map((appointment: any) => appointment.details)
  //     //     .flat();

  //     //   allDetails.sort((a: any, b: any) => {
  //     //     const timeA = typeof a.time === "string" ? parseInt(a.time, 10) : a.time;
  //     //     const timeB = typeof b.time === "string" ? parseInt(b.time, 10) : b.time;
  //     //     return timeA - timeB;
  //     //   });

  //     //   for (let i = 0; i < appointmentParent.appointments.length; i++) {
  //     //     appointmentParent.appointments[i].details = [allDetails[i]];
  //     //   }
  //     // });

  //     //   console.log("Filter Appointment: ", this.filteredAppointments);

  //     //   this.loading = false;
  //     //   //this.appointmentDateInvalid();
  //     // },
  //     //   error => {
  //     //     this.loading = false;
  //     //     ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl + "/appointment/" + this.startDateTimestamp + "/" + this.endDateTimestamp, error);

  //     // this.patientAppointments = this.appointmentList.flatMap((appointment: any) =>
  //     //   appointment.appointments
  //     //     .filter((app: any) => app.details.some((detail: any) => detail.patient_id === this.id))
  //     //     .map((app: any) => ({
  //     //       ...app,
  //     //       date: appointment.date,
  //     //       details: app.details.filter((detail: any) => detail.patient_id === this.id)
  //     //     }))
  //     // );
  //   })
  // }

  getAppointmentList() {
    this.APPOINTMENT_SERVICE.getAppointmentList(this.currentDateTimestamp, this.currentDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      console.log("this.da", this.appointmentList);
      this.patientAppointments = this.appointmentList.flatMap((appointment: any) =>
        appointment.appointments
          .filter((app: any) => app.details.some((detail: any) => detail.patient_id === this.id))
          .map((app: any) => ({
            ...app,
            date: appointment.date,
            details: app.details.filter((detail: any) => detail.patient_id === this.id)
          }))
      );

      this.patientAppointments.sort((a: any, b: any) => b.date - a.date);

      console.log("Filtered Patient Appointments:", this.patientAppointments);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment/" + 1696925134 + "/" + this.endDateTimestamp, error);
      }
    );
  }



  openEditModal(detail: any, dateTimestamp: any) {

  }

  setPatient() {
    console.log("asdsadsadadsa");
    console.log("Patient set: ", this.Patient);
    if (this.Patient == null) {
      this.Patient.patient_id = this.id;
      this.Patient.patient_name = this.patientAppointments[0].appointments[0].details[0].patient_name;
      this.Patient.phone_number = this.patientAppointments[0].appointments[0].details[0].phone_number;
    }

  }


  editAppointment(appointment: any, dateTimestamp: any) {
    console.log("DateTimestamp", dateTimestamp);
    this.dateString = this.timestampToDate(dateTimestamp);
    console.log("DateString", this.dateString);
    console.log("Check appoin", appointment);
    this.selectedAppointment = appointment;
    this.timeString = this.timestampToTime(appointment.time);
    console.log("Time, ", this.timeString);
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteAppointment(detail: any, date:any, time:any) {
    // this.APPOINTMENT_SERVICE.deleteAppointment(dateTimestamp, detail.appointment_id).subscribe(response => {
    //   console.log("Xóa thành công");
    //   this.showSuccessToast('Xóa lịch hẹn thành công!');
    //   window.location.reload();
    // }, error => {
    //   this.showErrorToast("Lỗi khi cập nhật");
    //   this.showErrorToast("Lỗi khi xóa");
    // });

    this.openConfirmationModal(`Bạn có chắc chắn muốn xoá lịch hẹn lúc ${this.timestampToTime(detail.time)} - ${this.timestampToDate(date)} không?`).then((result) => {
      if (result) {
        this.APPOINTMENT_SERVICE.deleteAppointment(date, detail.appointment_id)
          .subscribe((res) => {
            this.toastr.success('Xóa lịch hẹn thành công!');
            const appointmentIdToRemove = detail.appointment_id;
            for (let i = 0; i < this.patientAppointments.length; i++) {
              // Find the index of the detail with the matching appointment_id
              const detailIndex = this.patientAppointments[i].details.findIndex((detail:any) => detail.appointment_id === appointmentIdToRemove);

              // If found, remove the detail from the array
              if (detailIndex !== -1) {
                this.patientAppointments[i].details.splice(detailIndex, 1);
                break; // Assuming you only need to remove the first occurrence found
              }
            }

          },
            (error) => {
              this.showErrorToast("Lỗi khi cập nhật");
              this.showErrorToast("Lỗi khi xóa");
            }
          )
      }
    });
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
  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  dateToTimestamp2(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp / 1000;
  }

  timestampToGMT7String(timestamp: number): string {
    // Kiểm tra xem timestamp có đơn vị giây hay mili giây
    const timestampInMilliseconds = timestamp * (timestamp > 1e12 ? 1 : 1000);

    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestampInMilliseconds, 'Asia/Ho_Chi_Minh').format('HH:mm');

    return dateTimeString;
  }

  convertTimestampToDateString(timestamp: number): string {
    return moment(timestamp).format('YYYY-MM-DD');
  }

  convertTimestampToVNDateString(timestamp: number): string {
    return moment(timestamp).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
  }

  timestampToGMT7StringWithDate(timestamp: number): string {
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm DD-MM-DD');
    return dateTimeString;
  }


  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.id);
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  checkDate(date: any) {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    if (this.timestampToDate(date) < currentDateGMT7) {
      return false;
    }
    return true;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('DD-MM-YYYY');
    return dateStr;
  }

  timestampToDate2(timestamp: number) {
    // Ensure moment-timezone is imported
    const moment = require('moment-timezone');

    // Create a moment object from the Unix timestamp
    const date = moment.unix(timestamp);

    // Convert the moment object to GMT+7 timezone
    const dateInGMT7 = date.tz('Asia/Bangkok'); // Bangkok is in the GMT+7 timezone

    // Format the date and time as 'HH:mm - DD/MM/YYYY'
    const formattedString = dateInGMT7.format('HH:mm - DD/MM/YYYY');

    return formattedString;
  }

}
