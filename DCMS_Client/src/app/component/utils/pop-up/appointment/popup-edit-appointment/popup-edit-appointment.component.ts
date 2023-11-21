import { IEditAppointmentBody, ISelectedAppointment } from '../../../../../model/IAppointment';
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment-timezone';

import {
  NgbDatepickerConfig,
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from "@ng-bootstrap/ng-bootstrap";
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
@Component({
  selector: 'app-popup-edit-appointment',
  templateUrl: './popup-edit-appointment.component.html',
  styleUrls: ['./popup-edit-appointment.component.css']
})

export class PopupEditAppointmentComponent implements OnInit, OnChanges {

  loading:boolean = false;
  isCheckProcedure : boolean = true;

  @Input() selectedAppointment: any;
  @Input() dateString: any;
  @Input() timeString: any;

  @Input() datesDisabled: any;

  isDatepickerOpened: boolean = false;
  EDIT_APPOINTMENT_BODY: IEditAppointmentBody

  isPatientInfoEditable: boolean = false;

  //config ng bootstrap
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

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
    { name: 'Không Chọn Bác Sĩ', specialty: '', image: 'https://png.pngtree.com/png-clipart/20190904/original/pngtree-user-cartoon-girl-avatar-png-image_4492903.jpg' }
  ];
  validateAppointment = {
    phoneNumber: '',
    procedure: '',
    appointmentTime: '',
    appointmentDate: '',
  }
  isSubmitted: boolean = false;
  minDate: Date;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private toastr: ToastrService,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private medicaoProcedureGroupService:MedicalProcedureGroupService
  ) {
    this.EDIT_APPOINTMENT_BODY = {
      epoch: 0,    //x
      new_epoch: 0,
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure_id: "1",  //x
        doctor: '',
        status: 2, //x
        time: 0  //x
      }
    } as IEditAppointmentBody;
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

  ngOnInit(): void {
    this.getListGroupService();
  }

  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any) => {
      this.listGroupService = res.data;
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url+"/medical-procedure-group", error);
      }
      )
  }

  oldDate: string = ''
  oldTime: string = ''
  ngOnChanges(changes: SimpleChanges): void {
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
          doctor: this.selectedAppointment.doctor,
          status: 2,
          time: this.selectedAppointment.time
        }

      } as IEditAppointmentBody;
      this.selectedDoctor = this.selectedAppointment.doctor;
    }
    if (changes['dateString']) {
      this.oldDate = this.dateString;
      console.log("Old Date", this.oldDate);
      // Set model theo dateString
      this.model = {
        year: parseInt(this.dateString.split('-')[0]),
        month: parseInt(this.dateString.split('-')[1]),
        day: parseInt(this.dateString.split('-')[2])
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

  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name)
    this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name;
  }

  onPutAppointment() {
    this.EDIT_APPOINTMENT_BODY.epoch = this.dateToTimestamp(this.dateString);

    //Convert model to string
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    console.log(selectedDate); // Đây là ngày dưới dạng "YYYY-MM-DD"

    //console.log(this.oldDate, this.oldTime);
    this.EDIT_APPOINTMENT_BODY.new_epoch = this.dateToTimestamp(selectedDate);;
    //console.log(this.dateString, this.timeString);
    this.EDIT_APPOINTMENT_BODY.appointment.time = this.timeToTimestamp(this.timeString);

    this.listGroupService.forEach(e => {
      if(e.medical_procedure_group_id == this.EDIT_APPOINTMENT_BODY.appointment.procedure_id) {
        this.EDIT_APPOINTMENT_BODY.appointment.procedure_name = e.name;
      }
    })
    console.log(this.EDIT_APPOINTMENT_BODY);
    this.resetValidate();
    if (this.EDIT_APPOINTMENT_BODY.appointment.procedure_id == "1") {
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
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

    if (this.timeString == '') {
      this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám!";
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (this.timeString != '' && selectedDate <= currentDate) {
      if ((currentDate+" "+this.timeString) < (currentDate+" "+currentTime)) {
        this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám lớn hơn!";
        this.isSubmitted = true;
        this.loading = false;
        return;
      }
    }

    if (!this.EDIT_APPOINTMENT_BODY.appointment.phone_number) {
      this.validateAppointment.phoneNumber = "Vui lòng nhập số điện thoại";
      this.isSubmitted = true;
      this.loading = false;
      return;
    } else if (!this.isVietnamesePhoneNumber(this.EDIT_APPOINTMENT_BODY.appointment.phone_number)) {
      this.validateAppointment.phoneNumber = "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại";
      this.isSubmitted = true;
      this.loading = false;
      return;
    }
    // console.log("AppointmentId",this.selectedAppointment.appointment_id);
    this.APPOINTMENT_SERVICE.putAppointment(this.EDIT_APPOINTMENT_BODY, this.selectedAppointment.appointment_id).subscribe(response => {
      console.log("Cập nhật thành công");
      this.showSuccessToast('Sửa Lịch hẹn thành công!');
        window.location.reload();
    }, error => {
      //this.showErrorToast("Lỗi khi cập nhật");
      ResponseHandler.HANDLE_HTTP_STATUS(this.APPOINTMENT_SERVICE.apiUrl+"/appointment/"+this.selectedAppointment.appointment_id, error);
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
      phoneNumber: '',
      procedure: '',
      appointmentTime: '',
      appointmentDate: '',
    }
    this.isSubmitted = true;
  }
}
