import { IEditAppointmentBody, IEditAppointmentBodyNew, RootObject } from './../../../model/IAppointment';
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
  EDIT_APPOINTMENT_BODY: IEditAppointmentBodyNew;
  appointment: any;
  patient_name: any;
  phone_number:any;
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
    //this.test();
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

      const data = await this.appointmentService.getAppointmentByPatientNew(this.appointmentId_Pathparam);

      const result = JSON.parse(data)
      this.appointment = result;
      this.patient_name = result.Item.patient_attr.M.name.S;
      this.phone_number = result.Item.patient_attr.M.phone_number.S
      if (result.Item.migrated_attr.BOOL === "true") {
        this.epoch_PathParam = result.Item.SK.S.split('::')[0];
        this.appointmentId_Pathparam = result.Item.SK.S;
      } else {
        this.appointmentDate = this.timestampToDate(result.Item.SK.S.split('::')[0]);
        this.selectedDate = this.timestampToDate(result.Item.SK.S.split('::')[0]);
        this.model = {
          year: parseInt(this.selectedDate.split('-')[0]),
          month: parseInt(this.selectedDate.split('-')[1]),
          day: parseInt(this.selectedDate.split('-')[2])
        };

        this.timeString = this.timestampToGMT7HourString(result.Item.time_attr.N);
        this.isMigrated = false;
      }
    }
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
      epoch: Number(this.epoch_PathParam),   
      new_epoch: this.dateToTimestamp(selectedDate),
      appointment: {
        patient_id: this.appointment.Item.patient_attr.M.id.S,  
        patient_name: this.appointment.Item.patient_attr.M.name.S, 
        phone_number: this.appointment.Item.patient_attr.M.phone_number.S,
        procedure_id: this.appointment.Item.procedure_attr.M.id.S,  
        doctor_attr: this.appointment.Item.doctor_attr.S,
        procedure_name: this.appointment.Item.procedure_attr.M.name.S,
        reason: this.appointment.Item.reason_attr.S,
        time_attr: this.timeAndDateToTimestamp(this.timeString, this.selectedDate),
        status_attr: 2, 
        is_new: this.appointment.Item.patient_attr.M.is_new.BOOL,
      }
    } as IEditAppointmentBodyNew;
    this.openConfirmationModal().then((result) => {
      if (result === 'confirm') {
        this.appointmentService.putAppointmentNew(this.EDIT_APPOINTMENT_BODY, this.appointmentId_Pathparam)
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
        this.appointmentService.deleteAppointmentNew(this.appointmentId_Pathparam)
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
    const format = 'YYYY-MM-DD HH:mm:ss'; 
    const timeZone = 'Asia/Ho_Chi_Minh';
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp / 1000;
  }

  timeAndDateToTimestamp(time: string, date: string): number {
    const format = 'YYYY-MM-DD HH:mm A';
    const dateTimeString = `${date} ${time}`;
    const timestamp = moment.tz(dateTimeString, format, 'Asia/Ho_Chi_Minh').unix();
    return timestamp;
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
}
