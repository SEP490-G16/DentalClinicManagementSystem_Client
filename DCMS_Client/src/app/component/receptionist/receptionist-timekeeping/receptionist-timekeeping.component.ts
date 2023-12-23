import { ReceptionistTimekeepingService } from './../../../service/ReceptionistService/receptionist-timekeeping.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import 'moment/locale/vi';
import { ToastrService } from 'ngx-toastr';
import { RequestBodyTimekeeping, StaffTimekeeping, TimekeepingDetail, TimekeepingRecord } from 'src/app/model/ITimekeeping';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { CognitoService } from 'src/app/service/cognito.service';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../utils/pop-up/common/confirm-modal/confirm-modal.component';
import { FormatNgbDate } from '../../utils/libs/formatNgbDate';
import { TimestampFormat } from '../../utils/libs/timestampFormat';
@Component({
  selector: 'app-receptionist-timekeeping',
  templateUrl: './receptionist-timekeeping.component.html',
  styleUrls: ['./receptionist-timekeeping.component.css']
})

export class ReceptionistTimekeepingComponent implements OnInit {
  time = { hour: 13, minute: 30 };
  Body: RequestBodyTimekeeping = {} as RequestBodyTimekeeping;
  Staff!: StaffTimekeeping[];
  StaffFilter: any;
  selectedFilter: string = "";
  //Current
  currentDateTimeStamp: number = 0;
  currentTimeTimeStamp: number = 0;
  currentDateGMT7: string = "";
  currentTimeGMT7: string = "";

  //Week
  weekTimestamps: number[] = [];
  startTime: number = 0;
  endTime: number = 0;

  //Role
  roleId: any;

  //NgbDate
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  hoveredDate: NgbDate | null = null;

  timekeepingOnWeeks: any
  timeClockinColor: string = "onTime";
  timeClockoutColor: string = "lateTime";
  constructor(private cognitoService: CognitoService,
    private timekeepingService: ReceptionistTimekeepingService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private router: Router) {

    moment.locale('vi');

    //Get Date
    this.currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');

    //Set epoch to body
    this.currentDateTimeStamp = this.dateToTimestamp(this.currentDateGMT7);
    this.currentTimeTimeStamp = this.timeAndDateToTimestamp(this.currentTimeGMT7, this.currentDateGMT7);

    //Set week
    for (let i = 0; i < 7; i++) {
      this.weekTimestamps.push(moment.tz('Asia/Ho_Chi_Minh').startOf('week').add(i, 'days').unix());
    }
    this.startTime = this.weekTimestamps[0];
    this.endTime = this.weekTimestamps[6];

    //Set interval time
    this.fromDate = FormatNgbDate.timestampToNgbDate(this.weekTimestamps[0]) as NgbDate;
    this.toDate = FormatNgbDate.timestampToNgbDate(this.weekTimestamps[6]) as NgbDate;
  }

  ngOnInit(): void {
    const role = sessionStorage.getItem("role");
    if (role) {
      this.roleId = role;
    }
    this.getStaffs();
  }


