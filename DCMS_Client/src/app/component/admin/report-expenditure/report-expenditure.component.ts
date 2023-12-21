import { Component, OnInit } from '@angular/core';
import { PaidMaterialUsageService } from 'src/app/service/PaidMaterialUsageService/paid-material-usage.service';
import { ToastrService } from 'ngx-toastr';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { error } from '@angular/compiler-cli/src/transformers/util';
import * as moment from 'moment-timezone';
import { IsThisSecondPipeModule } from 'ngx-date-fns';
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import { DatePipe } from "@angular/common";
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-expenditure',
  templateUrl: './report-expenditure.component.html',
  styleUrls: ['./report-expenditure.component.css']
})
export class ReportExpenditureComponent implements OnInit {

  billEdit: any;
  // fromDate: string = '';
  //toDate: string = '';
  fromDate!: NgbDateStruct;
  toDate!: NgbDateStruct
  endDate: any;
  startDate: any;
  constructor(private paidMaterialUsageService: PaidMaterialUsageService,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private router: Router,
    private toastr: ToastrService) {
    //const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    // this.fromDate = {
    //   year: parseInt(currentDateGMT7.split('-')[0]),
    //   month: parseInt(currentDateGMT7.split('-')[1]),
    //   day: parseInt(currentDateGMT7.split('-')[2])
    // };
    // this.toDate = {
    //   year: parseInt(currentDateGMT7.split('-')[0]),
    //   month: parseInt(currentDateGMT7.split('-')[1]),
    //   day: parseInt(currentDateGMT7.split('-')[2])
    // };
  }

  ngOnInit(): void {
    this.getListExpense();
  }


  billObject = {
    epoch: '',
    createDate: '',
    createBy: '',
    typeExpense: '',
    note: '',
    totalAmount: ''
  }

  totalBill: number = 0;

  listExpense: any;
  ex: any;
  listDisplayExpense: any[] = [];
  listFilterDate: any[] = [];

  getListExpense() {
    this.listFilterDate = [];
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const currentDate1 = parseInt(currentDateGMT7.split('-')[0]) + "-" + parseInt(currentDateGMT7.split('-')[1]) + "-" + (parseInt(currentDateGMT7.split('-')[2])) + " 00:00:00";
    const currentDate2 = parseInt(currentDateGMT7.split('-')[0]) + "-" + parseInt(currentDateGMT7.split('-')[1]) + "-" + parseInt(currentDateGMT7.split('-')[2]) + " 23:59:59";
    this.paidMaterialUsageService.getListExpenseNew(this.dateToTimestamp(currentDate1), this.dateToTimestamp(currentDate2)).subscribe((res) => {
      this.listExpense = res;
      const startIndex = this.listExpense.indexOf('[');
      const endIndex = this.listExpense.lastIndexOf(']') + 1;
      const itemsJson = this.listExpense.substring(startIndex, endIndex);
      console.log(JSON.parse(itemsJson));
      this.listExpense = JSON.parse(itemsJson);
      this.listExpense.forEach((item: any) => {
        const a = JSON.parse(item.expenses_attr.S);
        let expenseObject = {
          id: item.SK.S,
          epoch: item.SK.S.split('::')[0],
          createBy: a.createBy,
          createDate: this.timestampToDate(a.createDate),
          typeExpense: a.typeExpense,
          totalAmount: a.totalAmount,
          note: a.note
        }
        expenseObject.totalAmount = parseInt(expenseObject.totalAmount)
        try {
          this.totalBill += parseInt(expenseObject.totalAmount);
        } catch (e) {
        }
        this.listFilterDate.push(expenseObject);
      })
      console.log(this.listFilterDate);
    }, (error) => {
    })
  }

