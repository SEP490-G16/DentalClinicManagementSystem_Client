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
import { IsThisSecondPipe } from 'ngx-date-fns';
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
  patientAppointments: any[] = [];

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
    this.endDateTimestamp = this.dateToTimestamp("2023-02-20 23:59:59");
    this.selectedAppointment = {} as ISelectedAppointment
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.name = sessionStorage.getItem('patient');
    if (this.name) {
      this.name = JSON.parse(this.name);
      this.patientName = this.name.patient_name;
      this.id = this.name.patient_id;
    } else {
      this.patientService.getPatientById(this.id).subscribe((patient: any) => {
        this.patientName = patient.patient_name;
        sessionStorage.setItem('patient', JSON.stringify(patient));
      })
    }
    this.getAppointment();
  }

  newAppointment = {
    date: 0,
    appointments: [] as newApp[]
  }

  unqueList: any[] = [];
  unqueDate: string[] = [];
  listNewAppointment: any[] = [];
  getAppointment() {
    this.APPOINTMENT_SERVICE.getAppointmentByPatientId(this.id).subscribe(data => {
      var listResult = ConvertJson.processApiResponse(data);
      listResult.forEach((item: any) => {
        if (!this.unqueList.includes(item.procedure_attr.M.id.S)) {
          this.unqueList.push(item.procedure_attr.M.id.S);
          let newA = {
            procedure_id: item.procedure_attr.M.id.S,
            count: 1,
            details: [] as newDetail[]
          }
          let de = {
            appointment_id: item.SK.S,
            patient_id: item.patient_attr.M.id.S,
            patient_name: item.patient_attr.M.name.S,
            phone_number: item.patient_attr.M.phone_number.S,
            procedure_id: item.procedure_attr.M.id.S,
            procedure_name: item.procedure_attr.M.name.S,
            reason: item.reason_attr.S,
            doctor: item.doctor_attr.S,
            time: item.time_attr.N,
            patient_created_date: item.patient_attr.M.is_new == true ? '1' : '2',
            status: item.status_attr.N,
            attribute_name: '',
            epoch: item.SK.S.split('::')[0],
            migrated: item.migrated_attr.BOOL
          }
          newA.details.push(de);
          this.newAppointment.appointments.push(newA);
        } else {
          this.newAppointment.appointments.forEach((a: any) => {
            if (a.procedure_id == item.procedure_attr.M.id.S) {
              a.count++;
              let de = {
                appointment_id: item.SK.S,
                patient_id: item.patient_attr.M.id.S,
                patient_name: item.patient_attr.M.name.S,
                phone_number: item.patient_attr.M.phone_number.S,
                procedure_id: item.procedure_attr.M.id.S,
                procedure_name: item.procedure_attr.M.name.S,
                reason: item.reason_attr.S,
                doctor: item.doctor_attr.S,
                time: item.time_attr.N,
                patient_created_date: item.patient_attr.M.is_new == true ? '1' : '2',
                status: item.status_attr.N,
                attribute_name: '',
                epoch: item.SK.S.split('::')[0],
                migrated: item.migrated_attr.BOOL
              }
              a.details.push(de);
            }
          })
        }
      })
      this.patientAppointments.push(this.newAppointment);
      console.log(this.patientAppointments);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment/" + 1696925134 + "/" + this.endDateTimestamp, error);
      }
    );
  }

  setPatient() {
    this.Patient.patient_id = this.id;
    this.Patient.patient_name = this.patientAppointments[0].appointments[0].details[0].patient_name;
    this.Patient.phone_number = this.patientAppointments[0].appointments[0].details[0].phone_number;
  }

  openEditModal(detail: any, dateTimestamp: any) {

  }
  editAppointment(appointment: any, dateTimestamp: any) {
    this.dateString = this.timestampToDate(dateTimestamp);
    this.selectedAppointment = appointment;
    this.timeString = this.timestampToTime(appointment.time);
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  deleteAppointment(detail: any, dateTimestamp: any) {
    const formattedDate = this.timestampToDate(dateTimestamp)
    this.openConfirmationModal(`Bạn có chắc chắn muốn xoá lịch hẹn lúc ${this.timestampToTime(detail.time)} ${formattedDate} không?`).then((result) => {
      if (result) {
        this.APPOINTMENT_SERVICE.deleteAppointmentNew(detail.appointment_id)
          .subscribe((res) => {
            this.toastr.success('Xóa lịch hẹn thành công!');
            const index = this.patientAppointments.findIndex(item => item.appointment_id == detail.appointment_id);
            if (index != -1) {
              this.patientAppointments.splice(index, 1);
            }
          },
            (error) => {
              this.toastr.success('Xóa lịch hẹn thành công!');
              const index = this.patientAppointments.findIndex(item => item.appointment_id == detail.appointment_id);
              if (index != -1) {
                this.patientAppointments.splice(index, 1);
              }
            }
          )
      }
    });
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000,
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000,
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

  checkDate(date: any): boolean {
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
    const moment = require('moment-timezone');
    const date = moment.unix(timestamp);
    const dateInGMT7 = date.tz('Asia/Bangkok');
    const formattedString = dateInGMT7.format('HH:mm - DD/MM/YYYY');

    return formattedString;
  }

}

interface newApp {
  procedure_id: string,
  count: number,
  details: newDetail[]
}

interface newDetail {
  appointment_id: string,
  patient_id: string,
  phone_number: string,
  procedure_id: string,
  procedure_name: string,
  reason: string,
  doctor: string,
  time: string,
  patient_created_date: string,
  status: string,
  attribute_name: string,
  epoch: string,
  migrated: boolean
}
