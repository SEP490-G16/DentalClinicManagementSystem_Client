import { Component, OnInit } from '@angular/core';
import { PaidMaterialUsageService } from 'src/app/service/PaidMaterialUsageService/paid-material-usage.service';
import { ToastrService } from 'ngx-toastr';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { error } from '@angular/compiler-cli/src/transformers/util';
import * as moment from 'moment-timezone';
import { IsThisSecondPipeModule } from 'ngx-date-fns';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import {DatePipe} from "@angular/common";
import {ResponseHandler} from "../../utils/libs/ResponseHandler";
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-expenditure',
  templateUrl: './report-expenditure.component.html',
  styleUrls: ['./report-expenditure.component.css']
})
export class ReportExpenditureComponent implements OnInit {

  billEdit:any;
  fromDate: string = '';
  toDate: string = '';
  endDate: any;
  constructor(private paidMaterialUsageService: PaidMaterialUsageService,
              private modalService: NgbModal,
              private datePipe: DatePipe, 
              private router: Router,
    private toastr: ToastrService) { }

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

  listExpense: any[] = [];
  ex:any;
  listDisplayExpense: any[] = [];
  listFilterDate: any[] = [];

  getListExpense() {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const currentDate1 = parseInt(currentDateGMT7.split('-')[0])+"-"+parseInt(currentDateGMT7.split('-')[1])+"-"+(parseInt(currentDateGMT7.split('-')[2]))+ " 00:00:00";
    const currentDate2 = parseInt(currentDateGMT7.split('-')[0])+"-"+parseInt(currentDateGMT7.split('-')[1])+"-"+parseInt(currentDateGMT7.split('-')[2])+ " 23:59:59" ;
    this.paidMaterialUsageService.getListExpense(this.dateToTimestamp(currentDate1).toString(), this.dateToTimestamp(currentDate2).toString()).subscribe((res) => {
      this.listExpense = res.Items;
      const itemsString = res.match(/Items=\[(.*?)\]/);
      console.log("Check organizeData",this.organizeData(JSON.parse(`[${itemsString[1]}]`)));
      if (itemsString && itemsString.length > 1) {
        this.listExpense = this.organizeData(JSON.parse(`[${itemsString[1]}]`));
        //console.log(this.listExpense);
        this.listExpense.forEach((item:any) => {
          item.records.forEach((it:any) => {
            let expenseObject = {
              id: it.details.keyId,
              epoch: item.epoch,
              createBy: it.details.createBy,
              createDate: it.details.createDate,
              typeExpense: it.details.typeExpense,
              totalAmount: it.details.totalAmount,
              note: it.details.note
            }
            expenseObject.totalAmount = parseInt(expenseObject.totalAmount)
            try {
              this.totalBill += parseInt(it.details.totalAmount);
            } catch(e) {

            }
            this.listFilterDate.push(expenseObject);
            
          })
        })
        console.log(this.listFilterDate);
      } else {
        console.error('Items not found in the JSON string.');
      }
    }, (error) => {
      this.router.navigate(["/bao-mat"]);
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
  openEditBill(bill:any) {
    this.billEdit = bill;
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteBill(epoch: any,createDate:any, id:any) {
    const formattedDate = this.datePipe.transform(createDate, 'dd-MM-yyyy');
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa phiếu chi ngày ${formattedDate} không?`).then((result) => {
      if (result) {
        this.paidMaterialUsageService.deletePaidMaterialUsage(epoch, id)
          .subscribe((res) => {
              this.toastr.success('Xoá phiếu chi thành công !');
              window.location.reload();
            },
            (error) => {
              this.showErrorToast("Xóa phiếu chi thất bại!");
            }
          )
      }
    });
  }

  onChangeFromDate(fromDate: any) {
    this.fromDate = fromDate;
    const noewFromDate = fromDate
    this.filterByDate(noewFromDate, this.endDate);
  }

  onChangeToDate(toDate:any) {
    this.endDate = toDate;
    this.filterByDate(this.fromDate, this.endDate);
  }

  filterByDate(fromDate: string, toDate:string) {
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const currentDate = parseInt(currentDateGMT7.split('-')[0])+"-"+parseInt(currentDateGMT7.split('-')[1])+"-"+parseInt(currentDateGMT7.split('-')[2]);
    console.log("From date: ",fromDate);
    console.log("To date: ", toDate);
    if (fromDate == undefined && toDate != '') {
      const currentDate1 = toDate+" 00:00:00";
      this.paidMaterialUsageService.getListExpense(this.dateToTimestamp(currentDate1).toString(), this.dateToTimestamp(toDate+" 23:59:59").toString()).subscribe((res) => {
        this.listExpense = res.Items;
        const itemsString = res.match(/Items=\[(.*?)\]/);
        if (itemsString && itemsString.length > 1) {
          this.listExpense = JSON.parse(`[${itemsString[1]}]`);
        }
      })
    } else if (fromDate != '' && toDate == undefined) {
      const currentDate2 = fromDate+" 23:59:59";
      this.paidMaterialUsageService.getListExpense(this.dateToTimestamp(fromDate+" 00:00:00").toString(), this.dateToTimestamp(currentDate2).toString()).subscribe((res) => {
        this.listExpense = res.Items;
        const itemsString = res.match(/Items=\[(.*?)\]/);
        if (itemsString && itemsString.length > 1) {
          this.listExpense = JSON.parse(`[${itemsString[1]}]`);
        }
      })
    } else if (fromDate != '' && toDate != undefined) {
      //const currentDate1 = currentDate + " 00:00:00";
      //const currentDate2 = currentDate +" 23:59:59";
      this.paidMaterialUsageService.getListExpense(this.dateToTimestamp(fromDate+" 00:00:00").toString(), this.dateToTimestamp(toDate+" 23:59:59").toString()).subscribe((res) => {
        this.listExpense = res.Items;
        const itemsString = res.match(/Items=\[(.*?)\]/);
        if (itemsString && itemsString.length > 1) {
          this.listExpense = JSON.parse(`[${itemsString[1]}]`);
        }
      })
    }

    this.listExpense.forEach((item:any) => {
      console.log(ConvertJson.formatAndParse(item.expenses.S));
      this.ex = ConvertJson.formatAndParse(item.expenses.S);
      this.billObject = {
        epoch: item.epoch.N,
        createDate: this.timestampToDate(this.ex.createDate),
        createBy: this.ex.createBy,
        typeExpense: this.ex.typeExpense,
        note: this.ex.note,
        totalAmount: this.ex.totalAmount
      }
      this.totalBill += parseInt(this.ex.totalAmount);
      this.listDisplayExpense.push(this.billObject);
      this.billObject = {
        epoch: '',
        createDate: '',
        createBy: '',
        typeExpense: '',
        note: '',
        totalAmount: ''
      }
    })
    this.listFilterDate = this.listDisplayExpense;
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
  keyId?:string;
  createBy?: string;
  createDate?: string;
  typeExpense?: string;
  totalAmount?:string;
  note?:string;
}
