import { IEditAppointmentBody, IEditAppointmentBodyNew, ISelectedAppointment, RootObject } from '../../../../../model/IAppointment';
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment-timezone';

import {
  NgbDatepickerConfig,
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from "@ng-bootstrap/ng-bootstrap";
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { IPatient } from 'src/app/model/IPatient';
import { CognitoService } from 'src/app/service/cognito.service';
import { TimeKeepingService } from 'src/app/service/Follow-TimeKeepingService/time-keeping.service';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-popup-sualichtaikham',
  templateUrl: '../popup-sualichtaikham/popup-sualichtaikham.component.html',
  styleUrls: ['../../appointment/popup-edit-appointment/popup-edit-appointment.component.css']
})

export class PopupSualichtaikhamComponent implements OnInit, OnChanges {
  isCallApi: boolean = false;
  loading: boolean = false;
  isCheckProcedure: boolean = true;

  @Input() selectedAppointment: any;
  @Input() dateString: any;
  @Input() timeString: any;
  @Input() filteredAppointments: any[] = [];

  @Input() datesDisabled: any;

  isDatepickerOpened: boolean = false;
  EDIT_APPOINTMENT_BODY: IEditAppointmentBodyNew
  isPatientInfoEditable: boolean = false;
  listGroupService: any[] = [];
  model!: NgbDateStruct;
  currentDate!: NgbDateStruct;
  datePickerJson = {};
  markDisabled: any;
  json = {
    disable: [6, 7],
    disabledDates: [
      { year: 2020, month: 8, day: 13 },
      { year: 2020, month: 8, day: 19 },
      { year: 2020, month: 8, day: 25 }
    ]
  };
  isDisabled: any;
  validateAppointment = {
    patientName: '',
    phoneNumber: '',
    procedure: '',
    appointmentTime: '',
    appointmentDate: '',
  }
  isSubmitted: boolean = false;
  minDate: Date;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private cognito: CognitoService,
    private timeKeepingService: TimeKeepingService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService
  ) {
    this.EDIT_APPOINTMENT_BODY = {
      epoch: 0,
      new_epoch: 0,
      appointment: {
        patient_id: '',
        patient_name: '',
        phone_number: '',
        procedure_id: "1",
        procedure_name: '',
        doctor_attr: '',
        reason: '',
        status_attr: 2,
        time_attr: 0,
        is_new: true
      }
    } as IEditAppointmentBodyNew;
    this.minDate = new Date();

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

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDate = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };

  }


  // Set the maximum date to 30 years from the current year
  maxDate: NgbDateStruct = this.calculateMaxDate();

  responseO: any;
  ngOnInit(): void {
    console.log("oninit")
    this.getListGroupService();
    const id = this.route.snapshot.params['id'];
    this.PATIENT_SERVICE.getPatientById(id).subscribe((res) => {
      this.responseO = res;
      this.patientInfor = this.responseO.patient_id + " - " + this.responseO.patient_name + " - " + this.responseO.phone_number;
    })
    //const patient = sessionStorage.getItem('patient');
    // if (patient != null){
    //   var patients = JSON.parse(patient);
    //   this.patientInfor = patients.patient_id +" - "+patients.patient_name+ " - "+patients.phone_number;
    // }
    //this.selectDateToGetDoctor("2023-11-25");
  }

  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.listGroupService = res.data;
      console.log(res.data);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url + "/medical-procedure-group", error);
      }
    )
  }

  oldDate: string = ''
  oldTime: string = ''
  ngOnChanges(changes: SimpleChanges): void {
    this.resetValidate();
    console.log("selected aPPOIBIB", this.selectedAppointment)
    if (changes['selectedAppointment'] && this.selectedAppointment) {
      this.EDIT_APPOINTMENT_BODY = {
        epoch: 0,
        new_epoch: 0,
        appointment: {
          patient_id: this.selectedAppointment.patient_id,
          patient_name: this.selectedAppointment.patient_name,
          procedure_id: this.selectedAppointment.procedure_id,
          procedure_name: this.selectedAppointment.procedure_name,
          phone_number: this.selectedAppointment.phone_number,
          doctor_attr: this.selectedAppointment.doctor,
          status_attr: 2,
          time_attr: this.selectedAppointment.time,
          reason: this.selectedAppointment.reason,
          is_new: this.selectedAppointment.patient_created_date == '1' ? true : false
        }
      } as IEditAppointmentBodyNew;
      //this.selectedDoctor = this.selectedAppointment.doctor;
      this.patientInfor = this.EDIT_APPOINTMENT_BODY.appointment.patient_id + " - " + this.EDIT_APPOINTMENT_BODY.appointment.patient_name + " - " + this.EDIT_APPOINTMENT_BODY.appointment.phone_number;
    }
    if (changes['dateString'] && this.dateString) {
      this.oldDate = this.dateString;
      console.log("Old Date", this.oldDate);
      this.model = {
        year: parseInt(this.dateString.split('-')[2]),
        month: parseInt(this.dateString.split('-')[1]),
        day: parseInt(this.dateString.split('-')[0])
      };
    }
    if (changes['timeString']) {
      this.oldTime = this.timeString;
      this.timeString = this.oldTime;
    }

    if (changes['datesDisabled'] && this.datesDisabled && this.datesDisabled.length > 0) {
      this.datesDisabled = this.datesDisabled.map((timestamp: number) => {
        const date = new Date(timestamp * 1000); // Chuyển đổi timestamp sang date
        return date.toISOString().slice(0, 10); // Lấy phần yyyy-MM-dd
      });
      console.log("Date Parse: ", this.datesDisabled);
    }
  }

  // selectedDoctor: any = null;
  // selectDoctor(doctor: any) {
  //   this.selectedDoctor = doctor;
  //   console.log(this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name)
  //   this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name;
  // }

  calculateMaxDate(): NgbDateStruct {
    const currentYear = new Date().getFullYear();
    return { year: currentYear + 30, month: 12, day: 31 };
  }

  patientList: any[] = [];
  patientInfor: any;
  onsearch(event: any) {
    console.log(event.target.value)
    this.EDIT_APPOINTMENT_BODY.appointment.patient_name = event.target.value;
    this.PATIENT_SERVICE.getPatientByName(this.EDIT_APPOINTMENT_BODY.appointment.patient_name, 1).subscribe(data => {
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
        if (zo == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id) {
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


  appointmentList: RootObject[] = [];

  onPutAppointment() {
    this.isCallApi = true;
    this.EDIT_APPOINTMENT_BODY.epoch = this.dateToTimestamp(this.dateString);

    //Convert model to string
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    console.log(selectedDate); // Đây là ngày dưới dạng "YYYY-MM-DD"

    //console.log(this.oldDate, this.oldTime);
    this.EDIT_APPOINTMENT_BODY.new_epoch = this.dateToTimestamp(selectedDate);
    //console.log(this.dateString, this.timeString);
    this.EDIT_APPOINTMENT_BODY.appointment.time_attr = this.timeToTimestamp(this.timeString);

    this.listGroupService.forEach(e => {
      if (e.medical_procedure_group_id == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id) {
        this.EDIT_APPOINTMENT_BODY.appointment.procedure_name = e.name;
      }
    })
    console.log(this.EDIT_APPOINTMENT_BODY);
    this.resetValidate();
    if (this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == "1") {
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
      this.isCallApi = false;
      this.isSubmitted = true;
      this.loading = false;
      return;
    }
    const currentTime = new Date().toTimeString();
    const currentDate = moment().format('YYYY-MM-DD');

    if (this.EDIT_APPOINTMENT_BODY.appointment.procedure_id != "1") {
      this.datesDisabled.forEach((date: any) => {
        if (this.timestampToDate(date.date) == selectedDate && this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == date.procedure)
          if (date.count >= 8) {
            this.isCheckProcedure = false;
          }
      })
    }

    if (selectedDate == '') {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khám!";
      this.isCallApi = false;
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (selectedDate < currentDate) {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày lớn hơn ngày hiện tại";
      this.isCallApi = false;
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (!this.isCheckProcedure) {
      if (!window.confirm("Thủ thuật mà bạn chọn đã có đủ 8 người trong trong ngày đó. Bạn có muốn tiếp tục?")) {
        this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khác";
        this.isCallApi = false;
        return;
      }
    }

    if (this.timeString == '') {
      this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám!";
      this.isSubmitted = true;
      this.isCallApi = false;
      this.loading = false;
      return;
    } else if (this.timeString != '' && selectedDate <= currentDate) {
      if ((currentDate + " " + this.timeString) < (currentDate + " " + currentTime)) {
        this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám lớn hơn!";
        this.isSubmitted = true;
        this.isCallApi = false;
        this.loading = false;
        return;
      }
    }

    const patientInfor = this.patientInfor.split(' - ');
    this.EDIT_APPOINTMENT_BODY.appointment.patient_id = patientInfor[0];
    this.EDIT_APPOINTMENT_BODY.appointment.patient_name = patientInfor[1];
    this.EDIT_APPOINTMENT_BODY.appointment.phone_number = patientInfor[2];
    if (this.EDIT_APPOINTMENT_BODY.epoch !== this.EDIT_APPOINTMENT_BODY.new_epoch) {
      this.APPOINTMENT_SERVICE.getAppointmentList(this.dateToTimestamp(selectedDate + " 00:00:00"), this.dateToTimestamp(selectedDate + " 23:59:59")).subscribe(data => {
        this.appointmentList = ConvertJson.processApiResponse(data);
        this.filteredAppointments.forEach((appo: any) => {
          appo.appointments.forEach((deta: any) => {
            deta.details.forEach((res: any) => {
              if (appo.date == this.dateToTimestamp(selectedDate)) {
                if (res.patient_id == this.EDIT_APPOINTMENT_BODY.appointment.patient_id) {
                  this.validateAppointment.patientName = `Bệnh nhân đã có lịch hẹn trong ngày ${this.timestampToDate(appo.date)} !`;
                  this.isCallApi = false;
                  this.isSubmitted = true;
                  this.loading = false;
                  return;
                }
              }
            })
          })
        })
      })
    }
    this.APPOINTMENT_SERVICE.putAppointmentNew(this.EDIT_APPOINTMENT_BODY, this.selectedAppointment.appointment_id).subscribe(response => {
      console.log("Cập nhật thành công");
      this.isCallApi = false;
      this.showSuccessToast('Sửa Lịch hẹn thành công!');
      window.location.reload();
    }, error => {
      this.isCallApi = false;
      //this.showErrorToast("Lỗi khi cập nhật");
      ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment/" + this.selectedAppointment.appointment_id, error);
    });
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm:ss');
    return dateTimeString;
  }

  timestampToGMT7Date(timestamp: number): string {
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ GMT+7

    // Sử dụng moment.tz để chuyển đổi timestamp sang đối tượng ngày với múi giờ GMT+7
    const date = moment.tz(timestamp * 1000, timeZone);

    // Định dạng ngày theo mong muốn
    const formattedDate = date.format('YYYY-MM-DD'); // Định dạng ngày giờ

    return formattedDate;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf();
    return timestamp;
  }

  timeToTimestamp(timeStr: string): number {
    const time = moment(timeStr, "HH:mm:ss");
    const timestamp = time.unix(); // Lấy timestamp tính bằng giây
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
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

  convertStringToTimestamp(date: string, time: string) {
    // Chuyển đổi ngày cố định sang timestamp
    const fixedDate = new Date(date);
    const dateTimestamp = fixedDate.getTime() / 1000; // Chuyển đổi sang timestamp (giây)

    // Lấy giá trị thời gian từ biến time và chuyển đổi thành timestamp
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Khởi tạo một đối tượng Date với ngày cố định
    const combinedDateTime = new Date(fixedDate);

    // Đặt giờ và phút cho combinedDateTime
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Chuyển đổi thành timestamp
    const combinedTimestamp = combinedDateTime.getTime() / 1000;

    return {
      dateTimestamp: dateTimestamp,
      combinedDateTime: combinedTimestamp
    };
  }
  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private resetValidate() {
    this.validateAppointment = {
      patientName: '',
      phoneNumber: '',
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
