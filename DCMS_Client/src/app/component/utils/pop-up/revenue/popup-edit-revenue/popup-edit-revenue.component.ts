import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PaidMaterialUsageService } from 'src/app/service/PaidMaterialUsageService/paid-material-usage.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-popup-edit-revenue',
  templateUrl: './popup-edit-revenue.component.html',
  styleUrls: ['./popup-edit-revenue.component.css']
})
export class PopupEditRevenueComponent implements OnInit {

  @Input() billEdit:any;


  EDIT_BILL_BODY = {
    epoch: '', 
    createDate: '', 
    createBy: '', 
    typeExpense: '', 
    note: '', 
    totalAmount: ''
  }
  constructor(private paidMaterialUsageService: PaidMaterialUsageService,
    private toastr: ToastrService) { }

    messageBody={
      epoch: '',
      expenses: `{"createBy":"", "createDate":"", "typeExpense": "", "totalAmount":"", "note":""}`
    }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['billEdit']) {
      this.EDIT_BILL_BODY = {
        epoch: this.billEdit.epoch,
        createDate: this.billEdit.createDate,
        createBy: this.billEdit.createBy,
        typeExpense: this.billEdit.typeExpense,
        note: this.billEdit.note,
        totalAmount: this.billEdit.totalAmount
      }
    }
  }

  putBillObjectEdit(bill: any) {
    console.log(this.EDIT_BILL_BODY);
    this.messageBody = {
      epoch: this.EDIT_BILL_BODY.epoch,
      expenses: `{\\\"createBy\\\":\\\"${this.EDIT_BILL_BODY.createBy}\\\", \\\"createDate\\\":\\\"${this.dateToTimestamp(this.EDIT_BILL_BODY.createDate)}\\\", \\\"typeExpense\\\": \\\"${this.EDIT_BILL_BODY.typeExpense}\\\", \\\"totalAmount\\\":\\\"${this.EDIT_BILL_BODY.totalAmount}\\\", \\\"note\\\":\\\"${this.EDIT_BILL_BODY.note}\\\"}`
    };
    this.paidMaterialUsageService.updatePaidMaterialUsage(bill.epoch, JSON.stringify(this.messageBody)).subscribe(
      (data) => {
        this.showSuccessToast("Chỉnh sửa thành công");
        window.location.reload();
      },
      (err) => {
        this.showErrorToast("Lỗi khi chỉnh sửa");
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
