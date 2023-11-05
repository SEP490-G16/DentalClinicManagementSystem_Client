import { IEditAppointmentBody, RootObject } from './../../../model/IAppointment';
import { ConvertJson } from './../../../service/Lib/ConvertJson';
import { IPatient } from './../../../model/IPatient';
import { Component, OnInit, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-change-appointment',
  templateUrl: './change-appointment.component.html',
  styleUrls: ['./change-appointment.component.css']
})

export class ChangeAppointmentComponent implements OnInit {


  epoch_PathParam: number = 0;  // Lưu giá trị của epoch
  appointmentId_Pathparam: string = '';  // Lưu giá trị của appointmentId

  appointment: any;

  appointmentDate: string = '';

  mindate: Date;

  selectedDate: any;

  timeString: any;
  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private appointmentService: ReceptionistAppointmentService,
    private toastr: ToastrService,
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

    this.mindate = new Date();
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

  ngOnInit(): void {
    this.fetchAPI();
  }

  isMigrated: boolean = true;
  async fetchAPI() {
    while (this.isMigrated) {
      console.log("isMigrated Work");
      if (this.appointmentId_Pathparam === '' && this.epoch_PathParam === 0) {
        this.route.params.subscribe(params => {
          this.epoch_PathParam = params['epoch'];
          this.appointmentId_Pathparam = params['appointmentId'];
        });
        console.log(this.epoch_PathParam);
        console.log(this.appointmentId_Pathparam);
      }

      const data = await this.appointmentService.getAppointmentByPatient(this.epoch_PathParam, this.epoch_PathParam);
      console.log("Data response: ", data);

      // Kiểm tra xem data có giá trị không
      const AppointmentParent = ConvertJson.processApiResponse(data);
      console.log("appointmentParent: ", AppointmentParent);
      const appointmentChild = this.findAppointmentById(data);

      this.appointment = appointmentChild;
      console.log("appointmentChild: ", appointmentChild);

      if (appointmentChild.migrated === "true") {
        this.epoch_PathParam = appointmentChild.epoch;
        console.log("epoch_PathParam: ", this.epoch_PathParam);
        this.appointmentId_Pathparam = appointmentChild.attribute_name;
        console.log("appointmentId_Pathparam: ", this.appointmentId_Pathparam);
      } else {
        this.appointmentDate = this.timestampToDate(AppointmentParent[0].date);
        console.log("AppointmentParent:", AppointmentParent[0].date);

        this.selectedDate = this.timestampToDate(AppointmentParent[0].date);
        console.log("selectedDate: ", this.selectedDate);

         this.timeString = this.timestampToGMT7HourString(appointmentChild.time);
        console.log("timeString: ", this.timeString);
        this.isMigrated = false;
        console.log(this.isMigrated);
      }
    }
  }


  timestampToDate(timestamp: number): string {
    const format = 'YYYY-MM-DD'; // Định dạng cho chuỗi ngày đầu ra
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const dateStr = moment.tz(timestamp, timeZone).format(format);
    return dateStr;
  }


  findAppointmentById(appointment: any) {
    const filteredAppointments = ConvertJson.processApiResponse(appointment);
    //console.log(filteredAppointments);
    const rawData = filteredAppointments as RootObject[];
    let res: any;
    if (rawData && rawData.length > 0) {
      const appointments = rawData[0].appointments;
      console.log("Appointments: ", appointments);
      res = appointments[0].details.find(detail => detail.appointment_id == this.appointmentId_Pathparam);
    }
    return res;
  }


  formatDateToCustomString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm số 0 ở đầu nếu cần
    const day = date.getDate().toString().padStart(2, '0'); // Thêm số 0 ở đầu nếu cần
    return `${year}-${month}-${day}`;
  }


  timestampToGMT7HourString(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    date.setHours(date.getHours() + 7); // Thêm 7 giờ để chuyển sang GMT+7

    // Định cấu hình tùy chọn định dạng giờ
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh', // GMT+7
      hour12: false, // 24 giờ
      hour: '2-digit',
      minute: '2-digit',
    };

    // Sử dụng tùy chọn để định dạng giờ
    return date.toLocaleString('en-US', options);
  }

  EDIT_APPOINTMENT_BODY: IEditAppointmentBody
  onPutAppointment() {
    this.EDIT_APPOINTMENT_BODY = {
      epoch: this.epoch_PathParam,    //x
      new_epoch: this.dateToTimestamp(this.selectedDate),
      appointment: {
        patient_id: this.appointment.patient_id,  //x
        patient_name: this.appointment.patient_name, //x
        phone_number: this.appointment.phone_number, //x
        procedure: this.appointment.procedure,  //x
        doctor: this.appointment.doctor, //x
        time: this.dateTimeToGMT7Timestamp(this.selectedDate, this.timeString).timeTimestamp //x
      }
    } as IEditAppointmentBody;
    console.log("EDIT_Appointment: ", this.EDIT_APPOINTMENT_BODY);
    this.appointmentService.putAppointment(this.EDIT_APPOINTMENT_BODY, this.appointmentId_Pathparam)
      .subscribe((res) => {
        this.showSuccessToast("Sửa lịch hẹn thành công");
      },
        (err) => {
          this.showErrorToast("Sửa lịch hẹn thất bại");
        }
      )
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  dateTimeToGMT7Timestamp(date: Date, time: string): { dateTimestamp: number, timeTimestamp: number } {
    const gmt7Date = new Date(date);
    const timeParts = time.split(':');
    gmt7Date.setHours(gmt7Date.getHours() - 7);
    gmt7Date.setMinutes(gmt7Date.getMinutes() + parseInt(timeParts[1], 10));

    const dateTimestamp = Math.floor(gmt7Date.getTime() / 1000);

    // Chuyển đổi thời gian thành timestamp
    const timeTimestamp = this.timeToGMT7Timestamp(time);

    return { dateTimestamp, timeTimestamp };
  }




  timeToGMT7Timestamp(time: string): number {
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Tính timestamp của thời gian với múi giờ GMT+7
    const gmt7Time = new Date();
    gmt7Time.setHours(hours - 7);
    gmt7Time.setMinutes(minutes);

    return Math.floor(gmt7Time.getTime() / 1000);
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
}


