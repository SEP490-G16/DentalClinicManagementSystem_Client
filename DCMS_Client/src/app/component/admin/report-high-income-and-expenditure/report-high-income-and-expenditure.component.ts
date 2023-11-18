import { Component, OnInit } from '@angular/core';
import * as moment from "moment-timezone";
import {MaterialUsageReportService} from "../../../service/MaterialUsageService/material-usage-report.service";

@Component({
  selector: 'app-report-high-income-and-expenditure',
  templateUrl: './report-high-income-and-expenditure.component.html',
  styleUrls: ['./report-high-income-and-expenditure.component.css']
})
export class ReportHighIncomeAndExpenditureComponent implements OnInit {

  getReports:any[] = [];
  constructor(private materialUsageService:MaterialUsageReportService) { }
  startDate:string='2023-11-08 01:16:35';
  endDate:string = '2023-11-18 01:16:35';
  ngOnInit(): void {
    this.getReportMaterialUsage();
  }
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return Math.floor(timestamp); // Làm tròn xuống để nhận timestamp 10 chữ số
  }
  getReportMaterialUsage(){
    const startTime = this.dateToTimestamp(this.startDate);
    const endTime = this.dateToTimestamp(this.endDate);
    this.materialUsageService.getMaterialUsages(startTime,endTime).subscribe(data=>{
      this.getReports = data.data;
      console.log(this.getReports)
    })
  }
}
