import { TimestampFormat } from './../../utils/libs/timestampFormat';
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { ReceptionistTimekeepingService } from "src/app/service/ReceptionistService/receptionist-timekeeping.service";
import { CognitoService } from "src/app/service/cognito.service";
import * as moment from 'moment';
import 'moment/locale/vi';
import { RegisterWorkSchedule, RequestBodyTimekeeping, StaffRegisterWorkSchedule } from "src/app/model/ITimekeeping";
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
@Component({
  selector: 'app-register-work-schedule',
  templateUrl: './register-work-schedule.component.html',
  styleUrls: ['./register-work-schedule.component.css'],
})
export class RegisterWorkScheduleComponent implements OnInit {
  UserObj: any;
  roleId: any;

  workSchedule = [
    {
      shiftName: 'Ca 1',
      days: [
        { employees: [{ image: 'path/to/image.jpg', name: 'Nguyễn Văn A', position: 'Nhân viên' }] },
      ]
    },
    {
      shiftName: 'Ca 2',
      days: [
        { employees: [{ image: 'path/to/image.jpg', name: 'Trần Thị B', position: 'Quản lý' }] },
      ]
    },
  ];

  viewDate:any;

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
    this.currentDateTimeStamp = TimestampFormat.dateToTimestamp(this.currentDateGMT7);
    console.log("Current Date Timestamp: ", this.currentDateTimeStamp);
    this.currentTimeTimeStamp = TimestampFormat.timeAndDateToTimestamp(this.currentTimeGMT7, this.currentDateGMT7);
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
      console.log("Oki or Ok?: ", (storedUserObject !== null || undefined) ? "Oki" : "Ok");
      this.UserObj = storedUserObject;
      console.log(this.UserObj);
    } else {
      console.error('Stored user JSON string is null.');
      this.UserObj = null;
    }

    this.getStaffs();

  }

  deleteSchedule(): void {

  }

  newEventStart:string = "";
  newEventEnd:string = "";
  addEvent(): void {
    if (this.UserObj != null) {
      const startDate = this.newEventStart.split('T')[0];
      const startTime = this.newEventStart.split('T')[1];
      const endDate = this.newEventEnd.split('T')[0];
      const endTime = this.newEventEnd.split('T')[1];

      const startTimestamp = TimestampFormat.timeAndDateToTimestamp(startTime, startDate);
      const endTimestamp = TimestampFormat.timeAndDateToTimestamp(endTime, endDate);
      const RequestBody: RequestBodyTimekeeping = {
        epoch: this.currentDateTimeStamp,
        sub_id: this.UserObj.subId,
        staff_name: this.UserObj.username,
        staff_avt: "",
        role: this.UserObj.role,
        register_clock_in: startTimestamp,
        register_clock_out: endTimestamp,
        clock_in: (this.UserObj.clock_in !== undefined) ? this.UserObj.clock_in : 0,
        clock_out: (this.UserObj.clock_out !== undefined) ? this.UserObj.clock_out : 0,
        timekeeper_name: "",
        timekeeper_avt: "",
        status: 1
      };
      console.log("check UserOb", this.UserObj)
      console.log(RequestBody);
      //return;
      this.timekeepingService.postTimekeeping(RequestBody)
        .subscribe((res) => {
          this.toastr.success(res.message, "Thêm lịch làm việc mới thành công")
        },
          (err) => {
            this.toastr.error(err.error.message, "Đăng ký lịch làm việc thất bại");
          })
    }
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
            epoch: 0,
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
        this.getRegisterWorkSchedule();
      },
      )
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






}


interface User {
  role: string;
  subId: string;
  username: string;
  locale: string;
  clock_in: number;
  clock_out: number;
}
