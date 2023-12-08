import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { DateDisabledItem, Detail, IEditAppointmentBody, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
import { Router } from '@angular/router';
import { ConvertJson } from "../../../service/Lib/ConvertJson";
import { PopupAddAppointmentComponent } from '../../utils/pop-up/appointment/popup-add-appointment/popup-add-appointment.component';

import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { WebsocketService } from "../../../service/Chat/websocket.service";
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { IsThisSecondPipe } from 'ngx-date-fns';
import { end } from '@popperjs/core';
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
import { TimeKeepingService } from 'src/app/service/Follow-TimeKeepingService/time-keeping.service';
import { SendMessageSocket } from '../../shared/services/SendMessageSocket.service';

@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})

export class ReceptionistAppointmentListComponent implements OnInit {
  loading: boolean = false;
  dateEpoch: string = "";
  ePoch: string = "";
  model!: NgbDateStruct;
  placement = 'bottom';
  DELETE_APPOINTMENT_BODY: IEditAppointmentBody;
  selectedProcedure: string = '';
  searchText: string = '';
  filteredAppointments: any;
  appointmentList: RootObject[] = [];
  listGroupService: any[] = [];
  currentDate:any;
  startDate: any;
  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  nextDate: any;

  constructor(private appointmentService: ReceptionistAppointmentService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private receptionistWaitingRoom: ReceptionistWaitingRoomService,
    private sendMessageSocket: SendMessageSocket
  ) {
    this.DELETE_APPOINTMENT_BODY = {
      epoch: 0,
      new_epoch: 0,
      appointment: {
        patient_id: '',
        patient_name: '',
        phone_number: '',
        procedure_id: "1",
        doctor: '',
        status: 2,
        time: 0
      }
    } as IEditAppointmentBody;
    this.selectedAppointment = {
      appointment_id: '',
      patient_id: '',
      patient_name: '',
      doctor: '',
      procedure: '',
      phone_number: ''
    } as ISelectedAppointment;

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.model = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };
  }

  ngOnInit(): void {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDate = currentDateGMT7;
    this.getAppointmentList();
    this.getListGroupService();
  }

  getListGroupService() {
    const listGroupService = localStorage.getItem('listGroupService');
    if (listGroupService != null) {
      this.listGroupService = JSON.parse(listGroupService);
    }
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.listGroupService = res.data;
      localStorage.setItem("listGroupService", JSON.stringify(this.listGroupService));
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url + "/medical-procedure-group", error);
      }
    )
  }

  getAppointmentList() {
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); 
    const selectedDay = this.model.day.toString().padStart(2, '0'); 
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    var dateTime = this.currentDate + ' ' + "00:00:00";
    var startTime = this.dateToTimestamp(dateTime);
    const currentDate = new Date();
    const vnTimezoneOffset = 7 * 60;
    const vietnamTime = new Date(currentDate.getTime() + vnTimezoneOffset * 60 * 1000);
    const nextWeekDate = new Date(vietnamTime.getTime());
    nextWeekDate.setDate(vietnamTime.getDate() + 7);
    const dateFormatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const formattedDate = dateFormatter.format(nextWeekDate);
    var temp = formattedDate.split('/');
    var endTime = temp[2] + '-' + temp[0] + '-' + temp[1] + ' 23:59:59';
    this.nextDate = temp[2] + '-' + temp[0] + '-' + temp[1];
    this.appointmentService.getAppointmentList(startTime, this.dateToTimestamp(endTime)).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      localStorage.setItem("ListAppointment", JSON.stringify(this.appointmentList));
      this.filteredAppointments = this.appointmentList.filter(app => app.date === this.dateToTimestamp(selectedDate));
      this.filteredAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
      this.loading = false;
      this.appointmentDateInvalid();
    },
      error => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl + "/appointment/" + this.startDateTimestamp + "/" + this.endDateTimestamp, error);
      })
  }

  toggleChat() {
    this.webSocketService.toggleChat();
  }

  dateDis = {
    date: 0,
    procedure: '',
    count: 0,
  }

  datesDisabled: any[] = [];
  listDate: any[] = [];
  appointmentDateInvalid() {
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); 
    const selectedDay = this.model.day.toString().padStart(2, '0'); 
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    if (this.dateToTimestamp(this.nextDate) < this.dateToTimestamp(selectedDate) && this.dateToTimestamp(selectedDate) < this.dateToTimestamp(this.currentDate)) {
      this.appointmentService.getAppointmentList(this.dateToTimestamp(selectedDate+" 00:00:00"), this.dateToTimestamp(selectedDate+" 23:59:59")).subscribe(data => {
        this.appointmentList = ConvertJson.processApiResponse(data);
        localStorage.setItem("ListAppointment", JSON.stringify(this.appointmentList));
        this.filteredAppointments = this.appointmentList.filter(app => app.date === this.dateToTimestamp(selectedDate));
        this.filteredAppointments.forEach((a: any) => {
          this.dateEpoch = this.timestampToDate(a.date);
          a.appointments.forEach((b: any) => {
            b.details = b.details.sort((a: any, b: any) => a.time - b.time);
          })
        })
        this.loading = false;
      },
        error => {
          this.loading = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl + "/appointment/" + this.startDateTimestamp + "/" + this.endDateTimestamp, error);
        })
    } else {
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
    }
  }

  filterAppointments() {
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); 
    const selectedDay = this.model.day.toString().padStart(2, '0'); 
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    if (this.dateToTimestamp(this.nextDate) > this.dateToTimestamp(selectedDate) && this.dateToTimestamp(selectedDate) > this.dateToTimestamp(this.currentDate)) {
      
    } else {
      this.appointmentService.getAppointmentList(this.dateToTimestamp(selectedDate + " 00:00:00"), this.dateToTimestamp(selectedDate + " 23:59:59")).subscribe(data => {
        this.appointmentList = ConvertJson.processApiResponse(data);
        localStorage.setItem("ListAppointment", JSON.stringify(this.appointmentList));
        this.filteredAppointments = this.appointmentList.filter(app => app.date === this.dateToTimestamp(selectedDate));
        this.filteredAppointments.forEach((a: any) => {
          this.dateEpoch = this.timestampToDate(a.date);
          a.appointments.forEach((b: any) => {
            b.details = b.details.sort((a: any, b: any) => a.time - b.time);
          })
        })
        this.loading = false;
      },
        error => {
          this.loading = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl + "/appointment/" + this.startDateTimestamp + "/" + this.endDateTimestamp, error);
        })
    }
    if (this.selectedProcedure) {
      this.appointmentList = this.appointmentList.filter(app => app.date === this.dateToTimestamp(selectedDate));
      this.filteredAppointments = this.appointmentList
        .map((a: any) => {
          const filteredAppointments = a.appointments
            .filter((appointment: any) => appointment.procedure_id === this.selectedProcedure);
          return { ...a, appointments: filteredAppointments };
        })
        .filter((a: any) => a.appointments.length > 0);
      this.filteredAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        this.ePoch = a.date;
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
    } else {
      this.filteredAppointments = this.appointmentList.filter(app => app.date === this.dateToTimestamp(selectedDate));
      this.filteredAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        this.ePoch = a.date;
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
    }
  }

  searchAppointments() {
    const searchText = this.searchText.toLowerCase().trim();
    if (searchText) {
      this.filteredAppointments = this.appointmentList
        .map((a: any) => ({
          ...a,
          appointments: a.appointments.map((ap: any) => ({
            ...ap,
            details: ap.details.filter((detail: any) => {
              const patientName = detail.patient_name ? detail.patient_name.toLowerCase() : '';
              const patientId = detail.patient_id ? detail.patient_id.toLowerCase() : '';
              return patientName.includes(searchText) || patientId.includes(searchText);
            })
          })).filter((ap: any) => ap.details.length > 0)
        }))
        .filter((a: any) => a.appointments.length > 0);
    } else {
      this.filteredAppointments = this.appointmentList;
    }
  }

  onNewAppointmentAdded(newAppointment: any) {
    this.filteredAppointments = newAppointment;
  }

  selectedAppointment: ISelectedAppointment;
  dateString: any;
  timeString: any;
  openEditModal(appointment: any, dateTimestamp: any, event: Event) {
    this.dateString = this.timestampToDate(dateTimestamp);
    this.selectedAppointment = appointment;
    this.timeString = this.timestampToTime(appointment.time);
    event.stopPropagation();
  }

  deleteAppointment(appointment: any, dateTimestamp: any, event: Event) {
    event.stopPropagation();
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = `Bạn có chắc chắn muốn xóa lịch hẹn của bệnh nhân ${appointment.patient_name} không?`;
    modalRef.result.then((result) => {
      if (result === true) {
        this.DELETE_APPOINTMENT_BODY = {
          epoch: dateTimestamp,
          new_epoch: 0,
          appointment: {
            patient_id: ' ',
            patient_name: ' ',
            procedure_id: ' ',
            procedure_name: ' ',
            phone_number: ' ',
            doctor: ' ',
            status: 2,
            time: 0
          }

        } as IEditAppointmentBody;
        this.appointmentService.deleteAppointment(dateTimestamp, appointment.appointment_id).subscribe(response => {
          this.showSuccessToast('Xóa lịch hẹn thành công!');
          this.filteredAppointments = this.filteredAppointments.map((app: any) => ({
            ...app,
            appointments: app.appointments.map((ap: any) => ({
              ...ap,
              details: ap.details.filter((detail: any) => detail.appointment_id !== appointment.appointment_id)
            })).filter((ap: any) => ap.details.length > 0)
          })).filter((app: any) => app.appointments.length > 0);

          console.log("Đã xóa: ", this.filteredAppointments);
          //this.startDate = `${this.startDateNgb.year}-${this.pad(this.startDateNgb.month)}-${this.pad(this.startDateNgb.day)}`;
          if (this.startDate == this.timestampToDate(this.DELETE_APPOINTMENT_BODY.epoch)) {
            this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'minus', 'app');
          }
        }, error => {
          localStorage.setItem('ListAppointment', JSON.stringify(this.filteredAppointments));
          this.showErrorToast("Lỗi khi cập nhật");
          this.showErrorToast("Lỗi khi xóa");
        });
      }
    }, (reason) => {

    });

  }

  Exchange = {
    epoch: "",
    produce_id: "0",
    produce_name: '',
    patient_id: '',
    patient_name: '',
    reason: '',
    status: "1",
    appointment_id: '',
    appointment_epoch: '',
    patient_created_date: '',
  }

  waitingRoomData: any;
  filteredWaitingRoomData: any[] = [];
  listPatientId: any[] = [];
  getWaitingRoomData() {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        this.waitingRoomData.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        this.waitingRoomData.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
        this.listPatientId = this.waitingRoomData.map((item: any) => item.patient_id);
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.filteredWaitingRoomData = [...this.waitingRoomData];
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
  }

  ListPatientWaiting: any[] = []
  status: boolean = true;
  postExchangeAppointmentToWaitingRoom(a: any, b: any, event: Event) {
    let status = true;
    const listWaiting = localStorage.getItem('ListPatientWaiting');
    if (listWaiting != null) {
      this.filteredWaitingRoomData = JSON.parse(listWaiting);
    } else {
      this.waitingRoomService.getWaitingRooms().subscribe(
        data => {
          this.waitingRoomData = data;
          this.waitingRoomData.forEach((i: any) => {
            i.date = this.timestampToTime(i.epoch)
          });
          const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
          this.waitingRoomData.sort((a: any, b: any) => {
            const orderA = statusOrder[a.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
            const orderB = statusOrder[b.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
            return orderA - orderB;
          });
          this.listPatientId = this.waitingRoomData.map((item: any) => item.patient_id);
          this.filteredWaitingRoomData = [...this.waitingRoomData];
          localStorage.setItem("ListPatientWaiting", JSON.stringify(this.ListPatientWaiting));
        })
    }

    this.filteredWaitingRoomData.forEach((data: any) => {
      if (data.patient_id == b.patient_id) {
        status = false;
        this.showErrorToast('Bệnh nhân đã có trong hàng chờ!');
      }
    })
    if (status == true) {
      const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
      this.Exchange.epoch = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
      this.Exchange.patient_id = b.patient_id;
      this.Exchange.patient_name = b.patient_name;
      this.Exchange.produce_id = b.procedure_id;
      this.Exchange.produce_name = b.procedure_name;
      this.Exchange.reason = b.reason;
      this.Exchange.appointment_id = b.appointment_id;
      this.Exchange.appointment_epoch = a;
      this.Exchange.patient_created_date = b.patient_created_date;
      this.receptionistWaitingRoom.postWaitingRoom(this.Exchange).subscribe(
        (data) => {
          let updatePatient = {
            epoch: parseInt(a),
            new_epoch: parseInt(a),
            appointment: {
              patient_id: b.patient_id,
              patient_name: b.patient_name,
              phone_number: b.phone_number,
              procedure_id: b.procedure_id,
              procedure_name: b.procedure_name,
              reason: b.reason,
              doctor: b.doctor,
              status: 3,
              time: b.time,
              patient_created_date: ''
            }
          }
          this.ListPatientWaiting.push(updatePatient);
          this.appointmentService.putAppointment(updatePatient, this.Exchange.appointment_id).subscribe((data) => {
            this.showSuccessToast(`Đã thêm bệnh nhân ${this.Exchange.patient_name} và hàng đợi`);
          })
          localStorage.setItem("ListPatientWaiting", JSON.stringify(this.ListPatientWaiting));
          this.Exchange = {
            epoch: "0",
            produce_id: "0",
            produce_name: '',
            patient_id: '',
            patient_name: '',
            reason: '',
            status: "1",
            appointment_id: '',
            appointment_epoch: '',
            patient_created_date: '',
          }
          window.location.href = "/letan/phong-cho";
        },
        (error) => {
          this.loading = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.receptionistWaitingRoom.apiUrl + "/waiting-room", error);
        }
      );
    }
    // },
    // (error) => {
    //   this.loading = false;
    //   ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
    // }
    //);
    event.stopPropagation();
  }

  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }

  navigateToPatientDetail(patientId: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', patientId]);
  }

  openAddAppointmentModal() {
    this.filteredAppointments = this.filteredAppointments;
    this.datesDisabled = this.datesDisabled;
  }

  timeToTimestamp(timeStr: string): number {
    const time = moment(timeStr, "HH:mm:ss");
    const timestamp = time.unix(); // Lấy timestamp tính bằng giây
    return timestamp;
  }
  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  checkDate(date: any) {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    if (this.timestampToDate(date) < currentDateGMT7) {
      return false;
    }
    return true;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }

  addItem(newItem: any) {
    this.filteredAppointments.push({
      appointment_id: '', attribute_name: '',
      doctor: newItem.appointment.doctor, epoch: newItem.epoch, migrated: false, patient_id: newItem.appointment.patient_id, patient_name: newItem.appointment.patient_name, phone_number: newItem.appointment.phone_number,
      procedure_id: newItem.appointment.procedure_id, procedure_name: newItem.appointment.procedure_name, time: newItem.appointment.time
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
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
  }
  details(id: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', id])
  }
}
