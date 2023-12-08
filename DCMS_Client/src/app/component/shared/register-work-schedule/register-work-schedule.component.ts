import * as moment from 'moment';
import 'moment/locale/vi';
import { TimestampFormat } from './../../utils/libs/timestampFormat';
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { ReceptionistTimekeepingService } from "src/app/service/ReceptionistService/receptionist-timekeeping.service";
import { CognitoService } from "src/app/service/cognito.service";
import { RegisterWorkSchedule, RequestBodyTimekeeping, StaffRegisterWorkSchedule } from "src/app/model/ITimekeeping";
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { TimeFormatPipe } from '../../utils/libs/shift.pipe'; // Adjust the path as necessary
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-register-work-schedule',
  templateUrl: './register-work-schedule.component.html',
  styleUrls: ['./register-work-schedule.component.css'],
})
export class RegisterWorkScheduleComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  Staffs: StaffRegisterWorkSchedule[] = [];
  registerWorkSchedule: any[] = [];
  weekTimestamps: number[] = [];
  UserObj: User | null = {} as User | null;
  Body: RequestBodyTimekeeping = {} as RequestBodyTimekeeping;

  morningShifts: ShiftTimes[] = [];
  afternoonShifts: ShiftTimes[] = [];

  viewDate: any;
  registerOnWeeks: any

  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  roleId: any;

  // Define your shift times here
  morningShiftStart!: moment.Moment;
  afternoonShiftStart!: moment.Moment;
  afternoonShiftEnd!: moment.Moment;

  constructor(private modal: NgbModal,
    private cognitoService: CognitoService,
    private timekeepingService: ReceptionistTimekeepingService,
    private toastr: ToastrService,
    private router: Router
  ) {
    moment.locale('vi');
    moment.tz.setDefault('Asia/Ho_Chi_Minh');

    // Xác định ngày bắt đầu của tuần hiện tại
    const currentWeekStart = moment.tz('Asia/Ho_Chi_Minh').startOf('week');

    // Xác định ngày bắt đầu của tuần kế tiếp
    const nextWeekStart = currentWeekStart.clone().add(1, 'weeks');

    // Lấy timestamp cho ngày bắt đầu và kết thúc của tuần kế tiếp
    for (let i = 0; i < 7; i++) {
      this.weekTimestamps.push(nextWeekStart.clone().add(i, 'days').unix());
    }

    // Lấy timestamp cho ngày bắt đầu và kết thúc của tuần kế tiếp
    this.startDateTimestamp = this.weekTimestamps[0];
    this.endDateTimestamp = this.weekTimestamps[6];

    const startDateFormatted = moment.unix(this.startDateTimestamp).format('DD/MM/YYYY');
    const endDateFormatted = moment.unix(this.endDateTimestamp).format('DD/MM/YYYY');
    this.viewDate = `Tuần từ ${startDateFormatted} đến ${endDateFormatted}`;

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
    this.getStaffs();

  }

  getStaffs() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        console.log(res.message);
        this.Staffs = res.message.map((StaffMember: any) => {
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
              case 'custom:locale':
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
              case 'custom:image':
                newStaff.staff_avt = attribute.Value
            }
          });

          return isNotAdmin ? newStaff : null;
        }).filter((staff: any) => staff !== null);
        console.log(this.Staffs);
        this.getRegisterWorkSchedule();
      },
      )
  }

  //Option Map
  getRegisterWorkSchedule() {
    console.log("Thứ 2: ", TimestampFormat.timestampToGMT7Date(this.startDateTimestamp));
    console.log("Chủ nhật: ", TimestampFormat.timestampToGMT7Date(this.endDateTimestamp));
    this.timekeepingService.getTimekeeping(this.startDateTimestamp, this.endDateTimestamp)
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

        console.log("Staff có undefined hay ko?: ", this.Staffs);
        this.Staffs.forEach(staff => {
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
        console.log("Staff Work Register: ", this.Staffs);
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl + "/timekeeping/" + this.startDateTimestamp + "/" + this.endDateTimestamp, error);
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

  isMorningShift(startTime: string): boolean {
    const shiftStart = moment('07:30', 'HH:mm');
    const time = moment(startTime, 'HH:mm');
    return time.isSame(shiftStart);
  }

  isAfternoonShift(startTime: string): boolean {
    const shiftStart = moment('12:50', 'HH:mm');
    const time = moment(startTime, 'HH:mm');
    return time.isSame(shiftStart);
  }

  newEventStart: string = "";
  newEventEnd: string = "";
  addEvent(): void {
    if (this.UserObj != null) {
      const startDate = this.newEventStart.split('T')[0];
      const startTime = this.newEventStart.split('T')[1];
      const endDate = this.newEventEnd.split('T')[0];
      const endTime = this.newEventEnd.split('T')[1];

      const startTimestamp = TimestampFormat.timeAndDateToTimestamp(startTime, startDate);
      const endTimestamp = TimestampFormat.timeAndDateToTimestamp(endTime, endDate);
      const RequestBody: RequestBodyTimekeeping = {
        epoch: 0,
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

  openEditSchedule() {
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  editEvent(): void {

    if (this.UserObj != null) {
      const RequestBody: RequestBodyTimekeeping = {
        epoch: 0,
        sub_id: this.UserObj.subId,
        staff_name: this.UserObj.username,
        staff_avt: "",
        role: this.UserObj.role,
        register_clock_in: 0,
        register_clock_out: 0,
        clock_in: (this.UserObj.clock_in !== undefined) ? this.UserObj.clock_in : 0,
        clock_out: (this.UserObj.clock_out !== undefined) ? this.UserObj.clock_out : 0,
        timekeeper_name: "",
        timekeeper_avt: "",
        status: 1
      };
      console.log("Edit: ", RequestBody);
      this.timekeepingService.postTimekeeping(RequestBody)
        .subscribe((res) => {
          this.modal.dismissAll();

        },
          (err) => {
            this.toastr.error(err.error.message, "Sửa lịch làm việc thất bại");
          })
    }

    this.modal.dismissAll();
  }

  handleDeleteClick(): void {
    const modalRef = this.modal.open(ConfirmDeleteModalComponent);
    modalRef.result.then(
      (result) => {
        if (result === 'delete') {

        }
      },
      (reason) => {

      }
    );
  }

  // Phương thức xóa sự kiện
  deleteSchedule(): void {
    // this.worksRegister = this.worksRegister.filter(event => event !== eventToDelete);
    // this.refresh.next();
  }

  cancelEdit(): void {
    this.modal.dismissAll();
  }

  static timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf();
    return timestamp / 1000;
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

interface ShiftTimes {
  start: number;
  end: number;
}
