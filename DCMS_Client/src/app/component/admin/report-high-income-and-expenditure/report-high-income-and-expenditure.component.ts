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
  searchName:string = '';
  ngOnInit(): void {
    this.getReportMaterialUsage();
  }
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return Math.floor(timestamp); // Làm tròn xuống để nhận timestamp 10 chữ số
  }
  //Dữ liệu test nên chưa để tạm

  stastisticTotal = {
    initialTotalAmount: 0,
    totalAmount: 0,
    discount: 0,
    totalPay: 0,
    totalLeft: 0
  };

  stastisticPatientObject = {
    patientCode: '',
    patientName: '',
    phoneNumber: '',
    address: '',
    initialAmount: 0,
    discount: 0,
    totalAmount: 0,
    totalPay: 0,
    totalLeft: 0
  }
  uniqueList: any[] = [];
  stastisticRevenuePatient: any[] = [];

  getReportMaterialUsage(){
    const startTime = this.dateToTimestamp(this.startDate);
    const endTime = this.dateToTimestamp(this.endDate);
    this.materialUsageService.getMaterialUsages(startTime,endTime).subscribe(data=>{
      this.getReports = data.data;
      this.getReports.forEach((s:any) => {
        console.log(s);
        const currentObject = s;
        currentObject.mu_data.forEach((item: any) => {
            this.stastisticTotal.initialTotalAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);;
            this.stastisticTotal.totalAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);;
            this.stastisticTotal.discount += 0;
            this.stastisticTotal.totalPay += parseInt(item.mu_total_paid);
            this.stastisticTotal.totalLeft += parseInt(item.mu_price) * parseInt(item.mu_quantity) - parseInt(item.mu_total_paid);
        })
        if (!this.uniqueList.includes(currentObject.p_data.p_patient_id)) {
          this.uniqueList.push(currentObject.p_data.p_patient_id);
          this.stastisticPatientObject.patientCode = currentObject.p_data.p_patient_id;
          this.stastisticPatientObject.patientName = currentObject.p_data.p_patient_name;
          this.stastisticPatientObject.phoneNumber = currentObject.p_data.p_phone_number;
          this.stastisticPatientObject.address = currentObject.p_data.p_address;
          currentObject.mu_data.forEach((item: any) => {
            this.stastisticPatientObject.initialAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);
            this.stastisticPatientObject.discount += 0;
            this.stastisticPatientObject.totalAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);
            this.stastisticPatientObject.totalPay += parseInt(item.mu_total_paid);
            this.stastisticPatientObject.totalLeft += parseInt(item.mu_price) * parseInt(item.mu_quantity) - parseInt(item.mu_total_paid);
          })
          this.stastisticRevenuePatient.push(this.stastisticPatientObject);
          this.stastisticPatientObject = {
            patientCode: '',
            patientName: '',
            phoneNumber: '',
            address: '',
            initialAmount: 0,
            discount: 0,
            totalAmount: 0,
            totalPay: 0,
            totalLeft: 0
          }
        } else {
          this.stastisticRevenuePatient.forEach((patient: any) => {
            if (patient.patientCode == currentObject.p_data.p_patient_id) {
              currentObject.mu_data.forEach((item:any) => {
                patient.initialAmount += (parseInt(item.mu_price) * parseInt(item.mu_quantity));
                patient.discount = 0;
                patient.totalAmount += (parseInt(item.mu_price) * parseInt(item.mu_quantity));
                patient.totalPay += parseInt(item.mu_total_paid);
                patient.totalLeft += (parseInt(item.mu_price) * parseInt(item.mu_quantity) - parseInt(item.mu_total_paid));
              })
            }
          })
        }
      })
    })
    this.stastisticRevenuePatientSearch = this.stastisticRevenuePatient;
  }

  stastisticRevenuePatientSearch: any[] = [];
  searchPatientName() {
    console.log(this.searchName);
    const search = this.searchName.toLowerCase().trim();
    if (search) {
      this.stastisticRevenuePatientSearch = this.stastisticRevenuePatient
        .filter((patient:any) => {
          const patientName = patient.patientName.toLowerCase();
          return patientName.includes(search);
        });
    } else {
      this.stastisticRevenuePatientSearch = this.stastisticRevenuePatient;
    }
  }
}
