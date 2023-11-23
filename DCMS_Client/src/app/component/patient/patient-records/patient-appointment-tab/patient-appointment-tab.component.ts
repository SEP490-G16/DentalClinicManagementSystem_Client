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
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { IPatient } from 'src/app/model/IPatient';
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
  selectedAppointment: ISelectedAppointment;
  dateDis = { date: 0, procedure: '', count: 0, }
  model!: NgbDateStruct;
  appointmentList: RootObject[] = [];
  datesDisabled: any[] = [];
  listDate: any[] = [];
  constructor(
    private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private commonService: CommonService,
    private router: Router,
    private toastr: ToastrService) {

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDateTimestamp = this.dateToTimestamp2(currentDateGMT7);
    console.log("Hum nay: ", this.currentDateTimestamp);
    this.endDateTimestamp = this.dateToTimestamp("2023-12-31");
    this.selectedAppointment = {} as ISelectedAppointment
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.getAppointment();
  }

  getAppointment() {
    this.APPOINTMENT_SERVICE.getAppointmentList(1696925134, this.endDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      console.log("Appointment List: ", this.appointmentList);
      this.patientAppointments = this.appointmentList.filter(appointment =>
        appointment.appointments.some(app =>
          app.details.some(detail =>
            detail.patient_id === this.id
          )
        )
      );
      this.patientAppointments.sort((a: any, b: any) => b.date - a.date);
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
  editAppointment(detail: any, dateTimestamp: any) {
    this.dateString = this.convertTimestampToDateString(dateTimestamp);
    this.timeString = this.timestampToGMT7String(detail.time);
    console.log("DateString: ", this.dateString);
    console.log("TimeString: ", this.timeString);
    this.selectedAppointment = detail;
  }

  deleteAppointment(detail: any, dateTimestamp: any) {

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
}
