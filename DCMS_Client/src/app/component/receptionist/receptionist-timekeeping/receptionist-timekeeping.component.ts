import { ReceptionistTimekeepingService } from './../../../service/ReceptionistService/receptionist-timekeeping.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import 'moment/locale/vi';
import { ToastrService } from 'ngx-toastr';
import { RequestBodyTimekeeping, Staff } from 'src/app/model/ITimekeeping';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { CognitoService } from 'src/app/service/cognito.service';
import {ResponseHandler} from "../../utils/libs/ResponseHandler";
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
    isClockout: true,
    weekTimekeeping: {}
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
    isClockout: true,
    weekTimekeeping: {}
  }];

  //Current
  currentDateTimeStamp: number = 0;
  currentTimeTimeStamp: number = 0;
  currentDateGMT7: string = "";
  currentTimeGMT7: string = "";

  //Week
  weekTimestamps: number[] = [];
  startTime: number = 0;
  endTime: number = 0;
  todayTimekeeping: any;
  //SubId
  SubId_Arr: string[] = [];

  timekeepingOnWeeks: any
  timeClockinColor: string = "onTime";
  timeClockoutColor: string = "onTime";
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

    moment.locale('vi');

    //Get Date
    this.currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
    //Set epoch to body
    this.currentDateTimeStamp = this.dateToTimestamp(this.currentDateGMT7);
    console.log("Current Date Timestamp: ", this.currentDateTimeStamp);
    this.currentTimeTimeStamp = this.timeAndDateToTimestamp(this.currentTimeGMT7, this.currentDateGMT7);

    //Set week
    for (let i = 0; i < 7; i++) {
      this.weekTimestamps.push(moment.tz('Asia/Ho_Chi_Minh').startOf('week').add(i, 'days').unix());
    }
    console.log("WeekTimes: ", this.weekTimestamps);
    this.startTime = this.weekTimestamps[0];
    this.endTime = this.weekTimestamps[6];
  }

  ngOnInit(): void {

    this.getTimekeeping();

    this.StaffFilter = this.Staff;

  }

  getTimekeeping() {
    this.loading = true;
    console.log("Thứ 2: ", this.timestampToGMT7Date(this.startTime));
    console.log("Chủ nhật: ", this.timestampToGMT7Date(this.endTime));
    this.timekeepingService.getTimekeeping(this.startTime, this.endTime)
      .subscribe(data => {
        this.loading = false;
        // this.timekeepingOnWeeks = ConvertJson.processApiResponse(data);
        this.timekeepingOnWeeks = data;
        // console.log("Api: ", this.timekeepingOnWeeks);
        this.timekeepingOnWeeks = this.organizeData(this.timekeepingOnWeeks);
        console.log("TimekeepingOnWeeks: ", this.timekeepingOnWeeks);

        this.Staff.forEach(staff => {
          staff.weekTimekeeping = {};

          this.weekTimestamps.forEach(weekTimestamp => {
            staff.weekTimekeeping[weekTimestamp] = { clockIn: '', clockOut: '' };

            this.timekeepingOnWeeks.forEach((record: any) => {
              if (record.records && record.records.length > 0) {
                let detail = record.records.find((r: any) => r.subId === staff.sub);
                if (detail && detail.details) {
                  if (record.epoch === weekTimestamp.toString()) {
                    staff.weekTimekeeping[weekTimestamp].clockIn = this.timestampToGMT7String(detail.details.clock_in) || '';
                    staff.weekTimekeeping[weekTimestamp].clockOut = this.timestampToGMT7String(detail.details.clock_out) || '';
                  }
                }
              }
              const foundRecord = record.records.find((record: any) => record.subId === staff.sub);
              if (foundRecord) {
                const details = foundRecord.details;
                staff.clockInStatus = details.clock_in ? 'Đã chấm' : 'Chưa chấm';
                staff.clockOutStatus = details.clock_out ? 'Đã chấm' : 'Chưa chấm';
                staff.timeClockin = details.clock_in ? this.timestampToGMT7String(+details.clock_in) : '';
                staff.timeClockout = details.clock_out ? this.timestampToGMT7String(+details.clock_out) : '';
                staff.isClockin = !!details.clock_in;
                staff.isClockout = !!details.clock_out;
              } else {
                staff.clockInStatus = 'Chưa chấm';
                staff.clockOutStatus = 'Chưa chấm';
                staff.timeClockin = '';
                staff.timeClockout = '';
                staff.isClockin = false;
                staff.isClockout = false;
              }
            });
          });
        });
        console.log("Staff sort: ", this.Staff);
      },
        (error) => {
          this.loading = false;
          //this.toastr.error(err.error.message, "Lấy danh sách chấm công thất bại");
          ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl+"/timekeeping/"+this.startTime+"/"+this.endTime, error);
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

  //Thời gian vào làm: 16:00
  onClockin(staff: Staff) {
    this.loading = true;
    this.Body.epoch = this.currentDateTimeStamp;
    this.Body.clock_in = (staff.timeClockin == "") ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(staff.timeClockin, this.currentDateGMT7);
    this.Body.sub_id = staff.sub;
    this.Body.staff_name = staff.name;
    this.Body.timekeeper_name = "Long";
    console.log("OnClick Body: ", this.Body);

    this.timekeepingService.postTimekeeping(this.Body)
      .subscribe((res) => {
        this.toastr.success(res.message, "Chấm công vào thành công");
        //Set time Clockin lên UI
        staff.isClockin = true;
        staff.clockInStatus = "Đã chấm"
        if (staff.timeClockin == "") {
          staff.timeClockin = this.currentTimeGMT7;
        }
        this.loading = false;
      },
        (error) => {
          this.loading = false;
         // this.toastr.error(err.error.message, "Chấm công vào thất bại");
          ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl+"/timekeeping", error);
        }
      )
  }

  onClockout(staff: Staff) {
    this.loading = true;

    staff.isClockout = !staff.isClockout;
    console.log("OnClickout: ", staff);

    if (!staff.isClockout) {
      this.Body.epoch = this.currentDateTimeStamp;
      this.Body.clock_out = (this.Body.clock_out) ? this.currentTimeTimeStamp : this.timeAndDateToTimestamp(staff.timeClockout, this.currentDateGMT7);

      this.timekeepingService.postTimekeeping(this.Body)
        .subscribe((res) => {
          this.toastr.success(res.message, "Chấm công về thành công");
          //Set time Clockout lên UI
          this.loading = false;
          console.log("Body clockout: ", this.Body);
          staff.clockOutStatus = "Đã chấm"
          if (staff.timeClockout == "") {
            staff.timeClockout = this.currentTimeGMT7;
          }
        },
          (error) => {
            this.loading = false;
            //this.toastr.error(err.error.message, "Chấm công về thất bại");
            ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl+"/timekeeping", error);
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
          (error) => {
            this.loading = false;
            //this.toastr.error(err.error.message, "Chấm công thất bại");
            ResponseHandler.HANDLE_HTTP_STATUS(this.timekeepingService.apiUrl+"/timekeeping", error);
          }
        )
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
    // Kiểm tra xem timestamp có đơn vị giây hay mili giây
    const timestampInMilliseconds = timestamp * (timestamp > 1e12 ? 1 : 1000);

    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestampInMilliseconds, 'Asia/Ho_Chi_Minh').format('HH:mm');

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
interface TimekeepingDetail {
  clock_in?: string;
  clock_out?: string;
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
