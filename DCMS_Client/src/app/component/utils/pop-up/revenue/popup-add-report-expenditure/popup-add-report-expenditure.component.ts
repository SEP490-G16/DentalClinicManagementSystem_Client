import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PaidMaterialUsageService } from 'src/app/service/PaidMaterialUsageService/paid-material-usage.service';
import * as moment from 'moment-timezone';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {FormatNgbDate} from "../../../libs/formatNgbDate";

@Component({
  selector: 'app-popup-add-report-expenditure',
  templateUrl: './popup-add-report-expenditure.component.html',
  styleUrls: ['./popup-add-report-expenditure.component.css']
})
export class PopupAddReportExpenditureComponent implements OnInit {

  createDateNgbModal!:NgbDateStruct;
  paidExpense = {
    createDate: '',
    createBy: '',
    typeExpense: '',
    totalAmount: '',
    note: ''
  }
  validate = {
    createDate:'',
    createBy:'',
    type:'',
    totalAmount:''
  }
  isSubmitted:boolean = false;
  messageBody={
    epoch: '',
    expenses: `{"createBy":"", "createDate":"", "typeExpense": "", "totalAmount":"", "note":""}`
  }

  constructor(private paidMaterialUsageService: PaidMaterialUsageService,
    private toastr: ToastrService) {

    }

  ngOnInit(): void {
    let user = sessionStorage.getItem('username');
    if (user != null) {
      this.paidExpense.createBy = user;
    }
    //const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    // const year = currentDateGMT7.split('-')[0];
    // const month = currentDateGMT7.split('-')[1];
    // const day = currentDateGMT7.split('-')[2];
    //
    // this.paidExpense.createDate = `${year}-${month}-${day}`;

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.createDateNgbModal = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };
    this.paidExpense.createDate = `${this.createDateNgbModal.year}-${FormatNgbDate.pad(this.createDateNgbModal.month)}-${FormatNgbDate.pad(this.createDateNgbModal.day)}`;

  }

  AddNewExpense() {
    const createDate = FormatNgbDate.formatNgbDateToString(this.createDateNgbModal);
    this.resetValidate();
    if (!this.paidExpense.createBy){
      this.validate.createBy = "Vui lòng nhập người chi!";
      this.isSubmitted = true;
    }
    if (!this.paidExpense.typeExpense){
      this.validate.type = "Vui lòng nhập loại chi!";
      this.isSubmitted = true;
    }
    if (!createDate || !this.formatDate(createDate)) {
      this.validate.createDate = 'Vui lòng nhập nhập ngày tạo!';
      this.isSubmitted = true;
    }
    if (!this.paidExpense.totalAmount){
      this.validate.totalAmount = "Vui lòng nhập số tiền!";
      this.isSubmitted = true;
    }
    else if (this.paidExpense.totalAmount && !this.checkNumber(this.paidExpense.totalAmount)){
      this.validate.totalAmount = "Số tiền không hợp lệ!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.paidExpense.createDate = this.dateToTimestamp(this.paidExpense.createDate)+"";
    this.messageBody = {
      epoch: this.paidExpense.createDate,
      expenses: `{\\\"createBy\\\":\\\"${this.paidExpense.createBy}\\\", \\\"createDate\\\":\\\"${this.paidExpense.createDate}\\\", \\\"typeExpense\\\": \\\"${this.paidExpense.typeExpense}\\\", \\\"totalAmount\\\":\\\"${this.paidExpense.totalAmount}\\\", \\\"note\\\":\\\"${this.paidExpense.note}\\\"}`
    };
    this.paidMaterialUsageService.postExpenseNew(this.messageBody).subscribe(
      (data) => {
        this.showSuccessToast("Thêm mới thành công");
        this.paidExpense = {
          createDate: '',
          createBy: '',
          typeExpense: '',
          totalAmount: '',
          note: ''
        }
        window.location.reload();
      },
      (err) => {
        this.showErrorToast("Lỗi khi thêm mới chi");
      }
    );
  }

  resetValidate(){
    this.validate = {
      createDate: '',
      createBy:'',
      type:'',
      totalAmount:''
    }
    this.isSubmitted = false;
  }
  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
  private formatDate(dateString: any): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }
}
