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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../utils/pop-up/common/confirm-modal/confirm-modal.component';
@Component({
  selector: 'app-receptionist-timekeeping',
  templateUrl: './receptionist-timekeeping.component.html',
  styleUrls: ['./receptionist-timekeeping.component.css']
})

export class ReceptionistTimekeepingComponent implements OnInit {
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

  timekeepingOnWeeks: any
  timeClockinColor: string = "onTime";
  timeClockoutColor: string = "lateTime";
  constructor(private cognitoService: CognitoService,
    private timekeepingService: ReceptionistTimekeepingService,
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
  }

  ngOnInit(): void {
    const role = sessionStorage.getItem("role");
    if (role) {
      this.roleId = role;
    }

    this.getListStaff();
  }


  getListStaff() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.Staff = res.message.map((StaffMember: any) => {
          let newStaff: StaffTimekeeping = {
            name: '',
            role: '',
            sub: '',
            staff_avt: '',
            locale: '',
            clockInStatus: "Chưa chấm",
            clockOutStatus: "Chưa chấm",
            clock_in: "",
            clock_out: "",
            isClockin: false,
            isClockout: false,
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
        console.log(this.Staff);
        this.StaffFilter = this.Staff;
        this.getTimekeeping();
      },
      )
  }

  getTimekeeping() {
    console.log("Thứ 2: ", this.timestampToGMT7Date(this.startTime));
    console.log("Chủ nhật: ", this.timestampToGMT7Date(this.endTime));
    this.timekeepingService.getTimekeeping(this.startTime, this.endTime)
      .subscribe(data => {
        // this.timekeepingOnWeeks = ConvertJson.processApiResponse(data);
        this.timekeepingOnWeeks = data;
        console.log("Api: ", data);
        this.timekeepingOnWeeks = this.organizeData(this.timekeepingOnWeeks);
        console.log("TimekeepingOnWeeks: ", this.timekeepingOnWeeks);

        console.log("Staff có undefined hay ko?: ", this.Staff);
        this.Staff.forEach(staff => {
          staff.weekTimekeeping = {};

          this.weekTimestamps.forEach(weekTimestamp => {
            staff.weekTimekeeping[weekTimestamp] = { clockIn: '', clockOut: '' };

            this.timekeepingOnWeeks.forEach((record: any) => {
              if (record.records && record.records.length > 0) {
                if (record.epoch === weekTimestamp.toString()) {
                  let detail = record.records.find((r: any) => r.subId === staff.sub);
                  if (detail && detail.details) {
                    staff.register_clock_in = (detail.details.register_clock_in !== undefined) ? detail.details.register_clock_in : 0;
                    staff.register_clock_out = (detail.details.register_clock_out !== undefined) ? detail.details.register_clock_out : 0;


                    staff.weekTimekeeping[weekTimestamp].clockIn =
                      (detail.details.clock_in !== undefined || detail.details.clock_in !== "0")
                        ? this.timestampToGMT7String(detail.details.clock_in)
                        : '';

                    staff.weekTimekeeping[weekTimestamp].clockOut =
                      (detail.details.clock_out !== undefined && detail.details.clock_out !== "0")
                        ? this.timestampToGMT7String(detail.details.clock_out)
                        : '';

                  }
                }
              }
              const foundRecord = record.records.find((record: any) => record.subId === staff.sub);
              if (foundRecord) {
                const details = foundRecord.details;
                staff.clockInStatus = (details.clock_in !== undefined && details.clock_in !== "0") ? 'Đã chấm' : 'Chưa chấm';
                staff.clockOutStatus = (details.clock_out !== undefined && details.clock_out !== "0") ? 'Đã chấm' : 'Chưa chấm';
                staff.clock_in = (details.clock_in !== undefined && details.clock_in !== "0") ? this.timestampToGMT7String(details.clock_in) : '';
                staff.clock_out = (details.clock_out !== undefined && details.clock_out !== "0") ? this.timestampToGMT7String(details.clock_out) : '';
                staff.isClockin = !!details.clock_in;
                staff.isClockout = (details.clock_out !== undefined && details.clock_out !== "0") ? true : false;
                staff.isClockoutDisabled = (details.clock_in !== undefined && details.clock_in !== "0") ? false : true;
              } else {
                staff.clockInStatus = 'Chưa chấm';
                staff.clockOutStatus = 'Chưa chấm';
                staff.clock_in = '';
                staff.clock_out = '';
                staff.isClockin = false;
                staff.isClockout = false;
                staff.isClockoutDisabled = true;
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

  onClockin(staff: StaffTimekeeping) {
    staff.clockInStatus = "Đã chấm";
    // staff.isClockin = true;
    this.Body = this.setClockinBody(staff);
    this.callClockinApi(staff);
  }

  openConfirmationModal(message: string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmButtonText = 'Thay đổi';
    modalRef.componentInstance.cancelButtonText = 'Hủy';

    return modalRef.result;
  }

  handleClockInChange(staff: StaffTimekeeping, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      const newClockInValue = target.value;
      const originalClockIn = staff.clock_in;

      //Để có thể pbiet giữa thời gian trong 1 ngày thì phải convert sang Date cùng 1 ngày đó
      const clockInDateTime = new Date(`1970-01-01T${newClockInValue}:00Z`);
      const clockOutDateTime = staff.clock_out ? new Date(`1970-01-01T${staff.clock_out}:00Z`) : null;

      this.openConfirmationModal("Bạn có chắc chắn muốn thay đổi thời gian chấm công đến không?")
        .then((result) => {
          if (result === 'confirm') {
            if (clockOutDateTime && clockInDateTime >= clockOutDateTime) {
              staff.clock_in = originalClockIn;
              this.cd.detectChanges();
              this.toastr.error("Thời gian chấm công đến phải nhỏ hơn thời gian chấm công về.");
            } else {
              staff.clock_in = newClockInValue;
              this.Body = this.setClockinBody(staff);
              this.callClockinApi(staff);
            }
          } else {
            staff.clock_in = originalClockIn;
          }
        });
    }
  }



  callClockinApi(staff: StaffTimekeeping) {
    this.timekeepingService.postTimekeeping(this.Body)
      .subscribe((res) => {
        this.toastr.success(res.message, "Chấm công đến thành công");
        //Update UI
        if (staff.clock_in == "") {
          staff.clock_in = this.currentTimeGMT7;
        }
        staff.isClockin = true;
        staff.isClockout = false;
      },
        (error) => {
          this.toastr.error("Không thể chấm công đến");
        });
  }

  onClockout(staff: StaffTimekeeping) {
    staff.clockOutStatus = "Đã chấm";

    this.Body = this.setClockoutBody(staff);
    this.callClockoutApi(staff);
  }

  handleClockOutChange(staff: StaffTimekeeping, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      const newClockoutValue = target.value;
      const originalClockOut = staff.clock_out;

      const clockInDateTime = staff.clock_in ? new Date(`1970-01-01T${staff.clock_in}:00Z`) : null;
      const newClockOutDateTime = new Date(`1970-01-01T${newClockoutValue}:00Z`);

      this.openConfirmationModal("Bạn có chắc chắn muốn thay đổi thời gian chấm công về không?").then((result) => {
        if (result === 'confirm') {
          if (clockInDateTime && newClockOutDateTime <= clockInDateTime) {
            this.toastr.error("Thời gian chấm công về phải lớn hơn thời gian chấm công đến.");
            staff.clock_out = originalClockOut;
          } else {
            staff.clock_out = newClockoutValue;
            this.Body = this.setClockoutBody(staff);
            this.callClockoutApi(staff);
          }
        } else {
          staff.clock_out = originalClockOut;
        }
      });
    }
  }



  callClockoutApi(staff: StaffTimekeeping) {
    this.timekeepingService.postTimekeeping(this.Body)
      .subscribe((res) => {
        this.toastr.success(res.message, "Chấm công về thành công");

        console.log(this.Body);
        if (staff.clock_out == "") {
          staff.clock_out = this.currentTimeGMT7;
        }

        staff.isClockout = true;
        staff.isClockoutDisabled = false;
      },
        (error) => {
          this.toastr.error("Không thể chấm công về");
        });
  }

  setClockinBody(Staff: StaffTimekeeping): RequestBodyTimekeeping {
    const username = sessionStorage.getItem("username");
    return {
      epoch: this.currentDateTimeStamp,
      sub_id: Staff.sub,
      role: Staff.role,
      register_clock_in: Staff.register_clock_in,
      register_clock_out: Staff.register_clock_out,
      staff_name: Staff.name,
      staff_avt: Staff.staff_avt,
      clock_in: (Staff.clock_in == "") ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(Staff.clock_in, this.currentDateGMT7),
      clock_out: 0,
      timekeeper_name: username ?? "",
      timekeeper_avt: "",
      status: 2
    }
  }

  setClockoutBody(Staff: StaffTimekeeping): RequestBodyTimekeeping {
    const username = sessionStorage.getItem("username");
    return {
      epoch: this.currentDateTimeStamp,
      sub_id: Staff.sub,
      role: Staff.role,
      register_clock_in: Staff.register_clock_in,
      register_clock_out: Staff.register_clock_out,
      staff_name: Staff.name,
      staff_avt: Staff.staff_avt,
      clock_in: this.timeAndDateToTimestamp(Staff.clock_in, this.currentDateGMT7),
      clock_out: (Staff.clock_out == "") ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(Staff.clock_out, this.currentDateGMT7),
      timekeeper_name: username ?? "",
      timekeeper_avt: "",
      status: 2
    }
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
