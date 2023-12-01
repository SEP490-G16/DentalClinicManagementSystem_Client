import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PaidMaterialUsageService } from 'src/app/service/PaidMaterialUsageService/paid-material-usage.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-popup-add-report-expenditure',
  templateUrl: './popup-add-report-expenditure.component.html',
  styleUrls: ['./popup-add-report-expenditure.component.css']
})
export class PopupAddReportExpenditureComponent implements OnInit {

  
  paidExpense = {
    createDate: '', 
    createBy: '', 
    typeExpense: '0', 
    totalAmount: '',
    note: ''
  }

  messageBody={
    epoch: '',
    expenses: `{"createBy":"", "createDate":"", "typeExpense": "", "totalAmount":"", "note":""}`
  }

  constructor(private paidMaterialUsageService: PaidMaterialUsageService,
    private toastr: ToastrService) { 

    }

  ngOnInit(): void {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.paidExpense.createDate = parseInt(currentDateGMT7.split('-')[0])+"-"+parseInt(currentDateGMT7.split('-')[1])+"-"+(parseInt(currentDateGMT7.split('-')[2]));
    let user = sessionStorage.getItem('username');
    if (user != null) {
      this.paidExpense.createBy = user;
    }
  }
  
  AddNewExpense() {
    this.paidExpense.createDate = this.dateToTimestamp(this.paidExpense.createDate)+"";
    this.messageBody = {
      epoch: this.paidExpense.createDate,
      expenses: `{\\\"createBy\\\":\\\"${this.paidExpense.createBy}\\\", \\\"createDate\\\":\\\"${this.paidExpense.createDate}\\\", \\\"typeExpense\\\": \\\"${this.paidExpense.typeExpense}\\\", \\\"totalAmount\\\":\\\"${this.paidExpense.totalAmount}\\\", \\\"note\\\":\\\"${this.paidExpense.note}\\\"}`
    };
    this.paidMaterialUsageService.postExpense(this.messageBody).subscribe(
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

}