  getStaffs() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.Staff = res.message.map((StaffMember: any) => {
          let newStaff: StaffTimekeeping = {
            name: '',
            role: '',
            sub: '',
            staff_avt: '',
            locale: '',
            register_clock_in: 0,
            register_clock_out: 0,
            weekTimekeeping: {}
          };
          let isNotAdmin = true;
          StaffMember.Attributes.forEach((attribute: any) => {
            switch (attribute.Name) {
              case 'sub':
                newStaff.sub = attribute.Value;
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
        this.StaffFilter = this.Staff;
        this.getTimekeeping();
      },
      )
  }

  getTimekeeping() {
    console.log("Thứ 2: ", this.timestampToGMT7Date(this.startTime));
    console.log("Chủ nhật: ", this.timestampToGMT7Date(this.endTime));
    this.timekeepingService.getTimekeepingNew(this.startTime, this.endTime)
      .subscribe(data => {
        this.timekeepingOnWeeks = data;
        console.log("Api: ", data);
        this.Staff.forEach(staff => {
          staff.weekTimekeeping = {};
          this.weekTimestamps.forEach(weekTimestamp => {
            staff.weekTimekeeping[weekTimestamp] = { clockIn: '', clockOut: '' };
            this.timekeepingOnWeeks.forEach((record: any) => {
              if (record.SK.S.split('::')[0] == weekTimestamp.toString()) {
                if (record.SK.S.split('::')[1] == staff.sub) {
                  staff.register_clock_in = (record.timekeeping_attr.M.register_clock_in.N !== undefined && record.timekeeping_attr.M.register_clock_in.N !== "0") ? record.timekeeping_attr.M.register_clock_in.N : 0;
                  staff.register_clock_out = (record.timekeeping_attr.M.register_clock_out.N !== undefined && record.timekeeping_attr.M.register_clock_out.N !== "0") ? record.timekeeping_attr.M.register_clock_out.N : 0;
                  staff.weekTimekeeping[weekTimestamp].clockIn =
                    (record.timekeeping_attr.M.clock_in.N !== undefined && record.timekeeping_attr.M.clock_in.N !== "0")
                      ? this.timestampToGMT7String(record.timekeeping_attr.M.clock_in.N)
                      : '';

                  staff.weekTimekeeping[weekTimestamp].clockOut =
                    (record.timekeeping_attr.M.clock_out.N !== undefined && record.timekeeping_attr.M.clock_out.N !== "0")
                      ? this.timestampToGMT7String(record.timekeeping_attr.M.clock_out.N)
                      : '';
                }
              }
            });
          });
        });
        console.log("Staff match: ", this.Staff);
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl + "/timekeeping/" + this.startTime + "/" + this.endTime, error);
        }
      )
  }

  //Tổ chức mảng:
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
            clock_in: item[key]?.M?.clock_in?.N,
            clock_out: item[key]?.M?.clock_out?.N,
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

  filterStaff() {
    console.log("Role: ", this.selectedFilter);
    if (this.selectedFilter === "") {
      this.StaffFilter = this.Staff;
    } else {
      this.StaffFilter = this.Staff.filter((s: StaffTimekeeping) => s.role === this.selectedFilter);
    }
  }

  onClockin(staff: StaffTimekeeping, dateTimestamp:number) {
    // staff.isClockin = true;
    this.Body = this.setClockinBody(staff, dateTimestamp);
    this.callClockinApi(staff, dateTimestamp);
  }

  openConfirmationModal(message: string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmButtonText = 'Thay đổi';
    modalRef.componentInstance.cancelButtonText = 'Hủy';

    return modalRef.result;
  }

  handleClockInChange(staff: StaffTimekeeping, event: Event, dateTimestamp:number) {
    console.log("Staff nhan vao: ", staff);
    const target = event.target as HTMLInputElement | null;
    if (target) {
      const newClockInValue = target.value;
      const originalClockIn = staff.weekTimekeeping[dateTimestamp].clockIn;

      //Để có thể pbiet giữa thời gian trong 1 ngày thì phải convert sang Date cùng 1 ngày đó
      const clockInDateTime = new Date(`1970-01-01T${newClockInValue}:00Z`);
      const clockOutDateTime = staff.weekTimekeeping[dateTimestamp].clockOut ? new Date(`1970-01-01T${staff.weekTimekeeping[dateTimestamp].clockOut}:00Z`) : null;

      this.openConfirmationModal("Bạn có chắc chắn muốn thay đổi thời gian chấm công đến không?")
        .then((result) => {
          if (result === 'confirm') {
            if (clockOutDateTime && clockInDateTime >= clockOutDateTime) {

              //Update UI Staff Clockin
              console.log("StaffFilter: ", this.StaffFilter);
              this.StaffFilter.forEach((staffFilter:any) => {
                  if(staffFilter.sub == staff.sub) {
                    staffFilter.weekTimekeeping[dateTimestamp].clockIn = originalClockIn
                  }
              });
              this.cd.detectChanges();
              this.toastr.error("Thời gian chấm công đến phải nhỏ hơn thời gian chấm công về.");
            } else {
              staff.weekTimekeeping[dateTimestamp].clockIn = newClockInValue;
              this.Body = this.setClockinBody(staff, dateTimestamp);
              this.callClockinApi(staff, dateTimestamp);
            }
          } else {
            staff.weekTimekeeping[dateTimestamp].clockIn = originalClockIn;
          }
        });
    }
  }



  callClockinApi(staff: StaffTimekeeping, dateTimestamp:number) {
    this.timekeepingService.postTimekeepingNew(this.Body)
      .subscribe((res) => {
        this.toastr.success(res.message, "Chấm công đến thành công");
        //Update UI
        if (staff.weekTimekeeping[dateTimestamp].clockIn == "") {
          staff.weekTimekeeping[dateTimestamp].clockIn = this.currentTimeGMT7;
        }
      },
        (error) => {
          this.toastr.error("Không thể chấm công đến");
        });
  }

  onClockout(staff: StaffTimekeeping, event: Event, dateTimestamp:number) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      const newClockoutValue = target.value;
      const originalClockOut = staff.weekTimekeeping[dateTimestamp].clockOut;

      const clockInDateTime = staff.weekTimekeeping[dateTimestamp].clockIn ? new Date(`1970-01-01T${staff.weekTimekeeping[dateTimestamp].clockIn}:00Z`) : null;
      const newClockOutDateTime = new Date(`1970-01-01T${newClockoutValue}:00Z`);
      if (clockInDateTime && newClockOutDateTime <= clockInDateTime) {
        this.toastr.error("Thời gian chấm công về phải lớn hơn thời gian chấm công đến.");
        staff.weekTimekeeping[dateTimestamp].clockOut = originalClockOut;
      } else {
        this.Body = this.setClockoutBody(staff, dateTimestamp);
        this.callClockoutApi(staff, dateTimestamp);
      }
    }
  }

  handleClockOutChange(staff: StaffTimekeeping, event: Event, dateTimestamp:number) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      const newClockoutValue = target.value;
      const originalClockOut = staff.weekTimekeeping[dateTimestamp].clockOut;

      const clockInDateTime = staff.weekTimekeeping[dateTimestamp].clockIn ? new Date(`1970-01-01T${staff.weekTimekeeping[dateTimestamp].clockIn}:00Z`) : null;
      const newClockOutDateTime = new Date(`1970-01-01T${newClockoutValue}:00Z`);

      this.openConfirmationModal("Bạn có chắc chắn muốn thay đổi thời gian chấm công về không?").then((result) => {
        if (result === 'confirm') {
          if (clockInDateTime && newClockOutDateTime <= clockInDateTime) {
            this.toastr.error("Thời gian chấm công về phải lớn hơn thời gian chấm công đến.");
            staff.weekTimekeeping[dateTimestamp].clockOut = originalClockOut;
          } else {
            staff.weekTimekeeping[dateTimestamp].clockOut = newClockoutValue;
            this.Body = this.setClockoutBody(staff, dateTimestamp);
            this.callClockoutApi(staff, dateTimestamp);
          }
        } else {
          staff.weekTimekeeping[dateTimestamp].clockOut = originalClockOut;
        }
      });
    }
  }

  callClockoutApi(staff: StaffTimekeeping, dateTimestamp:number) {
    this.timekeepingService.postTimekeepingNew(this.Body)
      .subscribe((res) => {
        this.toastr.success(res.message, "Chấm công về thành công");
        console.log(this.Body);
        if (staff.weekTimekeeping[dateTimestamp].clockOut == "") {
          staff.weekTimekeeping[dateTimestamp].clockOut = this.currentTimeGMT7;
        }
      },
        (error) => {
          this.toastr.error("Không thể chấm công về");
        });
  }

  setClockinBody(Staff: StaffTimekeeping, dateTimestamp:number): RequestBodyTimekeeping {
    const username = sessionStorage.getItem("username");
    return {
      epoch: this.currentDateTimeStamp,
      sub_id: Staff.sub,
      staff_role: Staff.role,
      register_clock_in: Staff.register_clock_in,
      register_clock_out: Staff.register_clock_out,
      staff_name: Staff.name,
      staff_avt: Staff.staff_avt,
      clock_in: (Staff.weekTimekeeping[dateTimestamp].clockIn == "") ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(Staff.weekTimekeeping[dateTimestamp].clockIn, this.currentDateGMT7),
      clock_out: (Staff.weekTimekeeping[dateTimestamp].clockOut == "") ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(Staff.weekTimekeeping[dateTimestamp].clockOut, this.currentDateGMT7),
      status_attr: 2
    }
  }

  setClockoutBody(Staff: StaffTimekeeping, dateTimestamp:number): RequestBodyTimekeeping {
    const username = sessionStorage.getItem("username");
    return {
      epoch: this.currentDateTimeStamp,
      sub_id: Staff.sub,
      staff_role: Staff.role,
      register_clock_in: Staff.register_clock_in,
      register_clock_out: Staff.register_clock_out,
      staff_name: Staff.name,
      staff_avt: Staff.staff_avt,
      clock_in: this.timeAndDateToTimestamp(Staff.weekTimekeeping[dateTimestamp].clockIn, this.currentDateGMT7),
      clock_out: (Staff.weekTimekeeping[dateTimestamp].clockOut == "") ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(Staff.weekTimekeeping[dateTimestamp].clockOut, this.currentDateGMT7),
      //timekeeper_name: username ?? "",
      //timekeeper_avt: "",
      status_attr: 2
    }
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    // this.updateStartAndEndDates();
  }

  updateStartAndEndDates() {
    if (this.fromDate) {
      // Chuyển đổi ngày từ NgbDate sang chuỗi định dạng YYYY-MM-DD
      var startDate = `${this.fromDate.year}-${this.pad(this.fromDate.month)}-${this.pad(this.fromDate.day)}`;
      this.startTime = TimestampFormat.dateToTimestamp(startDate);
      if (this.toDate) {
        // Chuyển đổi ngày từ NgbDate sang chuỗi định dạng YYYY-MM-DD
        var endDate = `${this.toDate.year}-${this.pad(this.toDate.month)}-${this.pad(this.toDate.day)}`;
        this.endTime = TimestampFormat.dateToTimestamp(endDate);
        this.getStaffs();
      }
    }
  }

  pad(number: number) {
    return (number < 10) ? `0${number}` : number;
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
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

  navigateHref(href: string) {
    //const userGroupsString = sessionStorage.getItem('userGroups');

    // if (userGroupsString) {
    this.router.navigate(['' + href]);
    //   const userGroups = JSON.parse(userGroupsString) as string[];

    //   if (userGroups.includes('dev-dcms-doctor')) {
    //     this.router.navigate(['nhanvien' + href]);
    //   } else if (userGroups.includes('dev-dcms-nurse')) {
    //     this.router.navigate(['nhanvien' + href]);
    //   } else if (userGroups.includes('dev-dcms-receptionist')) {
    //     this.router.navigate(['nhanvien' + href]);
    //   } else if (userGroups.includes('dev-dcms-admin')) {
    //     this.router.navigate(['admin' + href]);
    //   }
    // } else {
    //   console.error('Không có thông tin về nhóm người dùng.');
    //   this.router.navigate(['/default-route']);
    // }
  }
}
