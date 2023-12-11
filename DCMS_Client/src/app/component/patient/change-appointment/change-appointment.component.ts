import { IEditAppointmentBody, RootObject } from './../../../model/IAppointment';
import { ConvertJson } from './../../../service/Lib/ConvertJson';
import { IPatient } from './../../../model/IPatient';
import { Component, OnInit, OnChanges, SimpleChanges, DoCheck, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbDatepickerConfig, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { CancelAppointmentComponent } from './cancel-appointment/cancel-appointment.component';
import { ConfirmationModalComponent } from '../../utils/pop-up/common/confirm-modal/confirm-modal.component';


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
  currentDate: any;
  minTime: any;

  isSubmitted: boolean = false;

  validateAppointment = {
    appointmentTime: '',
    appointmentDate: '',
  }
  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private appointmentService: ReceptionistAppointmentService,
    private toastr: ToastrService,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.EDIT_APPOINTMENT_BODY = {
      epoch: 0,    //x
      new_epoch: 0,
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure_id: "",  //x
        doctor: '', //x
        time: 0,  //x,
        status: 1
      }
    } as IEditAppointmentBody;

    this.mindate = new Date();
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
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.minTime = `${hours}:${minutes}`;
    this.mindate = new Date();

    const currentTime = new Date();

    // Set date time hiện tại
    const currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');

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

  //config ng bootstrap
  isDisabled: any;
  model!: NgbDateStruct;
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

  ngOnInit(): void {
    this.fetchAPI();
  }

  isMigrated: boolean = true;
  async fetchAPI() {
    while (this.isMigrated) {
      if (this.appointmentId_Pathparam === '' && this.epoch_PathParam === 0) {
        this.route.params.subscribe(params => {
          this.epoch_PathParam = params['epoch'];
          this.appointmentId_Pathparam = params['appointmentId'];
        });
      }

      const data = await this.appointmentService.getAppointmentByPatient(this.epoch_PathParam, this.epoch_PathParam);

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
        console.log("AppointmentParent:", this.appointmentDate);
        this.selectedDate = this.timestampToDate(AppointmentParent[0].date);
        console.log("selectedDate: ", this.selectedDate);
        this.model = {
          year: parseInt(this.selectedDate.split('-')[0]),
          month: parseInt(this.selectedDate.split('-')[1]),
          day: parseInt(this.selectedDate.split('-')[2])
        };

        this.timeString = this.timestampToGMT7HourString(appointmentChild.time);
        console.log("timeString: ", this.timeString);
        this.isMigrated = false;
        console.log(this.isMigrated);
      }
    }
  }

  findAppointmentById(appointments: any) {
    console.log("Appointment find by Id: ", appointments);
    const filteredAppointments = ConvertJson.processApiResponse(appointments);
    console.log(filteredAppointments);
    const rawData = filteredAppointments as RootObject[];
    let result: any;
    if (rawData && rawData.length > 0) {
      for (const appointmentBlock of rawData) {
        for (const detail of appointmentBlock.appointments.flatMap(a => a.details)) {
          if (detail.appointment_id === this.appointmentId_Pathparam) {
            result = detail;
            break;
          }
        }
        if (result) break;
      }
    }
    return result;
  }


  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }

  formatDateToCustomString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm số 0 ở đầu nếu cần
    const day = date.getDate().toString().padStart(2, '0'); // Thêm số 0 ở đầu nếu cần
    return `${year}-${month}-${day}`;
  }


  timestampToGMT7HourString(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  EDIT_APPOINTMENT_BODY: IEditAppointmentBody
  onPutAppointment() {
    this.resetValidate();
    //Convert model to string
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    const currentTime = new Date().toTimeString();
    const currentDate = moment().format('YYYY-MM-DD');
    if (selectedDate == '') {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày khám!";
      this.isSubmitted = true;
      return;
    } else if (selectedDate < currentDate) {
      this.validateAppointment.appointmentDate = "Vui lòng chọn ngày lớn hơn ngày hiện tại";
      this.isSubmitted = true;
      return;
    }

    if (this.timeString == '') {
      this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám!";
      this.isSubmitted = true;
      return;
    } else if (this.timeString != '' && selectedDate <= currentDate) {
      if ((currentDate + " " + this.timeString) < (currentDate + " " + currentTime)) {
        this.validateAppointment.appointmentTime = "Vui lòng chọn giờ khám lớn hơn giờ hiện tại!";
        this.isSubmitted = true;
        return;
      }
    }

    this.EDIT_APPOINTMENT_BODY = {
      epoch: Number(this.epoch_PathParam),    //x
      new_epoch: this.dateToTimestamp(selectedDate),
      appointment: {
        patient_id: this.appointment.patient_id,  //x
        patient_name: this.appointment.patient_name, //x
        phone_number: this.appointment.phone_number, //x
        procedure_id: this.appointment.procedure_id,  //x
        doctor: this.appointment.doctor, //x,
        procedure_name: this.appointment.procedure_name,
        reason: this.appointment.reason,
        time: this.timeAndDateToTimestamp(this.timeString, this.selectedDate),
        status: 1, 
        patient_created_date: this.appointment.patient_created_date,
      }
    } as IEditAppointmentBody;
    console.log("EDIT_Appointment: ", this.EDIT_APPOINTMENT_BODY);
    this.openConfirmationModal().then((result) => {
      if (result === 'confirm') {
        this.appointmentService.putAppointment(this.EDIT_APPOINTMENT_BODY, this.appointmentId_Pathparam)
          .subscribe((res) => {
            this.showSuccessToast("Sửa lịch hẹn thành công");
            this.router.navigate([`benhnhan-zalo/sua-lich-hen-thanh-cong/${this.epoch_PathParam}%40/${this.appointmentId_Pathparam}`]);
          },
            (err) => {
              this.showErrorToast("Sửa lịch hẹn thất bại");
              ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl + "/appointment/" + this.appointmentId_Pathparam, err)
            }
          )
      }
    })
  }

  openConfirmationModal() {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.message = 'Bạn có chắc chắn muốn thay đổi lịch hẹn không?';
    modalRef.componentInstance.confirmButtonText = 'Tôi chắc chắn';
    modalRef.componentInstance.cancelButtonText = 'Hủy';

    return modalRef.result;
  }

  cancelAppointment() {
    const modalRef = this.modalService.open(CancelAppointmentComponent);
    modalRef.result.then((result) => {
      if (result === 'confirmed') {
        this.appointmentService.deleteAppointment(this.epoch_PathParam, this.appointmentId_Pathparam)
          .subscribe((res) => {
            this.router.navigate([`benhnhan-zalo/huy-lich-hen/${this.epoch_PathParam}/${this.appointmentId_Pathparam}`]);
            this.toastr.success(res.messgae, "Xóa lịch hẹn thành công")
          },
            (err) => {
              this.toastr.error(err.error.message, "Xóa lịch hẹn thất bại");
            })

      }
    });
  }

  resetValidate() {
    this.validateAppointment = {
      appointmentTime: '',
      appointmentDate: '',
    }
    this.isSubmitted = true;
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp / 1000;
  }

  timeAndDateToTimestamp(time: string, date: string): number {
    // Assuming date is in 'YYYY-MM-DD' format and time is in 'HH:mm A' format
    const format = 'YYYY-MM-DD HH:mm A';
    const dateTimeString = `${date} ${time}`;

    // Use moment-timezone to handle the conversion
    const timestamp = moment.tz(dateTimeString, format, 'Asia/Ho_Chi_Minh').unix();

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
}
