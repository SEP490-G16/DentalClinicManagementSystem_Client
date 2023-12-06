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

  model!: NgbDateStruct;
  placement = 'bottom';
  DELETE_APPOINTMENT_BODY: IEditAppointmentBody

  constructor(private appointmentService: ReceptionistAppointmentService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private receptionistWaitingRoom: ReceptionistWaitingRoomService,
    private cognito: CognitoService,
    private sendMessageSocket: SendMessageSocket
  ) {
    this.DELETE_APPOINTMENT_BODY = {
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
    this.selectedAppointment = {
      appointment_id: '',
      patient_id: '',
      patient_name: '',
      doctor: '',
      procedure: '',
      phone_number: ''
    } as ISelectedAppointment;
  }

  selectedProcedure: string = '';
  searchText: string = '';
  filteredAppointments: any;
  appointmentList: RootObject[] = [];

  listGroupService: any[] = [];
  listDoctor: any[] = [];
  listDoctorDisplay: any[] = [];
  doctorObject = {
    sub_id: '',
    doctorName: '',
    phoneNumber: '',
    roleId: '',
    zoneInfo: ''
  }
  abcd: any[] = [];
  dateEpoch: string = "";
  ePoch: string = "";

  startDate: any;
  startDateNgb!: NgbDateStruct;
  endDate: string = "2024-1-31";


  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  ngOnInit(): void {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh');

    this.startDateNgb = {
      year: currentDateGMT7.year(),
      month: currentDateGMT7.month() + 1,
      day: currentDateGMT7.date()
    };
    this.startDate = `${this.startDateNgb.year}-${this.pad(this.startDateNgb.month)}-${this.pad(this.startDateNgb.day)}`;
    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7.format("YYYY-MM-DD"));
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);

    this.getAppointmentList();
    this.getListGroupService();
    this.getListDoctor();
  }

  pad(number: number) {
    return (number < 10) ? `0${number}` : number;
  }

  getListDoctor() {
    this.cognito.getListStaff().subscribe((res) => {
      this.listDoctor = res.message;
      this.listDoctorDisplay.splice(0, this.listDoctorDisplay.length);
      this.listDoctor.forEach((staff: any) => {
        staff.Attributes.forEach((attr: any) => {
          if (attr.Name == 'custom:role') {
            this.doctorObject.roleId = attr.Value;
          }
          if (attr.Name == 'sub') {
            this.doctorObject.sub_id = attr.Value;
          }
          if (attr.Name == 'name') {
            this.doctorObject.doctorName = attr.Value;
          }
          if (attr.Name == 'phone_number') {
            this.doctorObject.phoneNumber = attr.Value;
          }
          if (attr.Name == 'zoneinfo') {
            this.doctorObject.zoneInfo = attr.Value;
          }
        })
        if (this.doctorObject.roleId == "2") {
          this.listDoctorDisplay.push(this.doctorObject);
        }
        this.doctorObject = {
          sub_id: '',
          doctorName: '',
          phoneNumber: '',
          roleId: '',
          zoneInfo: ''
        }
      })
      localStorage.setItem("listDoctor", JSON.stringify(this.listDoctorDisplay));
    })
  }

  getListGroupService() {
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
    this.loading = true;
    this.startDate = `${this.startDateNgb.year}-${this.pad(this.startDateNgb.month)}-${this.pad(this.startDateNgb.day)}`;
    this.startDateTimestamp = this.dateToTimestamp(this.startDate + " 00:00:00");
    this.endDateTimestamp = this.dateToTimestamp(this.startDate + " 23:59:59");
    this.appointmentService.getAppointmentList(this.startDateTimestamp, this.endDateTimestamp).subscribe(data => {
      console.log("check data appo", data);
      this.appointmentList = ConvertJson.processApiResponse(data);
      localStorage.setItem("ListAppointment", JSON.stringify(this.appointmentList));
      this.filteredAppointments = this.appointmentList.filter(app => app.date === this.startDateTimestamp);
      this.filteredAppointments.forEach((a: any) => {
        this.dateEpoch = this.timestampToDate(a.date);
        a.appointments.forEach((b: any) => {
          b.details = b.details.sort((a: any, b: any) => a.time - b.time);
        })
      })
      this.loading = false;
      console.log(this.filteredAppointments);
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
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var dateTime = date + ' ' + "00:00:00";
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
    this.appointmentService.getAppointmentList(startTime, this.dateToTimestamp(endTime)).subscribe(data => {
      this.listDate = ConvertJson.processApiResponse(data);
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
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.appointmentService.apiUrl + "/appointment/" + startTime + "/" + endTime, error);
      })
  }


  filterAppointments() {
    if (this.selectedProcedure) {
      this.appointmentList = this.appointmentList.filter(app => app.date === this.startDateTimestamp);
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
      // Nếu không có selectedProcedure, hiển thị toàn bộ danh sách
      this.filteredAppointments = this.appointmentList;
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
    console.log(searchText);
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
    console.log(newAppointment);
    this.filteredAppointments = newAppointment;
  }

  selectedAppointment: ISelectedAppointment;
  dateString: any;
  timeString: any;
  openEditModal(appointment: any, dateTimestamp: any, event: Event) {
    console.log("DateTimestamp", dateTimestamp);
    this.dateString = this.timestampToDate(dateTimestamp);
    console.log("DateString", this.dateString);

    this.selectedAppointment = appointment;
    this.timeString = this.timestampToTime(appointment.time);
    console.log("Time, ", this.timeString);
    event.stopPropagation();
  }

  deleteAppointment(appointment: any, dateTimestamp: any, event: Event) {
    event.stopPropagation();
    console.log(appointment);
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
          console.log("Xóa thành công");
          this.showSuccessToast('Xóa lịch hẹn thành công!');
          this.filteredAppointments = this.filteredAppointments.map((app: any) => ({
            ...app,
            appointments: app.appointments.map((ap: any) => ({
              ...ap,
              details: ap.details.filter((detail: any) => detail.appointment_id !== appointment.appointment_id)
            })).filter((ap: any) => ap.details.length > 0)
          })).filter((app: any) => app.appointments.length > 0);

          console.log("Đã xóa: ", this.filteredAppointments);
          this.startDate = `${this.startDateNgb.year}-${this.pad(this.startDateNgb.month)}-${this.pad(this.startDateNgb.day)}`;
          if (this.startDate == this.timestampToDate(this.DELETE_APPOINTMENT_BODY.epoch)) {
            this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'minus', 'app');
          }

        }, error => {
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
        console.log(data)
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
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.filteredWaitingRoomData = [...this.waitingRoomData]; // Update the filtered list as well
        console.log(this.filteredWaitingRoomData)
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
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        console.log(data)
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
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.filteredWaitingRoomData = [...this.waitingRoomData]; // Update the filtered list as well
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
              //this.showErrorToast('Lỗi khi tạo lịch hẹn!');
            }
          );
        }
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
    event.stopPropagation();
  }

  // listRegisterTime: any[] = [];
  // uniqueList: string[] = [];
  // listDoctorFilter: any[] = [];
  // totalDoctorFilter: number = 0;

  // getTimeKeeping(date: any) {
  //   const selectedYear = this.model.year;
  //   const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
  //   const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

  //   const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
  //   this.timeKeepingService.getFollowingTimekeeping(this.dateToTimestamp(selectedDate + " 00:00:00"), this.dateToTimestamp(selectedDate + " 23:59:59")).subscribe(data => {
  //     this.listRegisterTime = this.organizeData(data);
  //     this.listDoctorFilter.splice(0, this.listDoctorFilter.length);
  //     this.listRegisterTime.forEach((res: any) => {
  //       res.records.forEach((doc: any) => {
  //         if (doc.details.register_clock_in < this.timeToTimestamp(date) && this.timeToTimestamp(date) < doc.details.register_clock_out) {
  //           if (!this.uniqueList.includes(doc.subId)) {
  //             this.uniqueList.push(doc.subId);
  //             let newDoctorInfor = {
  //               doctorId: doc.subId,
  //               docterName: doc.details.staff_name
  //             }
  //             this.listDoctorFilter.push(newDoctorInfor);
  //           }
  //         }
  //       })
  //     })
  //   });
  // }

  organizeData(data: any[]): TimekeepingRecord[] {
    return data.map((item): TimekeepingRecord => {
      const timekeepingEntry: TimekeepingRecord = {
        epoch: item.epoch?.N,
        type: item.type?.S,
        records: []
      };

      Object.keys(item).forEach((key: string) => {
        if (key !== 'epoch' && key !== 'type') {
          const details: TimekeepingDetail = {
            register_clock_in: item[key]?.M?.register_clock_in?.N,
            register_clock_out: item[key]?.M?.register_clock_out?.N,
            staff_name: item[key]?.M?.staff_name?.S,
          };
          timekeepingEntry.records.push({
            subId: key,
            details: details
          });
        }
      });

      return timekeepingEntry;
    });
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
    console.log("Filtered Appointment: ", this.filteredAppointments);
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

    console.log(this.filteredAppointments);
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

interface TimekeepingDetail {
  register_clock_in?: string;
  register_clock_out?: string;
  staff_name?: string;
}
interface TimekeepingSubRecord {
  subId: string;
  details: TimekeepingDetail;
}

interface TimekeepingRecord {
  epoch: string;
  type?: string;
  records: TimekeepingSubRecord[];
}
