import { ResponseHandler } from './../../utils/libs/ResponseHandler';
import {
  Component, OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  isAfter,
  startOfWeek,
  isWithinInterval,
  endOfWeek,
} from 'date-fns';


import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';

import { EventColor } from 'calendar-utils';
import * as moment from 'moment';
import 'moment/locale/vi';
import { ToastrService } from 'ngx-toastr';
import { ReceptionistTimekeepingService } from 'src/app/service/ReceptionistService/receptionist-timekeeping.service';
import { RegisterWorkSchedule, RequestBodyTimekeeping, StaffRegisterWorkSchedule } from 'src/app/model/ITimekeeping';
import { Router } from "@angular/router";
import { CognitoService } from 'src/app/service/cognito.service';
import { ConfirmDeleteModalComponent } from './ConfirmDeleteModal.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isThisWeek, addWeeks, isSameWeek } from 'date-fns';

const colors: Record<string, EventColor> = {
  gray: {
    primary: '#666',
    secondary: '#666'
  },
  pink: {
    primary: '#ff1493',
    secondary: '#ff69b4',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  green: {
    primary: '#008000',
    secondary: '#ADFF2F',
  },
  purple: {
    primary: '#800080',
    secondary: '#DA70D6',
  },
  orange: {
    primary: '#FFA500',
    secondary: '#FFDAB9',
  }
};


@Component({
  selector: 'app-register-work-schedule',
  templateUrl: './register-work-schedule.component.html',
  styleUrls: ['./register-work-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterWorkScheduleComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  modalData!: {
    action: string;
    event: CalendarEvent;
  };
  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;

  viewDate: Date = new Date();


  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        //this.handleEventClick(event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        //this.handleDeleteClick(event);
      },
    },
  ];


  refresh = new Subject<void>();
  worksRegister: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  Body: RequestBodyTimekeeping = {} as RequestBodyTimekeeping;
  Staff: StaffRegisterWorkSchedule[] = [];
  //Current
  currentDateTimeStamp: number = 0;
  currentTimeTimeStamp: number = 0;
  currentDateGMT7: string = "";
  currentTimeGMT7: string = "";

  startOfWeek!: Date;
  endOfWeek!: Date;

  registerWorkSchedule: any
  startTime: number = 0;
  endTime: number = 0;
  registerOnWeeks: any
  weekTimestamps: number[] = [];

  roleId: any;

  searchTimeout: any;
  eventForm!: FormGroup;
  editEventForm!: FormGroup;
  UserObj: User | null = {} as User | null;

  constructor(private modal: NgbModal,
    private cognitoService: CognitoService,
    private timekeepingService: ReceptionistTimekeepingService,
    private toastr: ToastrService,
    private router: Router
  ) {
    moment.locale('vi');
    moment.tz.setDefault('Asia/Ho_Chi_Minh');
    this.viewDate = moment().startOf('week').toDate();

    //Get Date
    this.currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
    //Set epoch to body
    this.currentDateTimeStamp = this.dateToTimestamp(this.currentDateGMT7);
    console.log("Current Date Timestamp: ", this.currentDateTimeStamp);
    this.currentTimeTimeStamp = this.timeAndDateToTimestamp(this.currentTimeGMT7, this.currentDateGMT7);
    console.log("CurrentTimes: ", this.currentTimeTimeStamp);
    //Set week
    for (let i = 0; i < 7; i++) {
      this.weekTimestamps.push(moment.tz('Asia/Ho_Chi_Minh').startOf('week').add(i, 'days').unix());
    }
    console.log("WeekTimes: ", this.weekTimestamps);
    this.startTime = this.weekTimestamps[0];
    this.endTime = this.weekTimestamps[6];

    this.startOfWeek = moment(this.viewDate).startOf('isoWeek').toDate();
    this.endOfWeek = moment(this.viewDate).endOf('isoWeek').toDate();
  }

  ngOnInit(): void {
    const role = sessionStorage.getItem("role");
    if (role != null) {
      this.roleId = role;
    }
    var storedUserJsonString = sessionStorage.getItem('UserObj');

    if (storedUserJsonString !== null) {
      var storedUserObject: User = JSON.parse(storedUserJsonString);
      this.UserObj = storedUserObject;
      console.log(this.UserObj);
    } else {
      this.UserObj = null;
    }
    this.DisplayResgisterTimeByWeek();
  }

  listDisplayClone: any[] = [];
  DisplayResgisterTimeByWeek() {
    this.getDateinFromDatetoToDate(this.timestampToGMT7Date(this.startTime), this.timestampToGMT7Date(this.endTime));
    this.timekeepingService.getTimekeeping(this.startTime, this.endTime)
      .subscribe(data => {
        this.registerOnWeeks = this.organizeData(data);
        console.log(this.registerOnWeeks)
        this.registerOnWeeks.forEach((item: any) => {
          this.listDay.forEach((it: any) => {
            let da = this.timestampToGMT7Date(item.epoch);
            const ab = da.split('-');
            const check = ab[2] + "/" + ab[1] + "/" + ab[0];
            if (it == check) {
              item.records.forEach((i: any) => {
                let registerObject = {
                  currentD: it.currentD,
                  staffId: i.subId,
                  staffName: i.staff_name,
                  register_clock_in: i.register_clock_in,
                  register_clock_out: i.register_clock_out,
                  clock_in: i.clock_in,
                  clock_out: i.clock_out,
                  timekeeper_name: i.timekeeper_name,
                  timekeeper_avt: i.timekeeper_avt,
                  status: 1,
                  isSang: false,
                  isChieu: false
                }
                if (registerObject.register_clock_in == '1' && registerObject.register_clock_out == '2') {
                  registerObject.isSang = true;
                  registerObject.isChieu = true;
                }

                if (registerObject.register_clock_in == '1' && registerObject.register_clock_out == '0') {
                  registerObject.isSang = true;
                  registerObject.isChieu = false;
                }

                if (registerObject.register_clock_in == '0' && registerObject.register_clock_out == '2') {
                  it.isSang = false;
                  it.isChieu = true;
                }
                this.listDisplayClone.push(registerObject);
              })
            }
          })
        })
      }
      )
  }

  listDayInMonth: any[] = [];
  listDay: string[] = [];
  registerObject = {
    currentD: '',
    staffId: '',
    staffName: '',
    register_clock_in: '0',
    register_clock_out: '0',
    isSang: false,
    isChieu: false
  }
  first: number = 1;
  getDateinFromDatetoToDate(frDate: string, tDate: string) {
    this.listDayInMonth.splice(0, this.listDayInMonth.length);
    const current = new Date();
    const startDateParts = frDate.split('-');
    const endDateParts = tDate.split('-');
    const startDate = new Date(
      parseInt(startDateParts[0]),
      parseInt(startDateParts[1]) - 1,
      parseInt(startDateParts[2])
    );

    const endDate = new Date(
      parseInt(endDateParts[0]),
      parseInt(endDateParts[1]) - 1,
      parseInt(endDateParts[2])
    );

    let currentDate = startDate;
    while (currentDate <= endDate) {
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
      let registerObject = {
        currentD: formattedDate,
        staffId: '',
        staffName: '',
        register_clock_in: '',
        register_clock_out: '',
        clock_in: 0,
        clock_out: 0,
        timekeeper_name: "",
        timekeeper_avt: "",
        status: 1,
        isSang: false,
        isChieu: false
      }
      this.listDay.push(formattedDate);
      this.listDayInMonth.push(registerObject);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  checkSang(item: any) {
    this.listDayInMonth.forEach((it: any) => {
      if (it.currentD == item.currentD) {
        it.isSang = !item.isSang;
        return;
      }
    })
  }

  checkChieu(item: any) {
    this.listDayInMonth.forEach((it: any) => {
      if (it.currentD == item.currentD) {
        it.isChieu = !item.isChieu;
        return;
      }
    })
  }

  ResgisterByWeek() {
    const subId = sessionStorage.getItem('sub');
    const staff_name = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');

    if (subId == null) {
      return;
    }

    else if (staff_name == null) {
      return;
    }

    else if (role == null) {
      return
    }

    this.listDayInMonth.forEach((item: any) => {
      let RequestBody: RequestBodyTimekeeping = {
        epoch: this.dateToTimestamp(item.currentD),
        sub_id: subId,
        staff_name: staff_name,
        staff_avt: "",
        role: role,
        register_clock_in: 0,
        register_clock_out: 0,
        clock_in: item.clock_in,
        clock_out: item.clock_out,
        timekeeper_name: item.timekeeper_name,
        timekeeper_avt: item.timekeeper_avt,
        status: 1
      };

      if (item.isSang == true && item.isChieu == true) {
        RequestBody.register_clock_in = 1;
        RequestBody.register_clock_out = 2;
      }
      if (item.isSang == true && item.isChieu == false) {
        RequestBody.register_clock_in = 1;
        RequestBody.register_clock_out = 0;
      }
      if (item.isSang == false && item.isChieu == true) {
        RequestBody.register_clock_in = 1;
        RequestBody.register_clock_out = 0;
      }
      if (item.isSang == false && item.isChieu == false) {
        RequestBody.register_clock_in = 0;
        RequestBody.register_clock_out = 0;
      }
      this.timekeepingService.postTimekeeping(RequestBody)
        .subscribe((res) => {
          this.toastr.success(res.message, "Thêm lịch làm việc mới thành công")
          this.refresh.next();
        },
          (err) => {
            this.toastr.error(err.error.message, "Đăng ký lịch làm việc thất bại");
          })

    })
  }


  //Option Map
  getRegisterWorkSchedule() {
    console.log("Thứ 2: ", this.timestampToGMT7Date(this.startTime));
    console.log("Chủ nhật: ", this.timestampToGMT7Date(this.endTime));
    this.timekeepingService.getTimekeeping(this.startTime, this.endTime)
      .subscribe(data => {
        this.registerOnWeeks = this.organizeData(data);
        console.log("Api: ", data);
        console.log("RegisterOnWeeks: ", this.registerOnWeeks);

        let recordsMap = new Map();
        this.registerOnWeeks.forEach((registerWorkSchedule: any) => {
          registerWorkSchedule.records.forEach((record: any) => {
            if (!recordsMap.has(record.subId)) {
              recordsMap.set(record.subId, []);
            }
            recordsMap.get(record.subId).push(record);
          });
        });

        console.log("Staff có undefined hay ko?: ", this.Staff);
        this.Staff.forEach(staff => {
          staff.registerSchedules = {};
          this.weekTimestamps.forEach(weekTimestamp => {
            staff.registerSchedules[weekTimestamp] = { startTime: '', endTime: '' };

            let Staff_RegisterWorkRecords = recordsMap.get(staff.subId);
            if (Staff_RegisterWorkRecords) {
              Staff_RegisterWorkRecords.forEach((record: any) => {
                if (record.epoch === weekTimestamp.toString()) {
                  if (this.UserObj != null && record.subId === this.UserObj.subId) {
                    this.UserObj.clock_in = record.clock_in;
                    this.UserObj.clock_out = record.clock_out;
                  }
                  staff.clock_in = (record.clock_in !== undefined) ? record.clock_in : 0;
                  staff.clock_out = (record.clock_out !== undefined) ? record.clock_out : 0;
                  staff.registerSchedules[weekTimestamp].startTime =
                    (record.register_clock_in !== undefined && record.register_clock_in !== '0') ? record.register_clock_in : '';
                  staff.registerSchedules[weekTimestamp].endTime =
                    (record.register_clock_out !== undefined && record.register_clock_out !== '0')
                      ? record.register_clock_out
                      : '';
                  staff.epoch = record.epoch;

                }
              });
            }

            //this.convertStaffToEvents();
          });
        });
        console.log("Staff Work Register: ", this.Staff);
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl + "/timekeeping/" + this.startTime + "/" + this.endTime, error);
        }
      )
  }



  // convertStaffToEvents() {
  //   this.worksRegister = [];

  //   this.Staff.forEach(staffMember => {
  //     Object.entries(staffMember.registerSchedules).forEach(([epoch, schedule]) => {
  //       if (schedule.startTime && schedule.endTime) {

  //         const startTime = new Date(parseInt(schedule.startTime) * 1000);
  //         const endTime = new Date(parseInt(schedule.endTime) * 1000);

  //         const newEvent = {
  //           start: startTime,
  //           end: endTime,
  //           title: staffMember.name,
  //           color: this.setColorByRole(staffMember.role),
  //           actions: this.actions,
  //           resizable: {
  //             beforeStart: true,
  //             afterEnd: true,
  //           },
  //           draggable: true,
  //         };
  //         this.worksRegister.push(newEvent);
  //         this.refresh.next();
  //       }
  //     });
  //   });
  // }

  //Tổ chức mảng:
  organizeData(data: any[]): RegisterWorkSchedule[] {
    return data.map((item) => {
      const registerEntry: RegisterWorkSchedule = {
        epoch: item.epoch?.N,
        type: item.type?.S,
        records: []
      };

      Object.keys(item).forEach((key) => {
        if (key !== 'type') {
          registerEntry.records.push({
            epoch: item.epoch?.N,
            subId: key,
            clock_in: item[key]?.M?.clock_in?.N,
            clock_out: item[key]?.M?.clock_out?.N,
            register_clock_in: item[key]?.M?.register_clock_in?.N,
            register_clock_out: item[key]?.M?.register_clock_out?.N,
            staff_name: item[key]?.M?.staff_name?.S,
          });
        }
      });
      return registerEntry;
    });
  }

  // tempColor: string = '';
  // setTempColor(color: string): void {
  //   this.tempColor = color;
  // }

  // getEventColorPrimary(event: CalendarEvent): string {
  //   return event?.color?.primary || '';
  // }

  // tempSecondaryColor: string = '';

  // updateEventColorSecondary(event: CalendarEvent): void {
  //   if (event && event.color) {
  //     event.color.secondary = this.tempSecondaryColor;
  //     this.refresh.next();
  //   }
  // }

  // tempSecondaryText: string = '';
  // updateEventColorSecondaryText(event: CalendarEvent): void {
  //   if (event && event.color) {
  //     event.color.secondaryText = this.tempSecondaryText;
  //     this.refresh.next();
  //   }
  // }

  // dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
  //   if (isSameMonth(date, this.viewDate)) {
  //     if (
  //       (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
  //       events.length === 0
  //     ) {
  //       this.activeDayIsOpen = false;
  //     } else {
  //       this.activeDayIsOpen = true;
  //     }
  //     this.viewDate = date;
  //   }
  // }

  // eventTimesChanged({
  //   event,
  //   newStart,
  //   newEnd,
  // }: CalendarEventTimesChangedEvent): void {
  //   if (this.isEventInNextWeek(newStart)) {
  //     this.worksRegister = this.worksRegister.map((iEvent) => {
  //       if (iEvent === event) {
  //         return {
  //           ...event,
  //           start: newStart,
  //           end: newEnd,
  //           actions: this.actions
  //         };
  //       }
  //       return iEvent;
  //     });
  //     this.refresh.next();
  //   } else {
  //     this.toastr.error('Bạn không thể thay đổi sự kiện trong tuần hiện tại hoặc quá khứ.');
  //   }
  // }

  // Phương thức xóa sự kiện
  deleteEvent(eventToDelete: CalendarEvent): void {
    this.worksRegister = this.worksRegister.filter(event => event !== eventToDelete);
    this.refresh.next();
  }

  formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return formattedDate;
  }

  openAddEventModal(content: TemplateRef<any>) {
    this.modal.open(content, { size: 'lg' });
  }

  newEventTitle: string = '';
  newEventStart: string = '';
  newEventEnd: string = '';

  // addEvent(): void {
  //   if (this.UserObj != null) {
  //     const newEvent: CalendarEvent = {
  //       title: this.UserObj.username,
  //       start: new Date(this.newEventStart),
  //       end: new Date(this.newEventEnd),
  //       color: this.setColorByRole(this.UserObj.role),
  //       actions: this.actions,
  //       draggable: true,
  //       resizable: {
  //         beforeStart: true,
  //         afterEnd: true,
  //       },
  //     };
  //     const startDate = this.newEventStart.split('T')[0];
  //     const startTime = this.newEventStart.split('T')[1];
  //     const endDate = this.newEventEnd.split('T')[0];
  //     const endTime = this.newEventEnd.split('T')[1];

  //     const startTimestamp = this.timeAndDateToTimestamp(startTime, startDate);
  //     const endTimestamp = this.timeAndDateToTimestamp(endTime, endDate);
  //     const RequestBody: RequestBodyTimekeeping = {
  //       epoch: this.currentDateTimeStamp,
  //       sub_id: this.UserObj.subId,
  //       staff_name: this.UserObj.username,
  //       staff_avt: "",
  //       role: this.UserObj.role,
  //       register_clock_in: startTimestamp,
  //       register_clock_out: endTimestamp,
  //       clock_in: (this.UserObj.clock_in !== undefined) ? this.UserObj.clock_in : 0,
  //       clock_out: (this.UserObj.clock_out !== undefined) ? this.UserObj.clock_out : 0,
  //       timekeeper_name: "",
  //       timekeeper_avt: "",
  //       status: 1
  //     };
  //     console.log("check UserOb", this.UserObj)
  //     console.log(RequestBody);
  //     //return;
  //     this.timekeepingService.postTimekeeping(RequestBody)
  //       .subscribe((res) => {
  //         this.toastr.success(res.message, "Thêm lịch làm việc mới thành công")
  //         this.worksRegister = [...this.worksRegister, newEvent];
  //         this.modal.dismissAll();
  //         this.refresh.next();
  //       },
  //         (err) => {
  //           this.toastr.error(err.error.message, "Đăng ký lịch làm việc thất bại");
  //         })
  //   }

  // }

  // isFutureWeek(viewDate: Date): boolean {
  //   const startOfNextWeek = addWeeks(startOfWeek(new Date()), 1);
  //   return isAfter(startOfDay(viewDate), startOfNextWeek);
  // }

  // isEventInCurrentOrPastWeek(eventStart: Date): boolean {
  //   const startOfCurrentWeek = startOfWeek(new Date());
  //   const endOfCurrentWeek = endOfWeek(new Date());
  //   return isWithinInterval(eventStart, {
  //     start: startOfCurrentWeek,
  //     end: endOfCurrentWeek,
  //   });
  // }

  // isEventInNextWeek(date: Date): boolean {
  //   const today = startOfDay(new Date());
  //   const startOfNextWeek = startOfWeek(addWeeks(today, 1));
  //   return isAfter(startOfDay(date), startOfNextWeek);
  // }


  formatToDateTimeString(datetimeLocal: string): string {
    return datetimeLocal.replace('T', ' ');
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }


  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp / 1000;
  }

  timestampToGMT7String(timestamp: number): string {
    // Chắc chắn rằng timestamp được chuyển từ giây sang milliseconds
    const timestampInMilliseconds = timestamp * 1000;

    // Tạo đối tượng moment với múi giờ GMT+7
    const dateTimeString = moment(timestampInMilliseconds).tz('Asia/Ho_Chi_Minh').format('HH:mm');

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
    return timestamp / 1000;
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

  day: string = 'dd';
  month: string = 'mm';
  year: string = 'yyyy';

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 2) {
      if (index < this.inputsMyDate.length - 1) {
        this.inputsMyDate[index + 1].focus();
        this.inputsMyDate[index + 1].value = '';
      }
    }
  }

  clearInput(input: HTMLInputElement) {
    input.value = '';
  }

  inputsMyDate: HTMLInputElement[] = [];

  ngAfterViewInit() {
    this.inputsMyDate = Array.from(
      document.querySelectorAll('.myDateChild')
    ) as HTMLInputElement[];
  }


  navigateHref(href: string) {
    this.router.navigate(['' + href]);
  }
}

interface User {
  role: string;
  subId: string;
  username: string;
  locale: string;
  clock_in: number;
  clock_out: number;
}
