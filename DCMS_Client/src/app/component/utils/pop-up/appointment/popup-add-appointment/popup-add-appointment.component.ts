import { Component, OnInit, Renderer2, ViewChild, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { IAddAppointment, RootObject } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import * as moment from 'moment-timezone';

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

@Component({
  selector: 'app-popup-add-appointment',
  templateUrl: './popup-add-appointment.component.html',
  styleUrls: ['./popup-add-appointment.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PopupAddAppointmentComponent implements OnInit, OnChanges {
  phoneRegex = /^[0-9]{10}$|^[0-9]{4}\s[0-9]{3}\s[0-9]{3}$/;


  private itemsSource = new BehaviorSubject<any[]>([]);
  items = this.itemsSource.asObservable();
  isCheckProcedure: boolean = true;

  listGroupService: any[] = [];
  private intervalId: any;
  isCheck: boolean = false;
  //doctors: any[] = [];
  procedure: string = "1";
  isPatientInfoEditable: boolean = false;

  loading: boolean = false;

  @Input() datesDisabled: any;
  @Input() filteredAppointments: any

  @Output() newItemEvent = new EventEmitter<any>();
  AppointmentBody: IAddAppointment;
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
  seedDateDisabled = [
    {
      "date": 1698836571,
      "appointments": [
        {
          "procedure": 1,
          "count": 16,
          "details": [
            {
              appointment_id: "6e005b74-dc60-4ad9-9a4f-11954b94c2a7",
              patient_id: "P-000001",
              patient_name: "Nguyễn Văn An",
              phone_number: "0123456789", procedure: 1,
              doctor: "Bác sĩ A",
              time: "1698688620",
              attribute_name: "",
              epoch: 0,
              migrated: "false"
            }
          ]
        }
      ]
    },
    {
      "date": 1698836571,
      "appointments": [
        {
          "procedure": 1,
          "count": 16,
          "details": [
            {
              appointment_id: "6e005b74-dc60-4ad9-9a4f-11954b94c2a7",
              patient_id: "P-000001",
              patient_name: "Nguyễn Văn An",
              phone_number: "0123456789", procedure: 1,
              doctor: "Bác sĩ A",
              time: "1698688620",
              attribute_name: "",
              epoch: 0,
              migrated: "false"
            }
          ]
        }
      ]
    },
  ]

  currentDate: any;

  mindate: Date;
  minTime: string;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private cognito: CognitoService,
    private timeKeepingService: TimeKeepingService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService
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
      epoch: 0,    //x
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure_id: "1",
        procedure_name: '', //x
        doctor: '', //x
        status: 2,
        time: 0  //x
      }
    } as IAddAppointment;

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
    console.log("mới", this.model);
    console.log(this.appointmentDate);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (this.datesDisabled && this.datesDisabled.length == 0) {
    }
    if (changes['datesDisabled'] && this.datesDisabled && this.datesDisabled.length > 0) {
      this.datesDisabled = this.datesDisabled.map((timestamp: number) => {
        const date = new Date(timestamp * 1000); // Chuyển đổi timestamp sang date
        return date.toISOString().slice(0, 10); // Lấy phần yyyy-MM-dd
      });
      console.log("Date Parse: ", this.datesDisabled);
    }

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
  ngOnInit(): void {
    this.getListGroupService();
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;

    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7);
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);
    this.getListAppountment();
    this.selectDateToGetDoctor("2023-11-22");
  }
  getListAppountment() {
    this.startDateTimestamp = this.dateToTimestamp(this.startDate);
    this.APPOINTMENT_SERVICE.getAppointmentList(this.startDateTimestamp, this.endDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      this.ListAppointments = this.appointmentList.filter(app => app.date === this.startDateTimestamp);
      this.ListAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
    })
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

  listDoctor: any[] = [];
  listDoctorDisplay: any[] = [];
  getListDoctor() {
    this.cognito.getListStaff().subscribe((res) => {
      this.listDoctor = res.message;
      this.listDoctorDisplay.splice(0, this.listDoctorDisplay.length);
      this.listDoctor.forEach((staff: any) => {
        staff.Attributes.forEach((attr: any) => {
          if (attr.Name == 'custom:role') {
            this.doctorObject.roleId = attr.Value;
          }
          if (attr.Name == 'sub') {
            this.doctorObject.sub_id = attr.Value;
          }
          if (attr.Name == 'name') {
            this.doctorObject.doctorName = attr.Value;
          }
          if (attr.Name == 'phone_number') {
            this.doctorObject.phoneNumber = attr.Value;
          }
          if (attr.Name == 'zoneinfo') {
            this.doctorObject.zoneInfo = attr.Value;
          }
        })
        if (this.doctorObject.roleId == "2") {
          this.listDoctorDisplay.push(this.doctorObject);
        }
        this.doctorObject = {
          sub_id: '',
          doctorName: '',
          phoneNumber: '',
          roleId: '',
          zoneInfo: ''
        }
      })
    })
  }


  listRegisterTime: any[] = [];
  uniqueList: string[] = [];
  listDoctorFilter: any[] = [];
  totalDoctorFilter: number = 0;

  selectDateToGetDoctor(date: any) {
    this.getListDoctor();
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    this.timeKeepingService.getFollowingTimekeeping(this.dateToTimestamp(selectedDate + " 00:00:00"), this.dateToTimestamp(selectedDate + " 23:59:59")).subscribe(data => {
      this.listRegisterTime = this.organizeData(data);
      this.listDoctorFilter.splice(0, this.listDoctorFilter.length);
      this.listRegisterTime.forEach((res: any) => {
        res.records.forEach((doc: any) => {
          if (doc.details.register_clock_in < this.timeToTimestamp(date) && this.timeToTimestamp(date) < doc.details.register_clock_out) {
            if (!this.uniqueList.includes(doc.subId)) {
              this.uniqueList.push(doc.subId);
              let newDoctorInfor = {
                doctorId: doc.subId,
                docterName: doc.details.staff_name
              }
              this.listDoctorFilter.push(newDoctorInfor);
            }
          }
        })
      })
    });

    this.listDoctorDisplay.forEach((item: any) => {
      console.log(item);
      const zone = item.zoneInfo.split(',');
      var count = 0;
      zone.forEach((zo: any) => {
        if (zo == this.procedure) {
          count++;
        }
      })
      if (count == 0) {
        const index = this.listDoctorFilter.findIndex((it: any) => it.doctorId = item.sub_id);
        if (index != -1) {
          this.listDoctorFilter.splice(index, 1);
        }
      }
    })
    this.totalDoctorFilter = this.listDoctorFilter.length;
    console.log("aaa", this.listDoctorFilter)
    this.listDoctorFilter.push(this.noDoctor);
  }

  organizeData(data: any[]): TimekeepingRecord[] {
    return data.map((item): TimekeepingRecord => {
      const timekeepingEntry: TimekeepingRecord = {
        epoch: item.epoch?.N,
        type: item.type?.S,
        records: []
      };

      Object.keys(item).forEach((key: string) => {
        if (key !== 'epoch' && key !== 'type') {
          const details: TimekeepingDetail = {
            register_clock_in: item[key]?.M?.register_clock_in?.N,
            register_clock_out: item[key]?.M?.register_clock_out?.N,
            staff_name: item[key]?.M?.staff_name?.S,
          };
          timekeepingEntry.records.push({
            subId: key,
            details: details
          });
        }
      });

      return timekeepingEntry;
    });
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

  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    if (doctor.doctorName == this.selectedDoctor) {
      this.selectedDoctor = "";
    } else {
      ;
      this.selectedDoctor = doctor.doctorName;
      this.AppointmentBody.appointment.doctor = doctor.doctorName;
    }

  }

  appointmentDate: string = '';

  addItem(newItem: any) {
    this.itemsSource.next([...this.itemsSource.value, newItem]);
  }


  onPostAppointment() {
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    console.log(selectedDate); // Đây là ngày dưới dạng "YYYY-MM-DD"

    this.AppointmentBody.epoch = this.dateToTimestamp(selectedDate);
    this.AppointmentBody.appointment.time = this.timeToTimestamp(this.appointmentTime);
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
    console.log("Heree", currentDate);

    if (this.procedure != "1") {
      this.datesDisabled.forEach((date: any) => {
        if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure)
          if (date.count >= 8) {
            this.isCheckProcedure = false;
          }
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
      if (!window.confirm("Thủ thuật mà bạn chọn đã có đủ 8 người trong trong ngày đó. Bạn có muốn tiếp tục?")) {
        this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khác";
        return;
      }
    }

    const patientInfor = this.patientInfor.split(' - ');
    this.AppointmentBody.appointment.patient_id = patientInfor[0];
    this.AppointmentBody.appointment.patient_name = patientInfor[1];
    this.AppointmentBody.appointment.phone_number = patientInfor[2];
    this.loading = true;
    console.log(this.filteredAppointments);
    this.filteredAppointments.forEach((appo: any) => {
      appo.appointments.forEach((deta: any) => {
        deta.details.forEach((res: any) => {
          if (res.patient_id == this.AppointmentBody.appointment.patient_id) {
            this.validateAppointment.patientName = `Bệnh nhân đã lịch hẹn trong ngày ${selectedDate} !`;
            this.isSubmitted = true;
            this.loading = false;
            return;
          }
        })
      })
    })
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
    else {
      this.phoneErr = "";

      this.APPOINTMENT_SERVICE.postAppointment(this.AppointmentBody).subscribe(
        (response) => {
          this.loading = false;
          console.log('Lịch hẹn đã được tạo:', response);
          this.showSuccessToast('Lịch hẹn đã được tạo thành công!');
          this.procedure = '';
          this.appointmentTime = '';
          this.newItemEvent.emit(this.AppointmentBody);
          this.AppointmentBody = {
            epoch: 0,
            appointment: {
              patient_id: '',
              patient_name: '',
              phone_number: '',
              procedure_id: "1",
              procedure_name: '',
              doctor: '',
              status: 2,
              time: 0
            }
          } as IAddAppointment;
          window.location.reload();
        },
        (error) => {
          this.loading = false;
          console.error('Lỗi khi tạo lịch hẹn:', error);
          //this.showErrorToast('Lỗi khi tạo lịch hẹn!');
          ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment", error);
        }
      );
    }
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
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
    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
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
      epoch: 0,    //x
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure_id: "1",
        procedure_name: '',  //x
        doctor: '', //x,
        status: 2,
        time: 0  //x
      }
    } as IAddAppointment;
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

interface TimekeepingDetail {
  register_clock_in?: string;
  register_clock_out?: string;
  staff_name?: string;
}
interface TimekeepingSubRecord {
  subId: string;
  details: TimekeepingDetail;
}

interface TimekeepingRecord {
  epoch: string;
  type?: string;
  records: TimekeepingSubRecord[];
}
