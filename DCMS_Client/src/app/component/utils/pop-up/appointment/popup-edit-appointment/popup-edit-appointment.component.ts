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
import { CognitoService } from 'src/app/service/cognito.service';
import { TimeKeepingService } from 'src/app/service/Follow-TimeKeepingService/time-keeping.service';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { Normalize } from 'src/app/service/Lib/Normalize';
@Component({
  selector: 'app-popup-edit-appointment',
  templateUrl: './popup-edit-appointment.component.html',
  styleUrls: ['./popup-edit-appointment.component.css']
})

export class PopupEditAppointmentComponent implements OnInit, OnChanges {

  loading: boolean = false;
  isCheckProcedure: boolean = true;
  isCallApi: boolean = false;

  @Input() selectedAppointment: any;
  @Input() dateString: any;
  @Input() timeString: any;
  @Input() filteredAppointments: any;
  @Input() selectedDateCache: any;
  //@Input() datesDisabled: any;
  datesDisabled: any[] = [];
  listDate: any[] = [];
  dateDis = {
    date: 0,
    procedure: '',
    count: 0,
  }
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


  // Set the maximum date to 30 years from the current year
  maxDate: NgbDateStruct = this.calculateMaxDate();
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
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

  calculateMaxDate(): NgbDateStruct {
    const currentYear = new Date().getFullYear();
    return { year: currentYear + 30, month: 12, day: 31 };
  }

  ngOnInit(): void {
    this.getListGroupService();
  }

  getListGroupService() {
    const storeList = localStorage.getItem("listGroupService");
    if (storeList != null) {
      this.listGroupService = JSON.parse(storeList);
    }
  }

  oldDate: string = ''
  oldTime: string = ''
  ngOnChanges(changes: SimpleChanges): void {
    this.resetValidate();
    if (changes['selectedAppointment']) {
      this.EDIT_APPOINTMENT_BODY = {
        epoch: 0,
        new_epoch: 0,
        appointment: {
          patient_id: this.selectedAppointment.patient_id,
          patient_name: this.selectedAppointment.patient_name,
          procedure_id: this.selectedAppointment.procedure_id,
          procedure_name: this.selectedAppointment.procedure_name,
          phone_number: this.selectedAppointment.phone_number,
          reason: this.selectedAppointment.reason,
          doctor_attr: this.selectedAppointment.doctor,
          status_attr: this.selectedAppointment.status,
          time_attr: this.selectedAppointment.time,
          is_new: this.selectedAppointment.patient_created_date == '1' ? true : false
        }
      } as IEditAppointmentBodyNew;
      this.patientInfor = this.EDIT_APPOINTMENT_BODY.appointment.patient_id + " - " + this.EDIT_APPOINTMENT_BODY.appointment.patient_name + " - " + this.EDIT_APPOINTMENT_BODY.appointment.phone_number;
    }
    if (changes['dateString'] && this.dateString) {
      this.oldDate = this.dateString;
      this.EDIT_APPOINTMENT_BODY.epoch = this.dateString;
      if (this.dateString != null && this.dateString != undefined) {
        this.model = {
          year: parseInt(this.dateString.split('-')[0]),
          month: parseInt(this.dateString.split('-')[1]),
          day: parseInt(this.dateString.split('-')[2])
        };
      }
    }
    if (changes['timeString']) {
      this.oldTime = this.timeString;
      this.timeString = this.oldTime;
    }
  }

  patientList: any[] = [];
  patientInfor: any;
  searchTimeout: any;
  onsearch(event: any) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.EDIT_APPOINTMENT_BODY.appointment.patient_name = event.target.value;
      const searchLowercased = event.target.value.toLowerCase();

      // Loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi
      const trimmedSearch = searchLowercased.trim();

