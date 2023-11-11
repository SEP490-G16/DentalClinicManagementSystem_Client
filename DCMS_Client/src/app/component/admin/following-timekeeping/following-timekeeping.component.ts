import { Component, OnInit } from '@angular/core';
import {TimeKeepingService} from "../../../service/Follow-TimeKeepingService/time-keeping.service";
import {count} from "rxjs";
import * as moment from "moment-timezone";
import {RequestBodyTimekeeping} from "../../../model/ITimekeeping";

@Component({
  selector: 'app-following-timekeeping',
  templateUrl: './following-timekeeping.component.html',
  styleUrls: ['./following-timekeeping.component.css']
})
export class FollowingTimekeepingComponent implements OnInit {
  followingTimekeepings:any[]=[];
  constructor(private timekeepingService: TimeKeepingService) { }

  ngOnInit(): void {
   this.getFollowingTimekeeping();
   this.calculateDaysInMonth();
  }
  startTime:string="2023-11-01 00:00:00";
  endTime:string="2023-11-30 23:59:59";
  date:number[] = [1,2,3,4,5,6,7,8,9,10]
  ngaylamviec:number[]=[2,4,6,8,10]
  listNgaylamviec:any[]=[]
  hienThi={
    clock_in:'',
    clock_out:'',
    nghi:'',
  }
  nhanVienChamCong={
    tenNhanVien:'',
    role:'',
    ngayLamViec:[],

  }
  objectList:any[] = [];
  count:number=0;
  countChange(){
    this.count=1;
  }
  countChange2(){
    this.count=0;
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }
  timestampToGMT7String(timestamp: number): string {
    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm');
    return dateTimeString;
  }
  list:RequestBodyTimekeeping[]=[];
  /*this.followingTimekeepings.forEach((s:any)=>{
          console.log("s:",s);
          this.objectList.push(Object.values(s));
          console.log("object",this.objectList)
          this.nhanVienChamCong ={
            tenNhanVien: s['8f659cff-f8d2-4326-9c34-de12d997442c'].M.staff_name.S,
            role:'',
            ngayLamViec:[],
          }

        })*/
  getFollowingTimekeeping(){
    const startTime = this.dateToTimestamp(this.startTime);
    console.log(startTime);
    const endTime = this.dateToTimestamp(this.endTime);
    console.log(endTime)
    this.timekeepingService.getFollowingTimekeeping(startTime,endTime).subscribe(data=>{
      this.followingTimekeepings = data;
      console.log("67",this.followingTimekeepings)
    })
  }

  daysInMonth: number[] = [];
  calculateDaysInMonth() {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    this.daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  isSameDay(epoch: number, compareDate: Date): boolean {
    const epochDate = new Date(epoch);
    return (
      epochDate.getFullYear() === compareDate.getFullYear() &&
      epochDate.getMonth() === compareDate.getMonth() &&
      epochDate.getDate() === compareDate.getDate()
    );
  }
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  isClockInDay(day: number): boolean {
    const timestamp = new Date(this.currentYear, this.currentMonth, day).getTime();
    return this.isSameDay(1699462800000, new Date(timestamp));
  }
  isClockOutDay(day: number): boolean {
    const timestamp = new Date(this.currentYear, this.currentMonth, day).getTime();
    return this.isSameDay(1699462800000, new Date(timestamp));
  }
}
