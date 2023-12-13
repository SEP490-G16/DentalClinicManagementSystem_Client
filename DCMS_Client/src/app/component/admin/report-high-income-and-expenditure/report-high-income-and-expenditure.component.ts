import { Component, OnInit } from '@angular/core';
import * as moment from "moment-timezone";
import { MaterialUsageReportService } from "../../../service/MaterialUsageService/material-usage-report.service";
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-report-high-income-and-expenditure',
  templateUrl: './report-high-income-and-expenditure.component.html',
  styleUrls: ['./report-high-income-and-expenditure.component.css']
})
export class ReportHighIncomeAndExpenditureComponent implements OnInit {

  getReports: any[] = [];
  status: string = "0";
  constructor(private materialUsageService: MaterialUsageReportService) {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };
    this.endDate = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };
  }
  // startDate: string = '';
  // endDate: string = '';
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct
  searchName: string = '';
  ngOnInit(): void {
    // var today = new Date();
    // this.startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // this.endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
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

  getReportMaterialUsage() {
    this.uniqueList.splice(0, this.uniqueList.length)
    this.stastisticTotal = {
      initialTotalAmount: 0,
      totalAmount: 0,
      discount: 0,
      totalPay: 0,
      totalLeft: 0
    };
    const startDateYear = this.startDate.year;
    const startDateMonth = this.startDate.month.toString().padStart(2, '0');
    const startDateDay = this.startDate.day.toString().padStart(2, '0');
    const startDate = `${startDateYear}-${startDateMonth}-${startDateDay}`;
    const startTime = this.dateToTimestamp(startDate + '00:00:00');

    const endDateYear = this.endDate.year;
    const endDateMonth = this.endDate.month.toString().padStart(2, '0');
    const endDateDay = this.endDate.day.toString().padStart(2, '0');
    const endDate = `${endDateYear}-${endDateMonth}-${endDateDay}`;
    const endTime = this.dateToTimestamp(endDate + '23:59:59');
    this.stastisticRevenuePatient.splice(0, this.stastisticRevenuePatient.length);
    this.materialUsageService.getMaterialUsages(startTime, endTime).subscribe(data => {
      this.getReports = data.data;
      console.log(this.getReports);
      this.getReports.forEach((s: any) => {
        const currentObject = s;
        currentObject.mu_data.forEach((item: any) => {
          if (item.mu_medical_procedure_id != null) {
            this.stastisticTotal.initialTotalAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);;
            this.stastisticTotal.totalAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);;
            this.stastisticTotal.discount += 0;
            if (item.mu_total_paid != undefined && item.mu_total_paid != null) {
              this.stastisticTotal.totalPay += parseInt(item.mu_total_paid);
              this.stastisticTotal.totalLeft += parseInt(item.mu_price) * parseInt(item.mu_quantity) - parseInt(item.mu_total_paid);
            }
          }
        })
        if (!this.uniqueList.includes(currentObject.p_data.p_patient_id)) {
          this.uniqueList.push(currentObject.p_data.p_patient_id);
          this.stastisticPatientObject.patientCode = currentObject.p_data.p_patient_id;
          this.stastisticPatientObject.patientName = currentObject.p_data.p_patient_name;
          this.stastisticPatientObject.phoneNumber = currentObject.p_data.p_phone_number;
          this.stastisticPatientObject.address = currentObject.p_data.p_address;
          currentObject.mu_data.forEach((item: any) => {
            if (item.mu_medical_procedure_id != null) {
              this.stastisticPatientObject.initialAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);
              this.stastisticPatientObject.discount += 0;
              this.stastisticPatientObject.totalAmount += parseInt(item.mu_price) * parseInt(item.mu_quantity);
              this.stastisticPatientObject.totalPay += parseInt(item.mu_total_paid);
              this.stastisticPatientObject.totalLeft += parseInt(item.mu_price) * parseInt(item.mu_quantity) - parseInt(item.mu_total_paid);
            }
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
            console.log(patient.patientCode)
            if (patient.patientCode == currentObject.p_data.p_patient_id) {
              currentObject.mu_data.forEach((item: any) => {
                if (item.mu_medical_procedure_id != null) {
                  patient.initialAmount += (parseInt(item.mu_price) * parseInt(item.mu_quantity));
                  patient.discount = 0;
                  patient.totalAmount += (parseInt(item.mu_price) * parseInt(item.mu_quantity));
                  patient.totalPay += parseInt(item.mu_total_paid);
                  patient.totalLeft += (parseInt(item.mu_price) * parseInt(item.mu_quantity) - parseInt(item.mu_total_paid));
                }
              })
            }
          })
        }
      })
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialUsageService.url + "/material-usage/report/" + startTime + "/" + endTime, error);
      }
    )
    this.stastisticRevenuePatientSearch = this.stastisticRevenuePatient;
  }

  stastisticRevenuePatientSearch: any[] = [];
  searchPatientName() {
    console.log(this.searchName);
    const search = this.searchName.toLowerCase().trim();
    if (search) {
      this.stastisticRevenuePatientSearch = this.stastisticRevenuePatient
        .filter((patient: any) => {
          const patientName = patient.patientName.toLowerCase();
          return patientName.includes(search);
        });
    } else {
      this.stastisticRevenuePatientSearch = this.stastisticRevenuePatient;
    }
  }
  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
  onValueChangeStartDate(event: any) {

    // alert(this.startDate);
    // alert(this.endDate);
    var today = new Date();
    if (event != null) {
      this.startDate = event;
    } else {
      //this.startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    }
    this.stastisticRevenuePatient.splice(0, this.stastisticRevenuePatient.length);
    this.getReportMaterialUsage();
  }

  onValueChangeEndDate(event: any) {
    var today = new Date();
    if (event != null) {
      this.endDate = event;
    } else {
      //this.endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    }
    this.stastisticRevenuePatient.splice(0, this.stastisticRevenuePatient.length);
    this.getReportMaterialUsage();
  }

  // onValueChangeSelectedStatus(event: any) {
  //   this.status = event;
  //   this.getReportMaterialUsage();
  // }

}