      // Thay thế tất cả chuỗi khoảng trắng (bao gồm cả khoảng trắng kép trở lên) bằng dấu "-"
      const normalizedSearch = trimmedSearch.replace(/\s+/g, '-');
      this.PATIENT_SERVICE.getPatientByName(Normalize.normalizeDiacritics(normalizedSearch), 1).subscribe(data => {
        const transformedMaterialList = data.data.map((item: any) => {
          return {
            patientId: item.patient_id,
            patientName: item.patient_name,
            patientInfor: item.patient_id + " - " + item.patient_name + " - " + item.phone_number,
          };
        });
        this.patientList = transformedMaterialList;
      })
    }, 2000);
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
    const storeList = localStorage.getItem("listDoctor");
    if (storeList != null) {
      this.listDoctorDisplay = JSON.parse(storeList);
    }
  }


  listRegisterTime: any[] = [];
  uniqueList: string[] = [];
  listDoctorFilter: any[] = [];
  totalDoctorFilter: number = 0;

  selectDateToGetDoctor(time: any) {
    this.getListDoctor();
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0');
    const selectedDay = this.model.day.toString().padStart(2, '0');

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    this.timeKeepingService.getFollowingTimekeeping(this.dateToTimestamp(selectedDate + " 00:00:00"), this.dateToTimestamp(selectedDate + " 23:59:59")).subscribe(data => {
      this.listRegisterTime = this.organizeData(data);
      this.listDoctorFilter.splice(0, this.listDoctorFilter.length);
      this.listRegisterTime.forEach((res: any) => {
        res.records.forEach((doc: any) => {
          if (doc.details.register_clock_in < this.timeToTimestamp(time) && this.timeToTimestamp(time) < doc.details.register_clock_out) {
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
  newAppointment = {
    date: 0,
    appointments: [] as newApp[]
  }

  unqueList: any[] = [];
  listNewAppointment: any[] = [];
  onPutAppointment() {
    this.isCallApi = true;

    this.EDIT_APPOINTMENT_BODY.epoch = this.dateToTimestamp(this.dateString);

    //Convert model to string
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    this.EDIT_APPOINTMENT_BODY.new_epoch = this.dateToTimestamp(selectedDate);
    this.EDIT_APPOINTMENT_BODY.appointment.time_attr = this.timeToTimestamp(this.timeString);

    this.listGroupService.forEach(e => {
      if (e.medical_procedure_group_id == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id) {
        this.EDIT_APPOINTMENT_BODY.appointment.procedure_name = e.name;
      }
    })
    this.resetValidate();
    if (this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == "1") {
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
      this.isSubmitted = true;
      this.isCallApi = false;

      this.loading = false;
      return;
    }
    const currentTime = new Date().toTimeString();
    const currentDate = moment().format('YYYY-MM-DD');
    let procedureNameSelected;
    if (this.EDIT_APPOINTMENT_BODY.appointment.procedure_id != "1") {
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
      })

      this.datesDisabled.forEach((date: any) => {
        this.listGroupService.forEach((it: any) => {
          if (this.timestampToDate(date.date) == selectedDate && this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == date.procedure && it.medical_procedure_group_id == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id && it.name == 'Điều trị tủy') {
            if (date.count >= 2) {
              procedureNameSelected = "Điều trị tủy";
              this.isCheckProcedure = false;
            }
          } else if (this.timestampToDate(date.date) == selectedDate && this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == date.procedure && it.medical_procedure_group_id == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id && it.name == 'Nắn chỉnh răng') {
            if (date.count >= 8) {
              procedureNameSelected = "Nắn chỉnh răng";
              this.isCheckProcedure = false;
            }
          } else if (this.timestampToDate(date.date) == selectedDate && this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == date.procedure && it.medical_procedure_group_id == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id && it.name == 'Nhổ răng khôn') {
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
    var checkPatient = true;
    if (this.EDIT_APPOINTMENT_BODY.epoch !== this.EDIT_APPOINTMENT_BODY.new_epoch) {
      let listAppointment;
      const storeList = localStorage.getItem("ListAppointment");
      if (storeList != null) {
        listAppointment = JSON.parse(storeList);
      }
      this.filteredAppointments = listAppointment.filter((ap: any) => ap.date === this.dateToTimestamp(selectedDate));
      this.filteredAppointments.forEach((appo: any) => {
        appo.appointments.forEach((deta: any) => {
          deta.details.forEach((res: any) => {
            if (res.migrated == false) {
              if (res.patient_id == this.EDIT_APPOINTMENT_BODY.appointment.patient_id) {
                this.validateAppointment.patientName = `Bệnh nhân đã lịch hẹn trong ngày ${selectedDate} !`;
                this.isCallApi = false;
                checkPatient = false;
                return;
              }
            }
          })
        })
      })
    }
    if (!checkPatient) {
      return;
    }
    this.APPOINTMENT_SERVICE.putAppointmentNew(this.EDIT_APPOINTMENT_BODY, this.selectedAppointment.appointment_id).subscribe(response => {
      this.showSuccessToast('Sửa Lịch hẹn thành công!');
      this.isCallApi = false;
      window.location.reload();
    }, error => {
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
    const time = moment(timeStr, "HH:mm:ss", "Asia/Ho_Chi_Minh");
    const timestamp = time.unix();
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
