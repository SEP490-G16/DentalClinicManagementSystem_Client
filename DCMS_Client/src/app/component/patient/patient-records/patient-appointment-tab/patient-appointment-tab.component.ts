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
  Patient: IPatient = {} as IPatient;
  patientAppointments: any;
  dateString: any;
  timeString: any;
  patientName: any;
  name: any
  selectedAppointment: ISelectedAppointment;
  dateDis = { date: 0, procedure: '', count: 0, }
  model!: NgbDateStruct;
  appointmentList: RootObject[] = [];
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
    this.endDateTimestamp = this.dateToTimestamp("2023-01-15 23:59:59");
    this.selectedAppointment = {} as ISelectedAppointment
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getAppointment();
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.name = sessionStorage.getItem('patient');
    if (this.name) {
      this.name = JSON.parse(this.name);
      this.patientName = this.name.patient_name;
    }

    // const startDate = moment().tz('Asia/Ho_Chi_Minh').subtract(15, 'days').startOf('day');
    // const endDate = moment().tz('Asia/Ho_Chi_Minh').add(15, 'days').endOf('day');
    // this.currentDateTimestamp = startDate.unix();
    // this.endDateTimestamp = endDate.unix();

    // console.log("Start Date Timestamp:", this.currentDateTimestamp);
    // console.log("End Date Timestamp:", this.endDateTimestamp);
  }

  getAppointment() {
    this.APPOINTMENT_SERVICE.getAppointmentList(1702684800, this.endDateTimestamp).subscribe(data => {
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
      this.appointmentDateInvalid();
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment/" + 1696925134 + "/" + this.endDateTimestamp, error);
      }
    );
  }

  appointmentDateInvalid() {
    var today = new Date();
    var date = today.getFullYear() + ' - ' + (today.getMonth() + 1) + ' - ' + today.getDate();
    var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var dateTime = date + ' ' + "00:00:00";
    var startTime = this.dateToTimestamp(dateTime);
    var endTime = this.dateToTimestamp(today.getFullYear() + ' - ' + (today.getMonth() + 1) + ' - ' + (today.getDate() + 4) + ' ' + "23:59:59");
    this.APPOINTMENT_SERVICE.getAppointmentList(startTime, endTime).subscribe(data => {
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
        ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment/" + startTime + "/" + endTime, error);
      })
  }
  setPatient() {
    this.Patient.patient_id = this.id;
    this.Patient.patient_name = this.patientAppointments[0].appointments[0].details[0].patient_name;
    this.Patient.phone_number = this.patientAppointments[0].appointments[0].details[0].phone_number;
  }

  openEditModal(detail: any, dateTimestamp: any) {

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
  deleteAppointment(detail: any, dateTimestamp: any) {
    // this.APPOINTMENT_SERVICE.deleteAppointment(dateTimestamp, detail.appointment_id).subscribe(response => {
    //   console.log("Xóa thành công");
    //   this.showSuccessToast('Xóa lịch hẹn thành công!');
    //   window.location.reload();
    // }, error => {
    //   this.showErrorToast("Lỗi khi cập nhật");
    //   this.showErrorToast("Lỗi khi xóa");
    // });

    const formattedDate = this.datePipe.transform(this.timestampToDate(dateTimestamp), 'dd-MM-yyyy');
    this.openConfirmationModal(`Bạn có chắc chắn muốn xoá lịch hẹn lúc ${this.timestampToTime(detail.time)} ${formattedDate} không?`).then((result) => {
      if (result) {
        this.APPOINTMENT_SERVICE.deleteAppointment(dateTimestamp, detail.appointment_id)
          .subscribe((res) => {
            this.toastr.success('Xóa lịch hẹn thành công!');
            window.location.reload();
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
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
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
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
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
    const dateStr = date.format('YYYY-MM-DD');
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
