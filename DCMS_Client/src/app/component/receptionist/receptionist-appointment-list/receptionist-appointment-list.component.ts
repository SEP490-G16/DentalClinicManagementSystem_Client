import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDatepickerConfig, NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReceptionistAppointmentService } from "../../../service/ReceptionistService/receptionist-appointment.service";
import { CognitoService } from "../../../service/cognito.service";
import { Appointment, DateDisabledItem, Detail, IEditAppointmentBody, ISelectedAppointment, RootObject } from "../../../model/IAppointment";
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
import { FormatNgbDate } from '../../utils/libs/formatNgbDate';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css'],
  animations: [
    trigger('fadeOut', [
      state('void', style({ opacity: 0 })),
      transition('* => void', [animate('1s')])
    ])
  ]
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
  filteredAppointments: any[] = [];
  appointmentList: RootObject[] = [];
  listGroupService: any[] = [];
  currentDate: any;
  startDate: any;
  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  nextDate: any;

  // Set the minimum date to January 1, 1900
  minDate: NgbDateStruct = { year: 1900, month: 1, day: 1 };

  // Set the maximum date to 30 years from the current year
  maxDate: NgbDateStruct = this.calculateMaxDate();

  selectedDateCache: any;
  constructor(private appointmentService: ReceptionistAppointmentService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private receptionistWaitingRoom: ReceptionistWaitingRoomService,
    private config: NgbDatepickerConfig,
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

  calculateMaxDate(): NgbDateStruct {
    const currentYear = new Date().getFullYear();
    return { year: currentYear + 30, month: 12, day: 31 };
  }


  ngOnInit(): void {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDate = currentDateGMT7;
    //this.getAppointmentList();
    this.getListAppointmentNew();
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

  newAppointment = {
    date: 0,
    appointments: [] as newApp[]
  }

  unqueList: any[] = [];
  listNewAppointment: any[] = [];
  getListAppointmentNew() {
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0');
    const selectedDay = this.model.day.toString().padStart(2, '0');
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    this.unqueList = [];
    this.filteredAppointments = [];
    this.newAppointment = {
      date: 0,
      appointments: [] as newApp[]
    };
    this.appointmentService.getAppointmentListNew(1, this.dateToTimestamp(selectedDate)).subscribe((data) => {
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
      this.listNewAppointment = this.filteredAppointments;
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

  filterAppointments() {
    if (this.selectedProcedure) {
      this.filteredAppointments = this.listNewAppointment
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
      this.filteredAppointments = this.listNewAppointment;
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

  openAddAppointmentModal() {
    this.selectedDateCache = FormatNgbDate.formatNgbDateToString(this.model);
    this.filteredAppointments = this.filteredAppointments;
    this.datesDisabled = this.datesDisabled;
  }

  onNewAppointmentAdded(newAppointment: any) {
    this.selectedDateCache = FormatNgbDate.formatNgbDateToString(this.model);
    this.filteredAppointments = newAppointment;
  }

  selectedAppointment: ISelectedAppointment;
  dateString: any;
  timeString: any;
  openEditModal(appointment: any, dateTimestamp: any, event: Event) {
    this.selectedDateCache = FormatNgbDate.formatNgbDateToString(this.model);
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
        this.appointmentService.deleteAppointmentNew(appointment.appointment_id).subscribe(response => {
          this.showSuccessToast('Xóa lịch hẹn thành công!');
          //Animation
          const appointmentElement = document.getElementById('appointment-' + appointment.appointment_id);
          if (appointmentElement) {
            appointmentElement.classList.add('fade-and-slide-out');
            setTimeout(() => {
              this.filteredAppointments = this.filteredAppointments.map((app: any) => ({
                ...app,
                appointments: app.appointments.map((ap: any) => ({
                  ...ap,
                  details: ap.details.filter((detail: any) => detail.appointment_id !== appointment.appointment_id)
                })).filter((ap: any) => ap.details.length > 0)
              })).filter((app: any) => app.appointments.length > 0);
            }, 500); // The timeout should match the animation duration
          }
          const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
          this.currentDate = currentDateGMT7;
          if (this.currentDate == this.timestampToDate(appointment.appointment_id.split('::')[0])) {
            this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'minus', 'app');
          }
          window.location.reload();
        }, error => {
          if (this.currentDate == this.timestampToDate(appointment.appointment_id.split('::')[0])) {
            this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'minus', 'app');
          }
          const appointmentElement = document.getElementById('appointment-' + appointment.appointment_id);
          if (appointmentElement) {
            appointmentElement.classList.add('fade-and-slide-out');
            setTimeout(() => {
              this.filteredAppointments = this.filteredAppointments.map((app: any) => ({
                ...app,
                appointments: app.appointments.map((ap: any) => ({
                  ...ap,
                  details: ap.details.filter((detail: any) => detail.appointment_id !== appointment.appointment_id)
                })).filter((ap: any) => ap.details.length > 0)
              })).filter((app: any) => app.appointments.length > 0);
            }, 500); // The timeout should match the animation duration
          }
        }
        );
      }
    }, (reason) => {

    });

  }

  Exchange = {
    epoch: '',
    time_attr: '',
    produce_id: '',
    produce_name: '',
    patient_id: '',
    patient_name: '',
    is_new: true,
    reason: '',
    status_attr: '',
    foreign_sk: '',
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
  postExchangeAppointmentToWaitingRoom(epoch: any, appointmentSelected: any, event: Event) {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        var ListResPonse = data;
        ListResPonse.forEach((item:any) => {
          var skey = item.SK.S;
          let a = {
            type: 'w',
            epoch: item.time_attr.N, 
            produce_id: item.procedure_attr.M.id.S,
            produce_name: item.procedure_attr.M.name.S,
            patient_id: skey.split('::')[1],
            patient_name: item.patient_attr.M.name.S,
            patient_created_date: item.patient_attr.M.is_new.BOOL == true ? '1' : '2',
            reason: item.reason_attr.S,
            status: item.status_attr.N,
            appointment_id: '',
            appointment_epoch: '', 
            sk: skey, 
            fk: item.foreign_sk.S,
          }
          this.waitingRoomData.push(a);
        })
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
    // this.waitingRoomData.forEach((data: any) => {
    //   if (data.patient_id == appointmentSelected.patient_id) {
    //     this.showErrorToast('Bệnh nhân đã có trong hàng chờ!');
    //     return;
    //   }
    // })
  
    const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    this.Exchange.epoch = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
    this.Exchange.patient_id = appointmentSelected.patient_id;
    this.Exchange.patient_name = appointmentSelected.patient_name;
    this.Exchange.produce_id = appointmentSelected.procedure_id;
    this.Exchange.produce_name = appointmentSelected.procedure_name;
    this.Exchange.reason = appointmentSelected.reason;
    this.Exchange.is_new = appointmentSelected.patient_created_date == '1' ? true : false;
    this.Exchange.time_attr = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
    this.Exchange.foreign_sk = this.Exchange.epoch+"::"+this.Exchange.patient_id;
    this.Exchange.status_attr = '1';
    this.receptionistWaitingRoom.postWaitingRoomNew(this.Exchange).subscribe(
      () => {
        // let update1 = {
        //   epoch: parseInt(epoch),
        //   new_epoch: parseInt(epoch),
        //   patient_id: appointmentSelected.patient_id,
        //   patient_name: appointmentSelected.patient_name,
        //   phone_number: appointmentSelected.phone_number,
        //   procedure_id: appointmentSelected.procedure_id,
        //   procedure_name: appointmentSelected.procedure_name,
        //   reason: appointmentSelected.reason,
        //   doctor: appointmentSelected.doctor,
        //   status: 3,
        //   time: appointmentSelected.time,
        //   patient_created_date: appointmentSelected.patient_created_date
        // }
        // if (this.ListPatientWaiting != null && this.ListPatientWaiting != undefined && this.ListPatientWaiting.length != 0) {
        //   this.ListPatientWaiting.forEach((item: any) => {
        //     if (item.epoch == update1.epoch) {
        //       if (item.appointment.patient_id == update1.patient_id) {
        //         item = update1;
        //       }
        //     }
        //   })
        // } else {
        //   this.ListPatientWaiting.push(update1);
        // }

        //Cập nhật lịch hẹn
        let PutAppointment = {
          epoch: parseInt(epoch),
          new_epoch: parseInt(epoch),
          appointment: {
            patient_id: appointmentSelected.patient_id,
            patient_name: appointmentSelected.patient_name,
            phone_number: appointmentSelected.phone_number,
            procedure_id: appointmentSelected.procedure_id,
            procedure_name: appointmentSelected.procedure_name,
            reason: appointmentSelected.reason,
            doctor_attr: appointmentSelected.doctor,
            status_attr: 3,
            time_attr: appointmentSelected.time,
            is_new: appointmentSelected.patient_created_date == 1 ? true : false
          }
        }
        this.appointmentService.putAppointmentNew(PutAppointment, appointmentSelected.appointment_id).subscribe((data) => {
          this.showSuccessToast(`Đã thêm bệnh nhân ${this.Exchange.patient_name} vào hàng đợi`);
          localStorage.setItem("ListPatientWaiting", JSON.stringify(this.ListPatientWaiting));
        }) 
        this.router.navigate(['phong-cho'])
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.receptionistWaitingRoom.apiUrl + "/waiting-room", error);
      }
    );
    event.stopPropagation();
  }

  navigateToPatientDetail(patientId: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', patientId]);
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
  details(id: any, reason: any) {
    if (reason != '' || reason != null) {
      sessionStorage.setItem('examination_reason', reason);
    }
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', id])
  }
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
