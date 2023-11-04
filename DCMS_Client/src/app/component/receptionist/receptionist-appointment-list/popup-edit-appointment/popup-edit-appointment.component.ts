import { IEditAppointmentBody, ISelectedAppointment } from './../../../../model/IAppointment';
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

import {MatCalendarCellClassFunction} from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';

import {
  NgbDatepickerConfig,
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-popup-edit-appointment',
  templateUrl: './popup-edit-appointment.component.html',
  styleUrls: ['./popup-edit-appointment.component.css']
})

export class PopupEditAppointmentComponent implements OnInit, OnChanges {
  @Input() selectedAppointment: any;
  @Input() dateString: any;
  @Input() timeString: any;

  @Input() datesDisabled: any;

  isDatepickerOpened: boolean = false;
  EDIT_APPOINTMENT_BODY: IEditAppointmentBody

  isPatientInfoEditable: boolean = false;

  //config ng bootstrap
  model!: NgbDateStruct;
  datePickerJson = {};
  markDisabled:any;
  json = {
    disable: [6, 7],
    disabledDates: [
      { year: 2020, month: 8, day: 13 },
      { year: 2020, month: 8, day: 19 },
      { year: 2020, month: 8, day: 25 }
    ]
  };
  isDisabled:any;

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
  ];
  validateAppointment={
    phoneNumber:'',
    procedure:'',
    appointmentTime:'',
    appointmentDate:'',
  }
  isSubmitted:boolean = false;
  minDate:Date;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private toastr: ToastrService,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar
    ) {
    this.EDIT_APPOINTMENT_BODY = {
      epoch: 0,    //x
      new_epoch: 0,
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure: 1,  //x
        doctor: '', //x
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
        || (this.json.disable.includes(calendar.getWeekday(new NgbDate(date.year,date.month,date.day))) )
      )
        ? true
        : false;
    };
  }

  ngOnInit(): void {
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
          procedure: this.selectedAppointment.procedure,
          phone_number: this.selectedAppointment.phone_number,
          doctor: this.selectedAppointment.doctor,
          time: this.selectedAppointment.time
        }
      } as IEditAppointmentBody;

      this.selectedDoctor = this.selectedAppointment.doctor;
    }
    if (changes['dateString']) {
      this.oldDate = this.dateString;
      this.dateString = this.oldDate;
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

  myHolidayDates = [
    new Date("10/30/2023"),
    new Date("11/06/2023"),
    new Date("11/08/2023"),
    new Date("11/10/2023"),
    new Date("11/14/2023"),
    new Date("11/17/2023")
  ];

  myHolidayFilter = (d: Date | null): boolean => {
    if (d) {
      const time = d.getTime();
      return !this.myHolidayDates.some(date => date.getTime() === time);
    }
    return true;
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return date === 1 || date === 20 ? 'example-custom-date-class' : '';
    }

    return '';
  };
  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name)
    this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name;
  }

  onPutAppointment() {
    this.EDIT_APPOINTMENT_BODY.epoch = this.convertStringToTimestamp(this.oldDate, this.oldTime).dateTimestamp;
    //console.log(this.oldDate, this.oldTime);
    this.EDIT_APPOINTMENT_BODY.new_epoch = this.convertStringToTimestamp(this.dateString, this.timeString).dateTimestamp;
    //console.log(this.dateString, this.timeString);
    this.EDIT_APPOINTMENT_BODY.appointment.time = this.convertStringToTimestamp(this.dateString, this.timeString).combinedDateTime;

    console.log(this.EDIT_APPOINTMENT_BODY);
    this.resetValidate();
    if (!this.EDIT_APPOINTMENT_BODY.appointment.procedure){
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
      this.isSubmitted = true;
    }
    if (!this.timeString){
      this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám!";
      this.isSubmitted = true;
    }
    if (!this.dateString){
      console.log("abc")
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khám!";
      this.isSubmitted = true;
    }
    if (!this.EDIT_APPOINTMENT_BODY.appointment.phone_number) {
      this.validateAppointment.phoneNumber = "Vui lòng nhập số điện thoại";
      this.isSubmitted = true;
    } else if (!this.isVietnamesePhoneNumber(this.EDIT_APPOINTMENT_BODY.appointment.phone_number)) {
      this.validateAppointment.phoneNumber  = "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại";
      this.isSubmitted = true;
    }
    // console.log("AppointmentId",this.selectedAppointment.appointment_id);
    this.APPOINTMENT_SERVICE.putAppointment(this.EDIT_APPOINTMENT_BODY, this.selectedAppointment.appointment_id).subscribe(response => {
      console.log("Cập nhật thành công");
      this.showSuccessToast('Sửa Lịch hẹn thành công!');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }, error => {
      this.showErrorToast("Lỗi khi cập nhật");
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
  private isVietnamesePhoneNumber(number:string):boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private resetValidate(){
    this.validateAppointment={
      phoneNumber:'',
      procedure:'',
      appointmentTime:'',
      appointmentDate:'',
    }
    this.isSubmitted = true;
  }
}
