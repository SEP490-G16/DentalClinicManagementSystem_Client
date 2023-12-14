import {Component, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {IAddAppointment, RootObject} from "../../../../../model/IAppointment";
import {NgbCalendar, NgbDate, NgbDatepickerConfig, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {
  ReceptionistAppointmentService
} from "../../../../../service/ReceptionistService/receptionist-appointment.service";
import {PatientService} from "../../../../../service/PatientService/patient.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {CognitoService} from "../../../../../service/cognito.service";
import {TimeKeepingService} from "../../../../../service/Follow-TimeKeepingService/time-keeping.service";
import {
  MedicalProcedureGroupService
} from "../../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {SendMessageSocket} from "../../../../shared/services/SendMessageSocket.service";
import * as moment from "moment-timezone";
import {ConvertJson} from "../../../../../service/Lib/ConvertJson";
import {Normalize} from "../../../../../service/Lib/Normalize";
import {ResponseHandler} from "../../../libs/ResponseHandler";
import {FormatNgbDate} from "../../../libs/formatNgbDate";

@Component({
  selector: 'app-popup-add-appointment-new',
  templateUrl: './popup-add-appointment-new.component.html',
  styleUrls: ['./popup-add-appointment-new.component.css']
})
export class PopupAddAppointmentNewComponent implements OnInit {
  @Input()selectedDateCache:any;
  dobNgb!: NgbDateStruct
  private itemsSource = new BehaviorSubject<any[]>([]);
  items = this.itemsSource.asObservable();
  isCheckProcedure: boolean = true;
  reason: any;
  isAddOld:boolean = false;
  listGroupService: any[] = [];
  private intervalId: any;
  isCheck: boolean = false;
  //doctors: any[] = [];
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
  patient1: any = {
    patientName: '',
    Email: '',
    Gender: 1,
    phone_Number: '',
    Address: '',
    full_medical_History: '',
    dental_medical_History: '',
    dob: ''
  }
  patientBody: any = {
    patient_name: '',
    email: '',
    gender: '',
    phone_number: '',
    address: '',
    full_medical_history: '',
    dental_medical_history: '',
    date_of_birth: '',
    description: ''
  }
  validatePatient = {
    name: '',
    gender: '',
    phone: '',
    address: '',
    dob: '',
    email: ''
  }
  //@Input() datesDisabled: any;
  @Input() filteredAppointments: any

  @Output() newItemEvent = new EventEmitter<any>();
  @Output() newAppointmentAdded = new EventEmitter<any>();
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

  currentDate: any;

  mindate: Date;
  minTime: string;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
              private PATIENT_SERVICE: PatientService,
              private toastr: ToastrService,
              private calendar: NgbCalendar,
              private sendMessageSocket: SendMessageSocket,
              private config: NgbDatepickerConfig,
  ) {

    const currentYear = new Date().getFullYear();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: currentYear, month: 12, day: 31 };

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
        patient_created_date: '',
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
    const a = parseInt(currentDateGMT7.split('-')[0]) + "-" + parseInt(currentDateGMT7.split('-')[1]) + "-" + (parseInt(currentDateGMT7.split('-')[2]));
    this.startDate = currentDateGMT7;
    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7);
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);
  }

  getListAppountment() {
    const storeList = localStorage.getItem('ListAppointment');
    if (storeList != null) {
      this.appointmentList = JSON.parse(storeList);
      this.ListAppointments = this.appointmentList.filter(app => app.date === this.startDateTimestamp);
      this.ListAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
    } else {
      this.startDateTimestamp = this.dateToTimestamp(this.startDate);
      this.APPOINTMENT_SERVICE.getAppointmentList(this.startDateTimestamp, this.endDateTimestamp).subscribe(data => {
        this.appointmentList = ConvertJson.processApiResponse(data);
        localStorage.setItem("ListAppointment", JSON.stringify(this.appointmentList))
        this.ListAppointments = this.appointmentList.filter(app => app.date === this.startDateTimestamp);
        this.ListAppointments.forEach((a: any) => {
          this.dateEpoch = this.timestampToDate(a.date);
          a.appointments.forEach((b: any) => {
            b.details = b.details.sort((a: any, b: any) => a.time - b.time);
          })
        })
      })
    }
  }

  getListGroupService() {
    var storeList = localStorage.getItem("listGroupService");
    if (storeList != null) {
      this.listGroupService = JSON.parse(storeList);
    }
  }

  getDisableDate() {
    var today = new Date();
    var date = today.getFullYear() + ' - ' + (today.getMonth() + 1) + ' - ' + today.getDate();
    var time = today.getHours() + ' - ' + today.getMinutes() + ' - ' + today.getSeconds();
    var dateTime = date + ' ' + time;
  }

  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  phoneErr: string = "";

  patientList: any[] = [];
  patientInfor: any;
  searchTimeout: any;
  onsearch(event: any) {
    clearTimeout(this.searchTimeout);

    const searchTermWithDiacritics = Normalize.normalizeDiacritics(event.target.value);

    this.searchTimeout = setTimeout(() => {
      this.AppointmentBody.appointment.patient_name = searchTermWithDiacritics;

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
  }

  appointmentDate: string = '';
  checkNewPatent: boolean = false;
  addPatient() {

    //const a = new Date();
    //alert(a.getHours()+":"+a.getMinutes()+":"+a.getSeconds());
    //Check validate create new patient
    this.resetValidatePatient();
    if (!this.patient1.patientName) {
      this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
      this.isSubmittedPatient = true;
    }
    var regex = /[0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\\-/]/;
    if(regex.test(this.patient1.patientName)==true){
      this.validatePatient.name = "Tên không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.phone_Number) {
      this.validatePatient.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmittedPatient = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.patient1.phone_Number)) {
      this.validatePatient.phone = "Số điện thoại không hợp lệ!";
      this.isSubmittedPatient = true;
    }
    if (!this.dobNgb || !this.dobNgb.year || !this.dobNgb.month || !this.dobNgb.day) {
      this.validatePatient.dob = "Vui lòng nhập ngày sinh!";
      this.isSubmitted = true;
    }
    else if (!this.isDob(FormatNgbDate.formatNgbDateToString(this.dobNgb))){
      this.validatePatient.dob = "Vui lòng nhập ngày sinh đúng định dạng dd/MM/yyyy !";
      this.isSubmitted = true;
    }

    if (!this.patient1.Address) {
      this.validatePatient.address = "Vui lòng nhập địa chỉ!";
      this.isSubmittedPatient = true;
    }
    //Check validate create new appointment
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0');
    const selectedDay = this.model.day.toString().padStart(2, '0');

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
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
      //this.listGroupService = JSON.parse(store);
    }

    let procedureNameSelected;
    if (this.procedure != "1") {
      this.APPOINTMENT_SERVICE.getAppointmentList(this.dateToTimestamp(selectedDate + " 00:00:00"), this.dateToTimestamp(selectedDate + " 23:59:59")).subscribe(data => {
        this.appointmentList = ConvertJson.processApiResponse(data);
        this.listDate = this.appointmentList;
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
          if (this.timestampToDate(date.date) == selectedDate && this.procedure == date.procedure && it.medical_procedure_group_id == this.procedure && it.name == 'Điều trị tủy răng') {
            if (date.count >= 4) {
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
    this.phoneErr = "";

    this.patientBody = {
      patient_id: null,
      patient_name: this.patient1.patientName,
      email: this.patient1.Email,
      gender: this.patient1.Gender,
      phone_number: this.patient1.phone_Number,
      address: this.patient1.Address,
      full_medical_history: this.patient1.full_medical_History,
      dental_medical_history: this.patient1.dental_medical_History,
      date_of_birth:FormatNgbDate.formatNgbDateToString(this.dobNgb)
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 9) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: this.patient1.Gender,
        phone_number: '+84' + this.patient1.phone_Number,
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: FormatNgbDate.formatNgbDateToString(this.dobNgb)
      }
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 10) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: this.patient1.Gender,
        phone_number: '+84' + this.patient1.phone_Number.substring(1),
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: FormatNgbDate.formatNgbDateToString(this.dobNgb)
      }
    }

    this.PATIENT_SERVICE.addPatient(this.patientBody).subscribe((data: any) => {
      this.toastr.success('Thêm mới bệnh nhân thành công!');
      this.checkNewPatent = true;
      this.patient1 = [];
      this.AppointmentBody.appointment.patient_id = data.data.patient_id;
      this.AppointmentBody.appointment.patient_name = this.patientBody.patient_name;
      this.AppointmentBody.appointment.phone_number = this.normalizePhoneNumber(this.patientBody.phone_number);
      if (this.checkNewPatent == true) {
        this.AppointmentBody.appointment.patient_created_date = "1";
        this.checkNewPatent = false;
      }

      const now = new Date();
      const curr = (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDay() +" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()).toString();
      const patientInfor = this.AppointmentBody.appointment.patient_id+ " - "+this.AppointmentBody.appointment.patient_name+" - "+this.AppointmentBody.appointment.phone_number+" - "+this.patientBody.address+" - "+ curr+" - "+"pa";
      this.sendMessageSocket.sendMessageSocket('CheckRealTimeWaitingRoom@@@',`${patientInfor}`,`${Number('1')}`);
      this.APPOINTMENT_SERVICE.postAppointment(this.AppointmentBody).subscribe(
        (response) => {
          this.loading = false;
          if (selectedDate == this.startDate) {
            this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'plus', 'app');
          }
          this.showSuccessToast('Lịch hẹn đã được tạo thành công!');
          let ref = document.getElementById('cancel-patient-appointment');
          ref?.click();
          const newDetail: any = {
            appointment_id: response.appointment_id,
            patient_id: this.AppointmentBody.appointment.patient_id,
            patient_name: this.AppointmentBody.appointment.patient_name,
            phone_number: (this.AppointmentBody.appointment.phone_number),
            procedure: (this.AppointmentBody.appointment.procedure_id),
            procedure_name: this.AppointmentBody.appointment.procedure_name,
            doctor: this.AppointmentBody.appointment.doctor,
            time: this.AppointmentBody.appointment.time,
            status: this.AppointmentBody.appointment.status,
            patient_created_date: this.AppointmentBody.appointment.patient_created_date,
            migrated: 'false'
          };

          const now = new Date();
          const currDate = now.getFullYear() + "-"+(now.getMonth()+1)+"-"+now.getDate();
          if (this.selectedDateCache == selectedDate) {
            const appointmentIndex = this.filteredAppointments.findIndex((a: any) => a.date === this.AppointmentBody.epoch);

            if (appointmentIndex !== -1) {
              this.filteredAppointments[appointmentIndex].appointments.push({
                procedure: this.AppointmentBody.appointment.procedure_id,
                count: 1,
                details: [newDetail]
              });
            } else {
              const newAppointment: any = {
                procedure: (this.AppointmentBody.appointment.procedure_id),
                count: 1,
                details: [newDetail]
              };
              this.filteredAppointments.push({
                date: this.AppointmentBody.epoch,
                appointments: [newAppointment]
              });
            }
          }
          this.newAppointmentAdded.emit(this.filteredAppointments);
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
              reason: '',
              status: 2,
              time: 0
            }
          } as IAddAppointment;
          this.reason = '';
          const currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
          this.appointmentTime = currentTimeGMT7;
          this.procedure = '1';
          //window.location.reload();
        },
        (error) => {
          this.loading = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl + "/appointment", error);
        }
      );
    }, error => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.PATIENT_SERVICE.test + "/patient", error);
    })
  }
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(email);
  }
  toggleAdd() {
    this.isAdd = true;
    this.isAddOld = true;
  }
  private isDob(dob: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dob);
  }
  convertDateToISOFormat(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`; // Chuyển đổi sang định dạng yyyy-MM-dd
    } else {
      return null; // hoặc bạn có thể handle lỗi tùy theo logic của ứng dụng
    }
  }
  toggleAddOld(){
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
  resetValidatePatient() {
    this.validatePatient = {
      name: '',
      gender: '',
      phone: '',
      address: '',
      dob: '',
      email: ''
    }
    this.isSubmittedPatient = false;
  }

  addItem(newItem: any) {
    this.itemsSource.next([...this.itemsSource.value, newItem]);
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
        procedure_id: "1",
        procedure_name: '',
        doctor: '',
        status: 2,
        time: 0
      }
    } as IAddAppointment;
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
  checkCancel() {
    this.isAdd = false;
    this.isAddOld = false;
    this.resetValidatePatient()
  }
}

