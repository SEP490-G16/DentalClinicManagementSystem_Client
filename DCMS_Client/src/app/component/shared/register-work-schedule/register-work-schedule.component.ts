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


const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-register-work-schedule',
  templateUrl: './register-work-schedule.component.html',
  styleUrls: ['./register-work-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterWorkScheduleComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;

  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData!: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.worksRegister = this.worksRegister.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();
  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];
  worksRegister: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'Lễ tân chấm công',
      color: { ...colors['red'] },
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'Khám bệnh',
      color: { ...colors['yellow'] },
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'Khám bệnh',
      color: { ...colors['blue'] },
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'Khám bệnh 2',
      color: { ...colors['yellow'] },
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];

  activeDayIsOpen: boolean = true;

  tempColor: string = '';
  setTempColor(color: string): void {
    this.tempColor = color;
  }

  getEventColorPrimary(event: CalendarEvent): string {
    return event?.color?.primary || '';
  }

  tempSecondaryColor: string = '';

  updateEventColorSecondary(event: CalendarEvent): void {
    if (event && event.color) {
      event.color.secondary = this.tempSecondaryColor;
      this.refresh.next();
    }
  }

  tempSecondaryText: string = '';
  updateEventColorSecondaryText(event: CalendarEvent): void {
    if (event && event.color) {
      event.color.secondaryText = this.tempSecondaryText;
      this.refresh.next();
    }
  }

  isdayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.worksRegister = this.worksRegister.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  editTitle: string = ""
  editTimeStart: string = ""
  editTimeEnd: string = ""
  handleEvent(action: string, event: CalendarEvent): void {
    if (action === 'Edited') {
      this.modalData = { event, action };
      this.modal.open(this.modalContent, { size: 'lg' });

      this.editTitle = event.title;
      this.editTimeStart = this.formatDate(event.start);
      this.editTimeEnd = event.end ? this.formatDate(event.end) : "";
    } else {
      this.deleteEvent(event);
    }

  }
  formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return formattedDate;
  }


  editEvent() {
    let sub = sessionStorage.getItem("sub");
    let name = sessionStorage.getItem("name");

    if (sub !== null && name != null) {
      const editedEvent: CalendarEvent = {
        ...this.modalData.event,
        title: this.editTitle,
        start: new Date(this.editTimeStart),
        end: this.editTimeEnd ? new Date(this.editTimeEnd) : undefined,
      };

      const index = this.worksRegister.findIndex((event) => event === this.modalData.event);

      if (index !== -1) {
        this.worksRegister[index] = editedEvent;

        const editedStartTimestamp = this.dateToTimestamp(this.editTimeStart);
        const editedEndTimestamp = this.editTimeEnd ? this.dateToTimestamp(this.editTimeEnd) : undefined;

        this.Body = {
          sub_id: sub,
          staff_name: name,
          epoch: editedStartTimestamp as number,
          clock_in: editedStartTimestamp as number,
          clock_out: editedEndTimestamp as number,
          timekeeper_name: "",
          staff_avt: "",
          timekeeper_avt: "",
          role: '',
          status: 1
        };

        this.timekeepingService.postTimekeeping(this.Body as RequestBodyTimekeeping)
          .subscribe(
            (res) => {
              this.showSuccessToast("Lịch làm việc đã được cập nhật.");
              console.log("Body Sửa lịch làm việc", this.Body);
            },
            (err) => {
              this.showErrorToast(err.error);
            }
          );
      } else {
        this.showErrorToast("Không thể tìm thấy sự kiện để cập nhật.");
      }
    }

    // Close the modal after handling the edit
    this.modal.dismissAll();
  }

  title: string = "Nhiệm vụ mới";
  timeStart: string = "";
  timeEnd: string = "";
  addEvent(): void {
    let sub = sessionStorage.getItem("sub");
    let name = sessionStorage.getItem("name");

    if (sub !== null && name != null) {
      const newEvent: CalendarEvent = {
        title: this.title,
        start: new Date(this.timeStart),
        end: new Date(this.timeEnd),
        color: { ...colors['red'] },
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      };

      this.worksRegister = [...this.worksRegister, newEvent];

      const newStartTimestamp = this.dateToTimestamp(this.timeStart);
      const newEndTimestamp = this.dateToTimestamp(this.timeEnd);

      this.Body = {
        sub_id: sub,
        staff_name: name,
        epoch: newStartTimestamp,
        clock_in: newStartTimestamp,
        clock_out: newEndTimestamp,
        timekeeper_name: "",
        staff_avt: "",
        timekeeper_avt: "",
        role: '',
        status: 1
      };

      this.timekeepingService.postTimekeeping(this.Body)
        .subscribe(
          (res) => {
            this.showSuccessToast("Đăng ký lịch làm việc thành công");
            console.log("Body Đăng ký lịch làm việc", this.Body);
          },
          (err) => {
            this.showErrorToast(err.error);
          }
        );
    }
  }


  deleteEvent(event: CalendarEvent) {
    let sub = sessionStorage.getItem("sub");
    let name = sessionStorage.getItem("name");
    if (sub !== null && name != null) {

      const startTimeStamp = event.start.getTime();
      const endTimeStamp = event.end ? event.end.getTime() : null;

      this.timekeepingService.deleteTimekeeping(this.currentDateTimeStamp, this.currentDateTimeStamp)
        .subscribe(() => {
          this.showSuccessToast("Xóa lịch làm việc thành công");
          // Delete event in worksRegister
          this.worksRegister = this.worksRegister.filter((e) => e !== event);
        }, (err) => {
          this.showErrorToast(err.error);
        }
        )
    } else {
      this.showErrorToast("Vui lòng đăng nhập để thực hiện thao tác");
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }


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

  roleId: string[] = [];

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
    // let ro = sessionStorage.getItem('role');
    // if (ro != null) {
    //   this.roleId = ro.split(',');
    //   console.log(this.roleId);
    // }
    this.getStaffs();
    this.getRegisterWorkSchedule();
  }

  getStaffs() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.Staff = res.message.map((StaffMember: any) => {
          let newStaff: StaffRegisterWorkSchedule = {
            name: '',
            role: '',
            subId: '',
            staff_avt: '',
            locale: '',
            clock_in: 0,
            clock_out: 0,
            register_clock_in: "",
            register_clock_out: "",
            registerSchedules: {}
          };

          let isNotAdmin = true;
          StaffMember.Attributes.forEach((attribute: any) => {
            switch (attribute.Name) {
              case 'sub':
                newStaff.subId = attribute.Value;
                break;
              case 'locale':
                newStaff.locale = attribute.Value;
                break;
              case 'name':
                newStaff.name = attribute.Value;
                break;
              case 'custom:role':
                newStaff.role = attribute.Value;
                if (attribute.Value === '1') {
                  isNotAdmin = false;
                }
                break;
            }
          });

          return isNotAdmin ? newStaff : null;
        }).filter((staff: any) => staff !== null);
        console.log(this.Staff);
      },
      )
  }

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

        console.log(recordsMap);

        console.log("Staff có undefined hay ko?: ", this.Staff);
        this.Staff.forEach(staff => {
          staff.registerSchedules = {};

          this.weekTimestamps.forEach(weekTimestamp => {
            staff.registerSchedules[weekTimestamp] = { startTime: '', endTime: '' };

            let Staff_RegisterWorkRecords = recordsMap.get(staff.subId);
            if (Staff_RegisterWorkRecords) {
              Staff_RegisterWorkRecords.forEach((record: any) => {
                if (record.epoch === weekTimestamp.toString()) {
                  staff.clock_in = (record.clock_in !== undefined) ? record.clock_in : 0;
                  staff.clock_out = (record.clock_out !== undefined) ? record.clock_out : 0;
                  staff.registerSchedules[weekTimestamp].startTime =
                    (record.register_clock_in !== undefined && record.register_clock_in !== '0')
                      ? this.timestampToGMT7String(record.register_clock_in)
                      : '';
                  staff.registerSchedules[weekTimestamp].endTime =
                    (record.register_clock_out !== undefined && record.register_clock_out !== '0')
                      ? this.timestampToGMT7String(record.register_clock_out)
                      : '';
                }
              });
            }
          });
        });
        console.log("Staff Work Register: ", this.Staff);
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl + "/timekeeping/" + this.startTime + "/" + this.endTime, error);
        }
      )
  }


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
  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate(['nhanvien' + href]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate(['nhanvien' + href]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate(['nhanvien' + href]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate(['admin' + href]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }
}

