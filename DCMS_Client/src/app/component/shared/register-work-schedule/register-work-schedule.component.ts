import * as moment from 'moment';
import { TimestampFormat } from './../../utils/libs/timestampFormat';
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { ReceptionistTimekeepingService } from "src/app/service/ReceptionistService/receptionist-timekeeping.service";
import { CognitoService } from "src/app/service/cognito.service";
import 'moment/locale/vi';
import { RegisterWorkSchedule, RequestBodyTimekeeping, StaffRegisterWorkSchedule } from "src/app/model/ITimekeeping";
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { CalendarEvent } from 'angular-calendar';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-register-work-schedule',
  templateUrl: './register-work-schedule.component.html',
  styleUrls: ['./register-work-schedule.component.css'],
})
export class RegisterWorkScheduleComponent implements OnInit {
  Body: RequestBodyTimekeeping = {} as RequestBodyTimekeeping;
  UserObj: User | null = {} as User | null;
  Staff: StaffRegisterWorkSchedule[] = [];
  roleId: any;

  viewDate: any;

  //Current
  currentDateTimeStamp: number = 0;
  currentTimeTimeStamp: number = 0;
  currentDateGMT7: string = "";
  currentTimeGMT7: string = "";

  //Interval
  startOfWeek!: Date;
  endOfWeek!: Date;

  startTime: number = 0;
  endTime: number = 0;

  //
  worksRegister: CalendarEvent[] = [];
  registerOnWeeks: any
  weekTimestamps: number[] = [];


  constructor(private modal: NgbModal,
    private cognitoService: CognitoService,
    private timekeepingService: ReceptionistTimekeepingService,
    private toastr: ToastrService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  initializeComponent() {
    moment.locale('vi');
    moment.tz.setDefault('Asia/Ho_Chi_Minh');
    this.viewDate = moment().startOf('week').toDate();

    //Get Date
    this.currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
    //Set epoch to body
    this.currentDateTimeStamp = TimestampFormat.dateToTimestamp(this.currentDateGMT7);
    console.log("Current Date Timestamp: ", this.currentDateTimeStamp);
    this.currentTimeTimeStamp = TimestampFormat.timeAndDateToTimestamp(this.currentTimeGMT7, this.currentDateGMT7);
    console.log("CurrentTimes: ", this.currentTimeTimeStamp);
    for (let i = 0; i < 7; i++) {
      this.weekTimestamps.push(moment.tz('Asia/Ho_Chi_Minh').startOf('week').add(i, 'days').unix());
    }
    console.log("WeekTimes: ", this.weekTimestamps);
    this.startTime = this.weekTimestamps[0];
    this.endTime = this.weekTimestamps[6];

    this.startOfWeek = moment(this.viewDate).startOf('isoWeek').toDate();
    this.endOfWeek = moment(this.viewDate).endOf('isoWeek').toDate();

    const startDateFormatted = moment.unix(this.weekTimestamps[0]).format('DD/MM/YYYY');
    const endDateFormatted = moment.unix(this.weekTimestamps[6]).format('DD/MM/YYYY');
    this.viewDate = `Tuần từ ${startDateFormatted} đến ${endDateFormatted}`;

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
    //this.DisplayResgisterTimeByWeek();
    this.getDateinFromDatetoToDate(TimestampFormat.timestampToGMT7Date(this.startTime), TimestampFormat.timestampToGMT7Date(this.endTime));

    //K dùng BehaviorSubject nữa

    // this.timekeepingService.listDisplay$.subscribe(
    //   data => {
    //     this.listDisplayClone = data;
    //   }
    // );
  }

  listDisplayClone: any[] = [];

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

    this.timekeepingService.getTimekeeping(this.startTime, this.endTime)
      .subscribe(data => {
        this.registerOnWeeks = this.organizeData(data);
        console.log("Register On weeks: ", this.registerOnWeeks);
        this.getListEmployee();
      }
      )
  }

