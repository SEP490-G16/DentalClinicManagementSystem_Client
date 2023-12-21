import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PaidMaterialUsageService } from 'src/app/service/PaidMaterialUsageService/paid-material-usage.service';
import * as moment from 'moment-timezone';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {FormatNgbDate} from "../../../libs/formatNgbDate";

@Component({
  selector: 'app-popup-edit-revenue',
  templateUrl: './popup-edit-revenue.component.html',
  styleUrls: ['./popup-edit-revenue.component.css']
})
export class PopupEditRevenueComponent implements OnInit {

  @Input() billEdit:any;
  @Input() listFilterDate:any;
  createDateNgbModal!:NgbDateStruct;
  EDIT_BILL_BODY = {
    id: '',
    epoch: '',
    createDate: '',
    createBy: '',
    typeExpense: '',
    note: '',
    totalAmount: ''
  }
  validate = {
    createDate:'',
    createBy:'',
    type:'',
    totalAmount:''
  }
  isSubmitted:boolean = false;
  constructor(private paidMaterialUsageService: PaidMaterialUsageService,
    private toastr: ToastrService) { }

    messageBody={
      expenses_id: '',
      expenses: `{"createBy":"", "createDate":"", "typeExpense": "", "totalAmount":"", "note":""}`
    }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['billEdit'] && this.billEdit) {
      const createDateParts = this.billEdit.createDate?.split(' ')[0].split('-').map(Number);
      if (createDateParts && createDateParts.length === 3) {
        this.createDateNgbModal = { year: createDateParts[0], month: createDateParts[1], day: createDateParts[2] };
      }
      this.EDIT_BILL_BODY = {
        id: this.billEdit.id,
        epoch: this.billEdit.epoch,
        // createDate: this.billEdit.createDate,
        createDate: createDateParts,
        createBy: this.billEdit.createBy,
        typeExpense: this.billEdit.typeExpense,
        note: this.billEdit.note,
        totalAmount: this.billEdit.totalAmount
      }
    }
  }

  putBillObjectEdit(bill: any) {
    console.log(this.EDIT_BILL_BODY);
    const createDate = FormatNgbDate.formatNgbDateToString(this.createDateNgbModal);
    this.resetValidate();
    if (!this.EDIT_BILL_BODY.createBy){
      this.validate.createBy = "Vui lòng nhập người chi!";
      this.isSubmitted = true;
    }
    if (!this.EDIT_BILL_BODY.typeExpense){
      this.validate.type = "Vui lòng nhập loại chi!";
      this.isSubmitted = true;
    }
    if (!createDate || !this.formatDate(createDate)) {
      this.validate.createDate = 'Vui lòng nhập nhập ngày tạo!';
      this.isSubmitted = true;
    }
    if (!this.EDIT_BILL_BODY.totalAmount){
      this.validate.totalAmount = "Vui lòng nhập số tiền!";
      this.isSubmitted = true;
    }
    else if (this.EDIT_BILL_BODY.totalAmount && !this.checkNumber(this.EDIT_BILL_BODY.totalAmount)){
      this.validate.totalAmount = "Số tiền không hợp lệ!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.messageBody = {
      expenses_id: this.EDIT_BILL_BODY.epoch,
      expenses: `{\\\"createBy\\\":\\\"${this.EDIT_BILL_BODY.createBy}\\\", \\\"createDate\\\":\\\"${this.dateToTimestamp(this.EDIT_BILL_BODY.createDate)}\\\", \\\"typeExpense\\\": \\\"${this.EDIT_BILL_BODY.typeExpense}\\\", \\\"totalAmount\\\":\\\"${this.EDIT_BILL_BODY.totalAmount}\\\", \\\"note\\\":\\\"${this.EDIT_BILL_BODY.note}\\\"}`
    };
    this.paidMaterialUsageService.updatePaidMaterialUsageNew(bill.id, JSON.stringify(this.messageBody)).subscribe(
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
  resetValidate(){
    this.validate = {
      createDate: '',
      createBy:'',
      type:'',
      totalAmount:''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
  private formatDate(dateString: any): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }
}
