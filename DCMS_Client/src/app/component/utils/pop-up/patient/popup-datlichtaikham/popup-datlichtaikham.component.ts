import { Component, OnInit, Renderer2, ViewChild, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { IAddAppointment, IAddAppointmentNew, RootObject } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import * as moment from 'moment-timezone';

import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgbDatepickerConfig,
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from "@ng-bootstrap/ng-bootstrap";

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import {ResponseHandler} from "../../../libs/ResponseHandler";
import { CognitoService } from 'src/app/service/cognito.service';
import { IPatient } from 'src/app/model/IPatient';
import { TimeKeepingService } from 'src/app/service/Follow-TimeKeepingService/time-keeping.service';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { SendMessageSocket } from 'src/app/component/shared/services/SendMessageSocket.service';

@Component({
  selector: 'app-popup-datlichtaikham',
  templateUrl: '../popup-datlichtaikham/popup-datlichtaikham.component.html',
  styleUrls: ['../../appointment/popup-add-appointment/popup-add-appointment.component.css']
})

@Injectable({
  providedIn: 'root'
})
export class PopupDatlichtaikhamComponent implements OnInit, OnChanges {
  phoneRegex = /^[0-9]{10}$|^[0-9]{4}\s[0-9]{3}\s[0-9]{3}$/;


  private itemsSource = new BehaviorSubject<any[]>([]);
  items = this.itemsSource.asObservable();
  isCheckProcedure: boolean = true;

  listGroupService: any[] = [];
  private intervalId: any;
  isCheck: boolean = false;
  //doctors: any[] = [];
  procedure: string = "1";
  reason:string = "";
  isPatientInfoEditable: boolean = false;

  loading: boolean = false;

  @Input() Patient:any;
  @Input() datesDisabled: any;
  @Input() filteredAppointments: any

  @Output() newItemEvent = new EventEmitter<any>();
  AppointmentBody: IAddAppointmentNew;
  appointmentTime = "";
  listFilter:any[] = [];
  model!: NgbDateStruct;
  datePickerJson = {};
  markDisabled: any;
  isDisabled: any;
  json = {
    disable: [6, 7],
    disabledDates: [
      { year: 2020, month: 8, day: 13 },
      { year: 2020, month: 8, day: 19 },
      { year: 2020, month: 8, day: 25 }
    ]
  };
  validateAppointment = {
    patientName: '',
    procedure: '',
    appointmentTime: '',
    appointmentDate: '',
  }

  // Set the minimum date to January 1, 1900
  minDate: NgbDateStruct = { year: 1900, month: 1, day: 1 };

  // Set the maximum date to 30 years from the current year
  maxDate: NgbDateStruct = this.calculateMaxDate();

  isSubmitted: boolean = false;

  currentDate: any;

  mindate: Date;
  minTime: string;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private cognito: CognitoService,
    private timeKeepingService: TimeKeepingService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private sendMessageSocket: SendMessageSocket
  ) {
    this.isDisabled = (
      date: NgbDateStruct
      //current: { day: number; month: number; year: number }
    ) => {
      return this.json.disabledDates.find(x =>
        (new NgbDate(x.year, x.month, x.day).equals(date))
        || (this.json.disable.includes(calendar.getWeekday(new NgbDate(date.year, date.month, date.day))))
      )
        ? true
        : false;
    };

    this.AppointmentBody = {
      epoch: 0,
      appointment: {
        patient_id: '',
        patient_name: '',
        phone_number: '',
        procedure_id: '1',
        procedure_name: '',
        reason: '',
        doctor_attr: '',
        status_attr: 2,
        time_attr: 0,
        is_new: true
      }
    } as IAddAppointmentNew;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.minTime = `${hours}:${minutes}`;
    this.mindate = new Date();

    const currentTime = new Date();

    // Set date time hiện tại
    const currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
    this.appointmentTime = currentTimeGMT7;

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    this.model = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };

    this.currentDate = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    }

  }


  ngOnChanges(changes: SimpleChanges): void {
   
  }

  startDate: any;
  endDate: string = "2023-12-31";


  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  ListAppointments: any;
  appointmentList: RootObject[] = [];
  dateEpoch: string = "";
  noDoctor = {
    sub_id: '',
    doctorName: 'Không chọn bác sĩ',
    phoneNumber: '',
    roleId: '',
    zoneInfo: ''
  }
  responseO: any;
  ngOnInit(): void {

    const id = this.route.snapshot.params['id'];
    const patient = sessionStorage.getItem('patient');
    if (patient != null){
      var patients = JSON.parse(patient);
      this.patientInfor = patients.patient_id +" - "+patients.patient_name+ " - "+patients.phone_number;
    }
    this.getListGroupService();
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;

    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7);
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);
  }

  calculateMaxDate(): NgbDateStruct {
    const currentYear = new Date().getFullYear();
    return { year: currentYear + 30, month: 12, day: 31 };
  }

  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.listGroupService = res.data;
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url + "/medical-procedure-group", error);
      }
    )
  }

  getDisableDate() {
    var today = new Date();
    var date = today.getFullYear() + ' - ' + (today.getMonth() + 1) + ' - ' + today.getDate();
    var time = today.getHours() + ' - ' + today.getMinutes() + ' - ' + today.getSeconds();
    var dateTime = date + ' ' + time;
  }

  doctorObject = {
    sub_id: '',
    doctorName: '',
    phoneNumber: '',
    roleId: '',
    zoneInfo: ''
  }


  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  phoneErr: string = "";

  patientList: any[] = [];
  patientInfor: any;
  onsearch(event: any) {
    console.log(event.target.value)
    this.AppointmentBody.appointment.patient_name = event.target.value;
    this.PATIENT_SERVICE.getPatientByName(this.AppointmentBody.appointment.patient_name, 1).subscribe(data => {
      const transformedMaterialList = data.data.map((item: any) => {
        return {
          patientId: item.patient_id,
          patientName: item.patient_name,
          patientInfor: item.patient_id + " - " + item.patient_name + " - " + item.phone_number,
        };
      });
      this.patientList = transformedMaterialList;
    })
  }

  appointmentDate: string = '';

  addItem(newItem: any) {
    this.itemsSource.next([...this.itemsSource.value, newItem]);
  }

  newAppointment = {
    date: 0,
    appointments: [] as newApp[]
  }

  unqueList: any[] = [];
  listNewAppointment: any[] = [];
  listDate: any[] = [];
  dateDis = {
    date: 0,
    procedure: '',
    count: 0,
  }
  onPostAppointment() {
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0');
    const selectedDay = this.model.day.toString().padStart(2, '0');
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    const now = new Date();
    const currDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    this.AppointmentBody.epoch = this.dateToTimestamp(selectedDate);
    this.AppointmentBody.appointment.time_attr = this.timeToTimestamp(this.appointmentTime);
    this.listGroupService.forEach(e => {
      if (e.medical_procedure_group_id == this.procedure) {
        this.AppointmentBody.appointment.procedure_name = e.name;
      }
    })
    this.AppointmentBody.appointment.procedure_id = this.procedure;
    // Gọi API POST
    this.resetValidate();
    if (this.patientInfor == '' || this.patientInfor == null) {
      this.validateAppointment.patientName = "Vui lòng chọn bệnh nhân!";
      this.isSubmitted = true;
      this.loading = false;
      return;
    }

    if (this.AppointmentBody.appointment.procedure_id == "1") {
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
      this.isSubmitted = true;
      this.loading = false;
      return;
    }
    const currentTime = new Date().toTimeString();
    const currentDate = moment().format('YYYY-MM-DD');
    var store = localStorage.getItem("listGroupService");
    if (store != null) {
      this.listGroupService = JSON.parse(store);
    }

    let procedureNameSelected;

    if (this.procedure != "1") {
      this.APPOINTMENT_SERVICE.getAppointmentListNew(1, this.dateToTimestamp(selectedDate)).subscribe((data) => {
        var listResult = ConvertJson.processApiResponse(data);
        console.log("check data:", data)
        listResult.forEach((item: any) => {
          this.newAppointment.date = this.dateToTimestamp(selectedDate);
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
              epoch: '',
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
                  epoch: '',
                  migrated: item.migrated_attr.BOOL
                }
                a.details.push(de);
              }
            })
          }
        })
        this.listFilter.push(this.newAppointment);
        this.listFilter.forEach((a: any) => {
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
      })

      this.datesDisabled.forEach((date: any) => {
        this.listGroupService.forEach((it: any) => {
          if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure && it.medical_procedure_group_id == this.procedure && it.name == 'Điều trị tủy răng') {
            if (date.count >= 4) {
              alert("vô nha")
              procedureNameSelected = "Điều trị tủy răng";
              this.isCheckProcedure = false;
            }
          } else if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure && it.medical_procedure_group_id == this.procedure && it.name == 'Chỉnh răng') {
            if (date.count >= 8) {
              procedureNameSelected = "Chỉnh răng";
              this.isCheckProcedure = false;
            }
          } else if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure && it.medical_procedure_group_id == this.procedure && it.name == 'Nhổ răng khôn') {
            if (date.count >= 2) {
              procedureNameSelected = "Nhổ răng khôn";
              this.isCheckProcedure = false;
            }
          }
        })
      })
    }

    if (selectedDate == '') {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khám!";
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (selectedDate < currentDate) {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày lớn hơn ngày hiện tại";
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (!this.isCheckProcedure) {
      if (!window.confirm(`Thủ thuật ${this.procedure} mà bạn chọn đã có đủ số lượng người trong trong ngày ${selectedDate}. Bạn có muốn tiếp tục?`)) {
        this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khác";
        return;
      }
    }

    const patientInfor = this.patientInfor.split(' - ');
    this.AppointmentBody.appointment.patient_id = patientInfor[0];
    this.AppointmentBody.appointment.patient_name = patientInfor[1];
    this.AppointmentBody.appointment.phone_number = patientInfor[2];
    var checkPatient = true;
    this.listFilter.forEach((appo: any) => {
      appo.appointments.forEach((deta: any) => {
        deta.details.forEach((res: any) => {
          if (res.patient_id === this.AppointmentBody.appointment.patient_id) {
            this.validateAppointment.patientName = `Bệnh nhân đã đặt lịch hẹn trong ngày ${selectedDate} !`;
            checkPatient = false;
            return;
          }
        })
      })
    })

    if (!checkPatient) {
      return;
    }

    if (this.appointmentTime == '') {
      this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám!";
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (this.appointmentTime != '' && selectedDate <= currentDate) {
      if ((currentDate + " " + this.appointmentTime) < (currentDate + " " + currentTime)) {
        this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám lớn hơn!";
        this.isSubmitted = true;
        this.loading = false;
        return;
      }
    }

    this.AppointmentBody.appointment.reason = this.reason;
    const storeLi = localStorage.getItem('listSearchPatient');
    var ListPatientStore = [];
    if (storeLi != null) {
      ListPatientStore = JSON.parse(storeLi);
    }
    if (ListPatientStore.length != 0) {
      ListPatientStore.forEach((item: any) => {
        if (item.patientId == this.AppointmentBody.appointment.patient_id) {
          if (item.patientDescription != null && item.patientDescription.includes('@@isnew##')) {
            this.AppointmentBody.appointment.is_new = true;
          } else {
            this.AppointmentBody.appointment.is_new = false;
          }
        }
      })
    }
    this.APPOINTMENT_SERVICE.postAppointmentNew(this.AppointmentBody).subscribe(
      (response) => {
        if (selectedDate == this.startDate) {
          this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'plus', 'app');
        }
        this.showSuccessToast('Lịch hẹn đã được tạo thành công!');
        let ref = document.getElementById('cancel-appointment');
        ref?.click();
        const newDetail: any = {
          appointment_id: response.appointment_id,
          patient_id: this.AppointmentBody.appointment.patient_id,
          patient_name: this.AppointmentBody.appointment.patient_name,
          phone_number: (this.AppointmentBody.appointment.phone_number),
          procedure: (this.AppointmentBody.appointment.procedure_id),
          procedure_name: this.AppointmentBody.appointment.procedure_name,
          doctor: this.AppointmentBody.appointment.doctor_attr,
          time: this.AppointmentBody.appointment.time_attr,
          reason: this.AppointmentBody.appointment.reason,
          status: this.AppointmentBody.appointment.status_attr,
          patient_created_date: this.AppointmentBody.appointment.is_new,
          migrated: 'false'
        };
        this.AppointmentBody = {
          epoch: 0,
          appointment: {
            patient_id: '',
            patient_name: '',
            phone_number: '',
            procedure_id: '1',
            procedure_name: '',
            reason: '',
            doctor_attr: '',
            status_attr: 2,
            time_attr: 0,
            is_new: true
          }
        } as IAddAppointmentNew;
        this.patientInfor = '';
        this.reason = '';
        const currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
        this.appointmentTime = currentTimeGMT7;
        this.procedure = '1';
        window.location.reload();
      },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment", error);
      }
    );
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; 
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timeToTimestamp(timeStr: string): number {
    const time = moment(timeStr, "HH:mm:ss");
    const timestamp = time.unix(); // Lấy timestamp tính bằng giây
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm');
    return dateTimeString;
  }


  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD';
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  convertTimestampToDateString(timestamp: number): string {
    return moment(timestamp).format('YYYY-MM-DD');
  }

  convertTimestampToVNDateString(timestamp: number): string {
    return moment(timestamp).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
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

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }

  close() {
    this.AppointmentBody = {
      epoch: 0,
      appointment: {
        patient_id: '',
        patient_name: '',
        phone_number: '',
        procedure_id: '1',
        procedure_name: '',
        reason: '',
        doctor_attr: '',
        status_attr: 2,
        time_attr: 0,
        is_new: true
      }
    } as IAddAppointmentNew;
  }

  private resetValidate() {
    this.validateAppointment = {
      patientName: '',
      procedure: '',
      appointmentTime: '',
      appointmentDate: '',
    }
    this.isSubmitted = true;
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