  organizeData(data: any[]): TimekeepingRecord[] {
    return data.map((item): TimekeepingRecord => {
      const timekeepingEntry: TimekeepingRecord = {
        epoch: item.epoch?.N,
        type: item.type?.S,
        records: []
      };

      Object.keys(item).forEach((key: string) => {
        if (key !== 'epoch' && key !== 'type') {
          const currentObject = JSON.parse(item[key]?.S);
          const details: TimekeepingDetail = {
            keyId: key,
            createBy: currentObject.createBy,
            createDate: this.timestampToDate(currentObject.createDate),
            typeExpense: currentObject.typeExpense,
            totalAmount: currentObject.totalAmount,
            note: currentObject.note,
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
  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
  openEditBill(bill: any) {
    this.billEdit = bill;
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteBill(epoch: any, createDate: any, id: any) {
    const formattedDate = this.datePipe.transform(createDate, 'dd-MM-yyyy');
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa phiếu chi ngày ${formattedDate} không?`).then((result) => {
      if (result) {
        this.paidMaterialUsageService.deletePaidMaterialUsageNew(id)
          .subscribe((res) => {
            this.toastr.success('Xoá phiếu chi thành công !');
            window.location.reload();
          },
            (error) => {
              this.toastr.success('Xoá phiếu chi thành công !');
              window.location.reload();
            }
          )
      }
    });
  }
  onChangeFromDate(event: any) {
    this.fromDate = event;
    const fromDateYear = this.fromDate.year;
    const fromDateMonth = this.fromDate.month.toString().padStart(2, '0');
    const fromDateDay = this.fromDate.day.toString().padStart(2, '0');
    const fromDate = `${fromDateYear}-${fromDateMonth}-${fromDateDay}`;
    this.startDate = fromDate
  }
  onChangeToDate(event: any) {
    this.toDate = event;
    const toDateYear = this.toDate.year;
    const toDateMonth = this.toDate.month.toString().padStart(2, '0');
    const toDateDay = this.toDate.day.toString().padStart(2, '0');
    const toDate = `${toDateYear}-${toDateMonth}-${toDateDay}`;
    this.endDate = toDate;
    this.listFilterDate = [];
    this.filterByDate(this.startDate, this.endDate);
  }

  filterByDate(fromDate: string, toDate: string) {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const currentDate = parseInt(currentDateGMT7.split('-')[0]) + "-" + parseInt(currentDateGMT7.split('-')[1]) + "-" + parseInt(currentDateGMT7.split('-')[2]);
    console.log("From date: ", fromDate);
    console.log("To date: ", toDate);
    if (fromDate == undefined && toDate != '') {
      const currentDate1 = toDate + " 00:00:00";
      this.paidMaterialUsageService.getListExpenseNew(this.dateToTimestamp(currentDate1), this.dateToTimestamp(toDate + " 23:59:59")).subscribe((res) => {
        this.listExpense = res;
        const startIndex = this.listExpense.indexOf('[');
        const endIndex = this.listExpense.lastIndexOf(']') + 1;
        const itemsJson = this.listExpense.substring(startIndex, endIndex);
        console.log(JSON.parse(itemsJson));
        this.listExpense = JSON.parse(itemsJson);
        this.listExpense.forEach((item: any) => {
          const a = JSON.parse(item.expenses_attr.S);
          let expenseObject = {
            id: item.SK.S,
            epoch: item.SK.S.split('::')[0],
            createBy: a.createBy,
            createDate: this.timestampToDate(a.createDate),
            typeExpense: a.typeExpense,
            totalAmount: a.totalAmount,
            note: a.note
          }
          expenseObject.totalAmount = parseInt(expenseObject.totalAmount)
          try {
            this.totalBill += parseInt(expenseObject.totalAmount);
          } catch (e) {
          }
          this.listFilterDate.push(expenseObject);
        })
        console.log(this.listFilterDate);
      }, (error) => {
      })
    } else if (fromDate != '' && toDate == undefined) {
      const currentDate2 = fromDate + " 23:59:59";
      this.paidMaterialUsageService.getListExpenseNew(this.dateToTimestamp(fromDate + " 00:00:00"), this.dateToTimestamp(currentDate2)).subscribe((res) => {
        this.listExpense = res;
        const startIndex = this.listExpense.indexOf('[');
        const endIndex = this.listExpense.lastIndexOf(']') + 1;
        const itemsJson = this.listExpense.substring(startIndex, endIndex);
        console.log(JSON.parse(itemsJson));
        this.listExpense = JSON.parse(itemsJson);
        this.listExpense.forEach((item: any) => {
          const a = JSON.parse(item.expenses_attr.S);
          let expenseObject = {
            id: item.SK.S,
            epoch: item.SK.S.split('::')[0],
            createBy: a.createBy,
            createDate: this.timestampToDate(a.createDate),
            typeExpense: a.typeExpense,
            totalAmount: a.totalAmount,
            note: a.note
          }
          expenseObject.totalAmount = parseInt(expenseObject.totalAmount)
          try {
            this.totalBill += parseInt(expenseObject.totalAmount);
          } catch (e) {
          }
          this.listFilterDate.push(expenseObject);
        })
        console.log(this.listFilterDate);
      }, (error) => {
      })
    } else if (fromDate != '' && toDate != '') {
      this.paidMaterialUsageService.getListExpenseNew(this.dateToTimestamp(fromDate + " 00:00:00"), this.dateToTimestamp(toDate + " 23:59:59")).subscribe((res) => {
        this.listExpense = res;
        const startIndex = this.listExpense.indexOf('[');
        const endIndex = this.listExpense.lastIndexOf(']') + 1;
        const itemsJson = this.listExpense.substring(startIndex, endIndex);
        console.log(JSON.parse(itemsJson));
        this.listExpense = JSON.parse(itemsJson);
        this.listExpense.forEach((item: any) => {
          const a = JSON.parse(item.expenses_attr.S);
          let expenseObject = {
            id: item.SK.S,
            epoch: item.SK.S.split('::')[0],
            createBy: a.createBy,
            createDate: this.timestampToDate(a.createDate),
            typeExpense: a.typeExpense,
            totalAmount: a.totalAmount,
            note: a.note
          }
          expenseObject.totalAmount = parseInt(expenseObject.totalAmount)
          try {
            this.totalBill += parseInt(expenseObject.totalAmount);
          } catch (e) {
          }
          this.listFilterDate.push(expenseObject);
        })
        console.log(this.listFilterDate);
      }, (error) => {
      })
    }
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
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

interface TimekeepingDetail {
  keyId?: string;
  createBy?: string;
  createDate?: string;
  typeExpense?: string;
  totalAmount?: string;
  note?: string;
}
