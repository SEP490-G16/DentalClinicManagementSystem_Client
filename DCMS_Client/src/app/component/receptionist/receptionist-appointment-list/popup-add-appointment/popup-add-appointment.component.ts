import { Component, OnInit, Renderer2, ViewChild, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import * as moment from 'moment-timezone';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
  NgbDatepickerConfig,
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from "@ng-bootstrap/ng-bootstrap";

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-popup-add-appointment',
  templateUrl: './popup-add-appointment.component.html',
  styleUrls: ['./popup-add-appointment.component.css']
})
export class PopupAddAppointmentComponent implements OnInit, OnChanges {
  phoneRegex = /^[0-9]{10}$|^[0-9]{4}\s[0-9]{3}\s[0-9]{3}$/;

  procedure: string = "1";
  isPatientInfoEditable: boolean = false;


  @Input() datesDisabled: any;
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
    phoneNumber: '',
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


  mindate: Date;
  minTime: string;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar
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
        procedure: 1,  //x
        doctor: '', //x
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
    console.log(this.appointmentDate);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (this.datesDisabled && this.datesDisabled.length == 0) {
      // this.datesDisabled.push(1698681910);
      // console.log("Date disabled: ", this.datesDisabled);
    }
    if (changes['datesDisabled'] && this.datesDisabled && this.datesDisabled.length > 0) {
      this.datesDisabled = this.datesDisabled.map((timestamp: number) => {
        const date = new Date(timestamp * 1000); // Chuyển đổi timestamp sang date
        return date.toISOString().slice(0, 10); // Lấy phần yyyy-MM-dd
      });
      console.log("Date Parse: ", this.datesDisabled);
    }
  }
  ngOnInit(): void {
  }

  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  phoneErr: string = "";
  onPhoneInput() {

    if (this.AppointmentBody.appointment.phone_number === "") {
      this.phoneErr = "Vui lòng nhập số điện thoại";
    } else if (!this.isVietnamesePhoneNumber(this.AppointmentBody.appointment.phone_number)) {
      this.phoneErr = "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại";
    } else {
      this.phoneErr = "";
      console.log(this.AppointmentBody.appointment.phone_number);
      this.PATIENT_SERVICE.getPatientPhoneNumber(this.AppointmentBody.appointment.phone_number).subscribe((data) => {
        this.AppointmentBody.appointment.patient_id = data[0].patient_id;
        this.AppointmentBody.appointment.patient_name = data[0].patient_name;

        console.log(data)
      },
        (err) => {
          this.showErrorToast("Không tìm thấy số điện thoại");
          this.phoneErr = "";
        }
      )
    }
  }


  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.AppointmentBody.appointment.doctor = doctor.name)
    this.AppointmentBody.appointment.doctor = doctor.name;
  }

  appointmentDate: string = '';
  onPostAppointment() {

    //Convert model to string
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    console.log(selectedDate); // Đây là ngày dưới dạng "YYYY-MM-DD"


    this.AppointmentBody.epoch = this.dateToTimestamp(selectedDate);
    console.log(this.AppointmentBody.epoch);
    this.AppointmentBody.appointment.time = this.timeAndDateToTimestamp(this.appointmentTime, selectedDate);

    console.log(this.AppointmentBody);
    // Gọi API POST
    this.resetValidate();
    if (!this.AppointmentBody.appointment.procedure) {
      this.validateAppointment.procedure = "Vui lòng chọn loại điều trị!";
      this.isSubmitted = true;
    }
    if (!this.appointmentTime) {
      this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám!";
      this.isSubmitted = true;
    }
    if (!this.appointmentDate) {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khám!";
      this.isSubmitted = true;
    }
    if (!this.AppointmentBody.appointment.phone_number) {
      this.validateAppointment.phoneNumber = "Vui lòng nhập số điện thoại";
      this.isSubmitted = true;
    } else if (!this.isVietnamesePhoneNumber(this.AppointmentBody.appointment.phone_number)) {
      this.validateAppointment.phoneNumber = "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại";
      this.isSubmitted = true;
    }
    else {
      this.phoneErr = "";

      this.APPOINTMENT_SERVICE.postAppointment(this.AppointmentBody).subscribe(
        (response) => {
          console.log('Lịch hẹn đã được tạo:', response);
          this.showSuccessToast('Lịch hẹn đã được tạo thành công!');
          this.AppointmentBody = {
            epoch: 0,    //x
            appointment: {
              patient_id: '',  //x
              patient_name: '', //x
              phone_number: '', //x
              procedure: 1,  //x
              doctor: '', //x
              time: 0  //x
            }
          } as IAddAppointment;
          this.procedure = '';
          this.appointmentTime = '';
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
        (error) => {
          console.error('Lỗi khi tạo lịch hẹn:', error);
          this.showErrorToast('Lỗi khi tạo lịch hẹn!');
        }
      );
    }
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
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


  close() {
    this.AppointmentBody = {
      epoch: 0,    //x
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure: 1,  //x
        doctor: '', //x
        time: 0  //x
      }
    } as IAddAppointment;
  }

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
  ];
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
