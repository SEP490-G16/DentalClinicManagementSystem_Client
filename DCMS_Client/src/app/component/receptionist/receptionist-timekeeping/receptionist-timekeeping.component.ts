import { ReceptionistTimekeepingService } from './../../../service/ReceptionistService/receptionist-timekeeping.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import 'moment/locale/vi';
import { ToastrService } from 'ngx-toastr';
import { RequestBodyTimekeeping, Staff } from 'src/app/model/ITimekeeping';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { CognitoService } from 'src/app/service/cognito.service';
@Component({
  selector: 'app-receptionist-timekeeping',
  templateUrl: './receptionist-timekeeping.component.html',
  styleUrls: ['./receptionist-timekeeping.component.css']
})
export class ReceptionistTimekeepingComponent implements OnInit {
  loading: boolean = false;
  Body: RequestBodyTimekeeping;
  Staff: Staff[] = [{
    name: 'Trần Văn Thế',
    role: '1',
    sub: 'ad2879dd-626c-4ade-8c95-da187af572ad',
    clockInStatus: "Chưa chấm", //Ghi đè mấy cái này sau khi call từ Cognito
    clockOutStatus: "Chưa chấm",
    timeClockin: "",
    timeClockout: "",
    isClockin: false,
    isClockout: false
  },
  {
    name: 'Dũng',
    role: '1',
    sub: '8f659cff-f8d2-4326-9c34-de12d997442c',
    clockInStatus: "Chưa chấm",
    clockOutStatus: "Chưa chấm",
    timeClockin: "",
    timeClockout: "",
    isClockin: false,
    isClockout: false
  }];

  sampleData = {
    "0": { "M": { "clock_in": { "N": '1699958700000' }, "clock_out": { "N": '1699958700000' }, "staff_avt": { "S": '' }, "staff_name": { "S": 'Dũng' }, "status": { "N": '2' }, "timekeeper_avt": { "S": '' }, "timekeeper_name": { "S": 'Long' } } },
    "ad2879dd-626c-4ade-8c95-da187af572ad": { "M": { "clock_in": { "N": '1699958640000' }, "clock_out": { "N": '1699958640000' }, "staff_avt": { "S": '' }, "staff_name": { "S": 'Trần Văn Thế' }, "status": { "N": '2' }, "timekeeper_avt": { "S": '' }, "timekeeper_name": { "S": 'Long' } } },
    "epoch": { "N": "1699894800000" },
    "type": { "S": "t" }
  };

  //Current
  currentDateTimeStamp: number = 0;
  currentTimeTimeStamp: number = 0;
  currentDateGMT7: string = "";
  currentTimeGMT7: string = "";

  //Week
  weekTimestamps: number[] = [];

  thu: string = "";
  constructor(private cognitoService: CognitoService,
    private timekeepingService: ReceptionistTimekeepingService,
    private toastr: ToastrService,
    private router: Router) {



    this.Body = {
      epoch: 123,
      sub_id: "",
      staff_name: "",
      staff_avt: "",
      clock_in: 0,
      clock_out: 0,
      timekeeper_name: "",
      timekeeper_avt: "",
      status: 2
    } as RequestBodyTimekeeping


    //Get Thứ
    moment.locale('vi');
    this.thu = moment().format('dddd');

    //Get Date
    this.currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
    //Set epoch to body
    this.currentDateTimeStamp = this.dateToTimestamp(this.currentDateGMT7);
    this.currentTimeTimeStamp = this.timeAndDateToTimestamp(this.currentTimeGMT7, this.currentDateGMT7);

    //Set week
    for (let i = 0; i < 7; i++) {
      this.weekTimestamps.push(moment().startOf('week').add(i, 'days').unix());
    }
    console.log("ok", this.weekTimestamps);

  }

  ngOnInit(): void {

    this.getTimekeeping();

    this.StaffFilter = this.Staff;

  }

  timekeepingOnWeeks: any
  getTimekeeping() {
    this.loading = true;
    this.timekeepingService.getTimekeeping(this.currentDateTimeStamp, this.currentDateTimeStamp)
      .subscribe(data => {
        this.loading = false;
        // this.timekeepingOnWeeks = ConvertJson.processApiResponse(data);
        this.timekeepingOnWeeks = data;
        console.log("TimekeepingOnWeeks: ", this.timekeepingOnWeeks);
      },
        (err) => {
          this.loading = false;
          this.toastr.error(err.error.message, "Chấm công về thành công");
        }
      )
  }



  StaffFilter: any;
  selectedFilter: string = "";
  filterStaff() {
    console.log("Role: ", this.selectedFilter);
    if (this.selectedFilter === "") {
      this.StaffFilter = this.Staff;
    } else {
      this.StaffFilter = this.StaffFilter.filter((s: Staff) => s.role === this.selectedFilter);
    }
  }

  timeClockinColor: string = "onTime";

  //Thời gian vào làm: 16:00
  onClockin(staff: Staff) {
    this.loading = true;
    this.Body.epoch = this.currentDateTimeStamp;
    this.Body.clock_in = this.currentTimeTimeStamp;
    this.Body.sub_id = staff.sub;
    this.Body.staff_name = staff.name;
    this.Body.timekeeper_name = "Long";
    console.log("Body", this.Body);

    const clinicTimeIn = this.timeAndDateToTimestamp("16:00", this.currentDateGMT7);
    if (this.Body.clock_in > clinicTimeIn) {
      //add Class Red
      this.timeClockinColor = "lateTime";
    }

    this.timekeepingService.postTimekeeping(this.Body)
      .subscribe((res) => {
        this.toastr.success(res.message, "Chấm công về thành công");
        //Set time Clockin
        staff.isClockin = true;
        staff.clockInStatus = "Đã chấm"
        staff.timeClockin = this.currentTimeGMT7;

        this.loading = false;
      },
        (err) => {
          this.loading = false;
          this.toastr.error(err.error.message, "Chấm công thất bại");

        }
      )
  }

  //Thời gian tan làm 20:00
  timeClockoutColor: string = "onTime";
  onClockout(staff: Staff) {
    this.loading = true;

    staff.isClockout = !staff.isClockout;
    console.log("Clockout: ", staff.isClockout);

    if (staff.isClockout) {
      this.Body.epoch = this.currentDateTimeStamp;
      this.Body.clock_out = this.currentTimeTimeStamp;

      const clinicTimeOut = this.timeAndDateToTimestamp("20:00", this.currentDateGMT7);
      if (this.Body.clock_out > clinicTimeOut) {
        //add Class Red
        this.timeClockoutColor = "lateTime";
      }
      this.timekeepingService.postTimekeeping(this.Body)
        .subscribe((res) => {
          this.toastr.success(res.message, "Chấm công về thành công");
          //Set time Clockout
          this.loading = false;
          console.log("Body clockout", this.Body);
          staff.clockOutStatus = "Đã chấm"
          staff.timeClockout = this.currentTimeGMT7;
        },
          (err) => {
            this.loading = false;
            this.toastr.error(err.error.message, "Chấm công thất bại");
          }
        )

    } else {
      this.Body.clock_out = 0;
      this.timekeepingService.postTimekeeping(this.Body)
        .subscribe((res) => {
          this.loading = false;
          this.toastr.success(res.mmessage, "Hủy chấm thành công");
          //Set time Clockout
          console.log("Cancel clockout", this.Body);
          staff.clockOutStatus = "Chưa chấm"
          staff.timeClockout = "";
        },
          (err) => {
            this.loading = false;
            this.toastr.error(err.error.message, "Chấm công thất bại");
          }
        )
    }
  }


  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm:ss');
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
    return timestamp;
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
