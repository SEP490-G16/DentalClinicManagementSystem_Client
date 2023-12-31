import { Component, OnInit, Renderer2, ViewChild, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { Appointment, Detail, IAddAppointment, IAddAppointmentNew, RootObject } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import * as moment from 'moment-timezone';
//import { setTimeout } from 'timers';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
  NgbDatepickerConfig,
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { CognitoService } from 'src/app/service/cognito.service';
import { TimeKeepingService } from 'src/app/service/Follow-TimeKeepingService/time-keeping.service';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { IsThisSecondPipe } from 'ngx-date-fns';

import { SendMessageSocket } from 'src/app/component/shared/services/SendMessageSocket.service';

import { Normalize } from 'src/app/service/Lib/Normalize';


@Component({
  selector: 'app-popup-add-appointment',
  templateUrl: './popup-add-appointment.component.html',
  styleUrls: ['./popup-add-appointment.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PopupAddAppointmentComponent implements OnInit {
  phoneRegex = /^[0-9]{10}$|^[0-9]{4}\s[0-9]{3}\s[0-9]{3}$/;

  time = { hour: 13, minute: 20 }
  private itemsSource = new BehaviorSubject<any[]>([]);
  items = this.itemsSource.asObservable();
  isCheckProcedure: boolean = true;
  reason: any;
  isAddOld: boolean = false;
  listGroupService: any[] = [];
  isCheck: boolean = false;
  procedure: string = "1";
  isPatientInfoEditable: boolean = false;
  isAdd: boolean = false;
  isSubmittedPatient: boolean = false;
  loading: boolean = false;
  datesDisabled: any[] = [];
  listDate: any[] = [];
  dateDis = {
    date: 0,
    procedure: '',
    count: 0,
  }
  // @Input() datesDisabled: any;
  @Input() selectedDateCache: any;
  @Input() filteredAppointments: any
  @Output() newItemEvent = new EventEmitter<any>();
  @Output() newAppointmentAdded = new EventEmitter<any>();
  AppointmentBody: IAddAppointmentNew;
  appointmentTime = "";
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
  isSubmitted: boolean = false;
  currentDate: any;
  mindate: Date;

  // Set the minimum date to January 1, 1900
  minDate: NgbDateStruct = { year: 1900, month: 1, day: 1 };

  // Set the maximum date to 30 years from the current year
  maxDate: NgbDateStruct = this.calculateMaxDate();

  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private toastr: ToastrService,
    private calendar: NgbCalendar,
    private sendMessageSocket: SendMessageSocket
  ) {
    this.isDisabled = (
      date: NgbDateStruct
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
        status_attr: 4,
        time_attr: 0,
        is_new: true
      }
    } as IAddAppointmentNew;

    const now = new Date();
    this.mindate = new Date();
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

  calculateMaxDate(): NgbDateStruct {
    const currentYear = new Date().getFullYear();
    return { year: currentYear + 30, month: 12, day: 31 };
  }

  startDate: any;
  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  ListAppointments: any;
  appointmentList: RootObject[] = [];
  dateEpoch: string = "";

  patientSessionStorage: any;
  ngOnInit(): void {
    this.getListGroupService();
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;
    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7);

    this.patientSessionStorage = sessionStorage.getItem('patient');
    if (this.patientSessionStorage) {
      this.patientSessionStorage = JSON.parse(this.patientSessionStorage);
    }
  }

  getListGroupService() {
    var storeList = localStorage.getItem("listGroupService");
    if (storeList != null) {
      this.listGroupService = JSON.parse(storeList);
    }
  }

  patientList: any[] = [];
  patientInfor: any;
  searchTimeout: any;
  isSearching: boolean = false;
  notFoundMessage: string = 'Không tìm thấy bệnh nhân';
  onsearch(event: any) {
    clearTimeout(this.searchTimeout);
    this.isSearching = true;
    let searchTermWithDiacritics = Normalize.normalizeDiacritics(event.target.value);
    if (this.isSearching) {
      this.notFoundMessage = 'Đang tìm kiếm...';
      this.searchTimeout = setTimeout(() => {
        this.AppointmentBody.appointment.patient_name = searchTermWithDiacritics;

        searchTermWithDiacritics = searchTermWithDiacritics.toLowerCase().trim();
        searchTermWithDiacritics = searchTermWithDiacritics.replace(/\s+/g, '-');

        this.PATIENT_SERVICE.getPatientByName(searchTermWithDiacritics, 1).subscribe(data => {
          const transformedMaterialList = data.data.map((item: any) => {
            return {
              patientId: item.patient_id,
              patientName: item.patient_name,
              patientInfor: item.patient_id + " - " + item.patient_name + " - " + item.phone_number,
              patientDescription: item.description
            };
          });
          this.patientList = transformedMaterialList;
          localStorage.setItem("listSearchPatient", JSON.stringify(this.patientList));
        });
      }, 500);
      if (this.patientList.length == 0) {
        this.notFoundMessage = 'Không tìm thấy bệnh nhân';
      }
      this.isSearching = false;
    } else {
      this.notFoundMessage = 'Không tìm thấy bệnh nhân';
      this.isSearching = false;
    }
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
  isCallApi: boolean = false;
  onPostAppointment() {
    this.isCallApi = true;

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
      this.isCallApi = false;
      this.loading = false;
      return;
    }

    if (this.AppointmentBody.appointment.procedure_id == "1") {
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
      this.isSubmitted = true;
      this.isCallApi = false;

      this.loading = false;
      return;
    }
    const currentTime = new Date().toTimeString();
    const currentDate = moment().format('YYYY-MM-DD');
    var store = localStorage.getItem("listGroupService");
    if (store != null) {
      this.listGroupService = JSON.parse(store);
    }

    console.log("check list group: ", this.listGroupService);

    let procedureNameSelected;

    if (this.procedure != "1") {
      this.APPOINTMENT_SERVICE.getAppointmentListNew(1, this.dateToTimestamp(selectedDate)).subscribe((data) => {
        var listResult = ConvertJson.processApiResponse(data);
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
        this.filteredAppointments.push(this.newAppointment);
        this.filteredAppointments.forEach((a: any) => {
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
          if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure && it.medical_procedure_group_id == this.procedure) {
            if (date.count >= 4) {
              procedureNameSelected = "Điều trị tủy răng";
              this.isCheckProcedure = false;
            }
          } else if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure && it.medical_procedure_group_id == this.procedure && it.name == 'Nắn chỉnh răng') {
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
      this.isCallApi = false;

      this.loading = false;
      return;
    } else if (selectedDate < currentDate) {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày lớn hơn ngày hiện tại";
      this.isSubmitted = true;
      this.isCallApi = false;

      this.loading = false;
      return;
    } else if (!this.isCheckProcedure) {
      if (!window.confirm(`Thủ thuật ${this.procedure} mà bạn chọn đã có đủ số lượng người trong trong ngày ${selectedDate}. Bạn có muốn tiếp tục?`)) {
        this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khác";
        this.isCallApi = false;

        return;
      }
    }

    const patientInfor = this.patientInfor.split(' - ');
    this.AppointmentBody.appointment.patient_id = patientInfor[0];
    this.AppointmentBody.appointment.patient_name = patientInfor[1];
    this.AppointmentBody.appointment.phone_number = patientInfor[2];
    var checkPatient = true;
    this.filteredAppointments.forEach((appo: any) => {
      appo.appointments.forEach((deta: any) => {
        deta.details.forEach((res: any) => {
          if (res.migrated == false) {
            if (res.patient_id === this.AppointmentBody.appointment.patient_id) {
              this.validateAppointment.patientName = `Bệnh nhân đã đặt lịch hẹn trong ngày ${selectedDate} !`;
              this.isCallApi = false;
              checkPatient = false;
              return;
            }
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
      this.isCallApi = false;

      this.loading = false;
      return;
    } else if (this.appointmentTime != '' && selectedDate <= currentDate) {
      if ((currentDate + " " + this.appointmentTime) < (currentDate + " " + currentTime)) {
        this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám lớn hơn!";
        this.isSubmitted = true;
        this.isCallApi = false;
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
        this.isCallApi = false;

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

        // if (this.selectedDateCache === selectedDate) {
        //   const appointmentIndex = this.filteredAppointments.findIndex((a: any) => a.date === this.AppointmentBody.epoch);
        //   if (appointmentIndex !== -1) {
        //     this.filteredAppointments[appointmentIndex].appointments.push({
        //       procedure: this.AppointmentBody.appointment.procedure_id,
        //       count: 1,
        //       details: [newDetail]
        //     });
        //   } else {
        //     const newAppointment: any = {
        //       procedure: this.AppointmentBody.appointment.procedure_id,
        //       count: 1,
        //       details: [newDetail]
        //     };
        //     this.filteredAppointments.push({
        //       date: this.AppointmentBody.epoch,
        //       appointments: [newAppointment]
        //     });
        //   }
        //   this.newAppointmentAdded.emit(this.filteredAppointments);
        //   this.procedure = '';
        //   this.appointmentTime = '';
        //   //this.newItemEvent.emit(this.AppointmentBody);
        // }
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
            status_attr: 4,
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
        this.isCallApi = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment", error);
      }
    );
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm';
    const timeZone = 'Asia/Ho_Chi_Minh';
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timeToTimestamp(timeStr: string): number {
    const time = moment(timeStr, "HH:mm:ss", "Asia/Ho_Chi_Minh");
    const timestamp = time.unix();
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm');
    return dateTimeString;
  }


  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD'; // Định dạng của chuỗi ngày và thời gian const format = 'YYYY-MM-DD HH:mm'
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
      timeOut: 3000,
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000,
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
        status_attr: 4,
        time_attr: 0,
        is_new: true
      }
    } as IAddAppointmentNew;
    this.isAddOld = false;
    this.isAdd = false;
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

  toggleAdd() {
    this.isAdd = true;
    this.isAddOld = true;
  }
  toggleAddOld() {
    this.isAddOld = true;
    this.isAdd = false;
  }
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
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
