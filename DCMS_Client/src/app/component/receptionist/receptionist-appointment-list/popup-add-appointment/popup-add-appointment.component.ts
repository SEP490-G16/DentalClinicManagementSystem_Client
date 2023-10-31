import { Component, OnInit, Renderer2, ViewChild, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import * as moment from 'moment-timezone';

import { MatCalendar } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {MatCalendarCellClassFunction} from '@angular/material/datepicker';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-popup-add-appointment',
  templateUrl: './popup-add-appointment.component.html',
  styleUrls: ['./popup-add-appointment.component.css']
})
export class PopupAddAppointmentComponent implements OnInit, OnChanges {

  @Input() datesDisabled: any;
  @Input() isDatepickerOpened: boolean = false;
  AppointmentBody: IAddAppointment;

  procedure: string = "";
  appointmentTime = "";

  isPatientInfoEditable: boolean = false;

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
  ];

  mindate: Date;
  minTime:string;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router
  ) {
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
  }

  // checkDate() {
  //   if (this.datesDisabled && this.datesDisabled.includes(this.appointmentDate)) {
  //     alert('Lịch hẹn này đã quá số lượng đặt');
  //     this.appointmentDate = '';
  //     console.log("Appointment: ", this.appointmentDate);
  //   }
  // }

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

  // date: any;
  // dateClass = (d: Date): string | '' => {
  //   const date = d.getDate();
  //   const month = d.getMonth() + 1; // Months are zero-based
  //   const year = d.getFullYear();
  //   const formattedDate = `${month}/${date}/${year}`;

  //   if (this.myHolidayFilter(new Date(formattedDate))) {
  //     return 'highlight-dates'; // Apply the CSS class for highlighting
  //   }

  //   return ''; // No additional CSS class
  // };

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return date === 1 || date === 20 ? 'example-custom-date-class' : '';
    }

    return '';
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (this.datesDisabled && this.datesDisabled.length == 0) {
      this.datesDisabled.push(1698681910);
      console.log("Date disabled: ", this.datesDisabled);
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


  tooltipText: string = "";
  onPhoneInput() {
    console.log(this.AppointmentBody.appointment.phone_number);
    this.PATIENT_SERVICE.getPatientPhoneNumber(this.AppointmentBody.appointment.phone_number).subscribe((data) => {
      this.AppointmentBody.appointment.patient_id = data[0].patient_id;
      this.AppointmentBody.appointment.patient_name = data[0].patient_name;
      this.tooltipText = `Thêm thông tin bệnh nhân thành công`;
      console.log(data)
    },
    (err) => {
      this.showErrorToast("Không tìm thấy số điện thoại");
    }
    )
  }


  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.AppointmentBody.appointment.doctor = doctor.name)
    this.AppointmentBody.appointment.doctor = doctor.name;
  }

  appointmentDate: string = '';
  timestamp2: number = 0;
  onPostAppointment() {

    const gmt7Moment = moment.tz(this.appointmentDate, 'Asia/Ho_Chi_Minh'); // GMT+7

    // Lấy timestamp
    this.timestamp2 = gmt7Moment.valueOf();
    console.log("new", this.timestamp2);

    // Chuyển đổi ngày cố định sang timestamp
    const fixedDate = new Date(this.appointmentDate);
    const dateTimestamp = (fixedDate.getTime() / 1000); // Chuyển đổi sang timestamp (giây)

    // Lấy giá trị thời gian từ biến appointmentTime và chuyển đổi thành timestamp
    const timeParts = this.appointmentTime.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Khởi tạo một đối tượng Date với ngày cố định
    const combinedDateTime = new Date(fixedDate);

    // Đặt giờ và phút cho combinedDateTime
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Chuyển đổi thành timestamp
    const combinedTimestamp = combinedDateTime.getTime() / 1000; // Chuyển đổi sang timestamp (giây)

    this.AppointmentBody.epoch = dateTimestamp;
    console.log(this.AppointmentBody.epoch = dateTimestamp); // Chứa giá trị ngày (date)
    this.AppointmentBody.appointment.time = combinedTimestamp; // Chứa giá trị giờ trong ngày

    console.log("a ", dateTimestamp);
    // Gọi API POST
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
  currentDate: any = new Date();

  selectedMatDate!: Date;

  ordinaryDateSelected!: Date;


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

}