  uniqueList: string[] = [];
  getListEmployee() {
    this.listDay.forEach((item: any) => {
      this.registerOnWeeks.forEach((it: any) => {
        let da = TimestampFormat.timestampToGMT7Date(it.epoch);
        const ab = da.split('-');
        const check = ab[2] + "/" + ab[1] + "/" + ab[0];
        if (item == check) {

          it.records.forEach((i: any) => {
            this.listDayInMonth.forEach((o: any) => {
              if (i.subId == this.UserObj?.subId) {
                if (o.currentD == check) {
                  o.register_clock_in = i.register_clock_in;
                  o.register_clock_out = i.register_clock_out;
                  o.clock_in = i.clock_in;
                  o.clock_out = i.clock_out;
                  o.timekeeper_name = i.timekeeper_name;
                  o.timekeeper_avt = i.timekeeper_avt;
                  o.status = 1;
                  o.isSang = i.register_clock_in == "1" ? true : false;
                  o.isChieu = i.register_clock_out == "2" ? true : false;
                }
              }
            })

            if (!this.uniqueList.includes(i.currentD)) {
              this.uniqueList.push(item);
              let registerObject = {
                currentD: item,
                staffId: i.subId,
                staffName: i.staff_name + " ",
                register_clock_in: i.register_clock_in,
                register_clock_out: i.register_clock_out,
                clock_in: i.clock_in,
                clock_out: i.clock_out,
                timekeeper_name: i.timekeeper_name,
                timekeeper_avt: i.timekeeper_avt,
                status: 1,
                isSang: i.register_clock_in == "1" ? true : false,
                isChieu: i.register_clock_out == "2" ? true : false
              }
              this.listDisplayClone.push(registerObject);
            } else {
              this.listDisplayClone.forEach((e: any) => {
                if (e.currentD == item) {
                  if (i.staff_name != null && i.staff_name != undefined) {
                    e.staffName += i.staff_name + " ";
                  }
                }
              })
            }
          })
        } else {
          let registerObject = {
            currentD: item,
            staffId: "",
            staffName: "",
            register_clock_in: "",
            register_clock_out: "",
            clock_in: "",
            clock_out: "",
            timekeeper_name: "",
            timekeeper_avt: "",
            status: 1,
            isSang: false,
            isChieu: false
          }
          this.listDisplayClone.push(registerObject);
        }
      })
    })

    console.log("check list display", this, this.listDisplayClone)
    console.log("check list day in month", this.listDayInMonth)
  }


  checkRegis: boolean = false;
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

    var count = 0;
    this.listDayInMonth.forEach((item: any) => {
      const ab = item.currentD.split('/');
      const check = ab[2] + "-" + ab[1] + "-" + ab[0];
      let RequestBody = {
        epoch: TimestampFormat.dateToTimestamp(check),
        sub_id: this.UserObj?.subId,
        staff_name: this.UserObj?.username,
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
      console.log(item);
      if (item.isSang == true && item.isChieu == true) {
        RequestBody.register_clock_in = 1;
        RequestBody.register_clock_out = 2;
      }
      if (item.isSang == true && item.isChieu == false) {
        RequestBody.register_clock_in = 1;
        RequestBody.register_clock_out = 0;
      }
      if (item.isSang == false && item.isChieu == true) {
        RequestBody.register_clock_in = 0;
        RequestBody.register_clock_out = 2;
      }
      if (item.isSang == false && item.isChieu == false) {
        RequestBody.register_clock_in = 0;
        RequestBody.register_clock_out = 0;
      }
      this.timekeepingService.postTimekeeping(RequestBody)
      .subscribe((res) => {
        count++;
        if (count == 7) {
          this.toastr.success(res.message, "Thêm lịch làm việc mới thành công")
        }
          const index = this.listDisplayClone.findIndex(entry => entry.currentD === this.timestampToDateStr(RequestBody.epoch) && entry.staffId === RequestBody.sub_id);

          if (index !== -1) {
            this.listDisplayClone[index].staffName = RequestBody.staff_name;
            this.listDisplayClone[index].isSang = RequestBody.register_clock_in === 1;
            this.listDisplayClone[index].isChieu = RequestBody.register_clock_out === 2;
          } else {
            this.listDisplayClone.push({
              currentD: RequestBody.epoch,
              staffName: RequestBody.staff_name,
              isSang: RequestBody.register_clock_in === 1,
              isChieu: RequestBody.register_clock_out === 2,
            });
          }
          this.cd.detectChanges();
        },
        (err) => {
          this.toastr.error(err.error.message, "Đăng ký lịch làm việc thất bại");
        }
        )
        console.log("ListDay: ", this.listDay);
        console.log("ListDisplayClone: ", this.listDisplayClone);
        console.log("Body: ", RequestBody);
      })
    }
    //Option Map
    getRegisterWorkSchedule() {
      console.log("Thứ 2: ", TimestampFormat.timestampToGMT7Date(this.startTime));
      console.log("Chủ nhật: ", TimestampFormat.timestampToGMT7Date(this.endTime));
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

  day: string = 'dd';
  month: string = 'mm';
  year: string = 'yyyy';

  formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return formattedDate;
  }

  timestampToDateStr(epoch: number) {
    return new Date(epoch * 1000).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  inputsMyDate: HTMLInputElement[] = [];
  ngAfterViewInit() {
    this.inputsMyDate = Array.from(
      document.querySelectorAll('.myDateChild')
      ) as HTMLInputElement[];
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
