import { SpecimensService } from './../../../service/SpecimensService/SpecimensService.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CognitoService } from 'src/app/service/cognito.service';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import * as moment from 'moment-timezone';
import { SpecimensRoot } from 'src/app/model/ISpecimens';
import { ToastrService } from 'ngx-toastr';
import { LaboService } from 'src/app/service/LaboService/Labo.service';
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
import { textChangeRangeIsUnchanged } from 'typescript';
@Component({
  selector: 'app-specimens',
  templateUrl: './specimens.component.html',
  styleUrls: ['./specimens.component.css']
})
export class SpecimensComponent implements OnInit {


  SpecimensRoot: SpecimensRoot;
  currentPage: number = 1;
  hasNextPage: boolean = false;

  labos: any[] = [];
  laboFilter: string = '0';
  orderFromDateFilter: string = '';
  orderToDateFilter: string = '';
  receivedFromDateFilter: string = '';
  receivedToDateFilter: string = '';
  useFromDateFilter: string = '';
  useToDateFilter: string = '';
  statusFilter: string = '0';

  SpecimensFilter = {
    ms_order_date: "",
    ms_received_date: "",
    ms_used_date: "",
  }

  filteredSpecimens: any[] = [];
  labo_id: any = "";
  status: any = "";
  loading: boolean = false;

  pagingSearch = {
    paging: 1,
    total: 0
  }
  count: number = 1;

  constructor(
    private SpecimensService: SpecimensService,
    private laboService: LaboService,
    private cognitoService: CognitoService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {
    this.SpecimensRoot = {
      message: '',
      data: []
    };
  }

  ngOnInit(): void {
    this.getAllLabo();
    this.getAllSpecimens(this.currentPage);
  }

  getAllLabo() {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.laboService.apiUrl + "/labo", error);
      }
    )
  }

  filterByLabo() {
    this.laboFilter = this.labo_id;
    this.filterSpecimenInSystem(this.laboFilter, this.orderFromDateFilter, this.orderToDateFilter, this.receivedFromDateFilter, this.receivedToDateFilter, this.useFromDateFilter, this.useToDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterStatus() {
    this.statusFilter = this.status;
    this.filterSpecimenInSystem(this.laboFilter, this.orderFromDateFilter, this.orderToDateFilter, this.receivedFromDateFilter, this.receivedToDateFilter, this.useFromDateFilter, this.useToDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  convertIndoDatetoVnDate(dt: any):any {
    const date = new Date(dt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatdate = `${year}-${month}-${day}`;
    return formatdate
  }


  filterByOrderDate(order: any) {
    var order_date_start = this.convertToVietnamTime(order[0].toString());
    const order_from_date = this.convertIndoDatetoVnDate(order_date_start);
    this.orderFromDateFilter = this.dateToTimestamp(order_from_date +" 00:00:00")+"";
    var order_date_end = this.convertToVietnamTime(order[1].toString());
    const order_to_date = this.convertIndoDatetoVnDate(order_date_end)
    this.orderToDateFilter = this.dateToTimestamp(order_to_date+ " 23:59:59")+""
    this.filterSpecimenInSystem(this.laboFilter, this.orderFromDateFilter, this.orderToDateFilter, this.receivedFromDateFilter, this.receivedToDateFilter, this.useFromDateFilter, this.useToDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterByReceivedDate(received: string) {
    var received_date_start = this.convertToVietnamTime(received[0].toString());
    const received_from_date = this.convertIndoDatetoVnDate(received_date_start);
    this.receivedFromDateFilter = this.dateToTimestamp(received_from_date +" 00:00:00")+"";
    var received_date_end = this.convertToVietnamTime(received[1].toString());
    const received_to_date = this.convertIndoDatetoVnDate(received_date_end)
    this.receivedToDateFilter = this.dateToTimestamp(received_to_date+ " 23:59:59")+""
    this.filterSpecimenInSystem(this.laboFilter, this.orderFromDateFilter, this.orderToDateFilter, this.receivedFromDateFilter, this.receivedToDateFilter, this.useFromDateFilter, this.useToDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterByUseDate(useD: string) {
    var useD_date_start = this.convertToVietnamTime(useD[0].toString());
    const useD_from_date = this.convertIndoDatetoVnDate(useD_date_start);
    this.useFromDateFilter = this.dateToTimestamp(useD_from_date +" 00:00:00")+"";
    var useD_date_end = this.convertToVietnamTime(useD[1].toString());
    const received_to_date = this.convertIndoDatetoVnDate(useD_date_end)
    this.useToDateFilter = this.dateToTimestamp(received_to_date+ " 23:59:59")+""
    this.filterSpecimenInSystem(this.laboFilter, this.orderFromDateFilter, this.orderToDateFilter, this.receivedFromDateFilter, this.receivedToDateFilter, this.useFromDateFilter, this.useToDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterSpecimenInSystem(laboId: string, orderFromDate: string, orderToDate: string, receivedFromDate: string, receivedToDate:string, useFromDate: string, useToDate: string, statusId: string, paging: number) {
    var querySearch = "";
    if (parseInt(laboId) != 0) {
      querySearch = `&labo_id=${laboId}`;
    } else {
      querySearch = `&labo_id=`;
    }
    if (parseInt(statusId) != 0) {
      querySearch += `&status=${statusId}`;
    } else {
      querySearch += `&status=`;
    }
    if (orderFromDate != '') {
      querySearch += `&order_date_start=${orderFromDate}`;
    } else {
      querySearch += `&order_date_start=`;
    }

    if (orderToDate != '') {
      querySearch += `&order_date_end=${orderToDate}`;
    } else {
      querySearch += `&order_date_end=`;
    }

    if (receivedFromDate != '') {
      querySearch += `&received_date_start=${receivedFromDate}`;
    } else {
      querySearch += `&received_date_start=`;
    }

    if(receivedToDate != '') {
      querySearch += `&received_date_end=${receivedToDate}`;
    } else {
      querySearch += `&received_date_end=`;
    }

    if (useFromDate != '') {
      querySearch += `&used_date_start=${useFromDate}`;
    } else {
      querySearch += `&used_date_start=`;
    }

    if (useToDate != '') {
      querySearch += `&used_date_end=${useToDate}`;
    } else {
      querySearch += `&used_date_end=`;
    }
    this.filteredSpecimens.splice(0, this.filteredSpecimens.length);
    this.SpecimensService.filterSpecimens(querySearch, paging).subscribe((sRoot) => {
      console.log("check sRoot", sRoot.data)
      sRoot.data.forEach((item: any) => {
        if (item.status != 1) {
        this.specimenObject.ms_id = item.medical_supply_id;
        this.specimenObject.ms_name = item.name;
        this.specimenObject.ms_type = item.type;
        this.specimenObject.ms_quantity = item.quantity;
        this.specimenObject.ms_unit_price = item.unit_price;
        this.specimenObject.lb_id = item.labo_id;
        this.specimenObject.lb_name = '';
        this.specimenObject.ms_status = item.status;
        this.specimenObject.ms_order_date = item.order_date;
        this.specimenObject.ms_used_date = item.used_date;
        this.specimenObject.ms_orderer = item.orderer;
        this.specimenObject.ms_received_date = item.received_date;
        this.specimenObject.ms_receiver = item.receiver;
        this.specimenObject.ms_warranty = item.warranty;
        this.filteredSpecimens.push(this.specimenObject);
        this.specimenObject = {
          ms_id: '',
          ms_name: '',
          ms_type: '',
          ms_quantity: '',
          ms_unit_price: '',
          lb_id: '',
          lb_name: '',
          ms_status: 0,
          ms_order_date: '',
          ms_used_date: '',
          ms_orderer: '',
          ms_received_date: '',
          ms_receiver: '',
          ms_warranty: '',
          p_patient_id: '',
          p_patient_name: ''
        }
        this.laboName = '';
        this.checkNextPage();
        if (this.filteredSpecimens.length > 10) {
          this.filteredSpecimens.pop();
        }
        }
      })
      console.log("Check Filter", this.filteredSpecimens);
      this.loading = false;
    })
  }

  specimenObject = {
    ms_id: '',
    ms_name: '',
    ms_type: '',
    ms_quantity: '',
    ms_unit_price: '',
    lb_id: '',
    lb_name: '',
    ms_status: 0,
    ms_order_date: '',
    ms_used_date: '',
    ms_orderer: '',
    ms_received_date: '',
    ms_receiver: '',
    ms_warranty: '',
    p_patient_id: '',
    p_patient_name: ''
  }

  laboName: string = '';

  checkNextPage() {
    this.hasNextPage = this.filteredSpecimens.length > 10;
  }
  getAllSpecimens(paging: number) {
    this.labo_id = '';
    this.SpecimensFilter.ms_order_date = '';
    this.SpecimensFilter.ms_received_date = '';
    this.SpecimensFilter.ms_used_date = '';
    this.status = "";
    this.loading = true;
    this.currentPage = paging;
    this.filteredSpecimens = []
    this.SpecimensService.getSpecimens(paging)
      .subscribe((sRoot) => {
        sRoot.data.forEach((item: any) => {
          this.specimenObject.ms_id = item.ms_id;
          this.specimenObject.ms_name = item.ms_name;
          this.specimenObject.ms_type = item.ms_type;
          this.specimenObject.ms_quantity = item.ms_quantity;
          this.specimenObject.ms_unit_price = item.ms_unit_price;
          this.specimenObject.lb_id = item.lb_id;
          this.specimenObject.lb_name = item.lb_name;
          this.specimenObject.ms_status = item.ms_status;
          this.specimenObject.ms_order_date = item.ms_order_date;
          this.specimenObject.ms_used_date = item.ms_used_date;
          this.specimenObject.ms_orderer = item.ms_orderer;
          this.specimenObject.ms_received_date = item.ms_received_date;
          this.specimenObject.ms_receiver = item.ms_receiver;
          this.specimenObject.ms_warranty = item.ms_warranty;
          this.specimenObject.p_patient_id = item.p_patient_id;
          this.specimenObject.p_patient_name = item.p_patient_name;
          this.filteredSpecimens.push(this.specimenObject);
          this.specimenObject = {
            ms_id: '',
            ms_name: '',
            ms_type: '',
            ms_quantity: '',
            ms_unit_price: '',
            lb_id: '',
            lb_name: '',
            ms_status: 0,
            ms_order_date: '',
            ms_used_date: '',
            ms_orderer: '',
            ms_received_date: '',
            ms_receiver: '',
            ms_warranty: '',
            p_patient_id: '',
            p_patient_name: ''
          }
          this.laboName = '';
          this.checkNextPage();
          if (this.filteredSpecimens.length > 10) {
            this.filteredSpecimens.pop();
          }
        })
        this.loading = false;
      },
        // ResponseHandler.HANDLE_HTTP_STATUS("abc",401)
        error => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.SpecimensService.apiUrl + "/medical-supply/status/" + 2 + "/" + paging, error);
        }
      )
  }

  AllLabos: any;
  PutSpecimen: any;
  openEditSpecimen(specimens: any) {
    this.PutSpecimen = specimens;
    this.AllLabos = this.labos;
  }

  clicked: boolean = false;
  lastClickTime: number = 0
  pageChanged(event: number) {
    const currentTime = new Date().getTime();
    if (!this.clicked || (currentTime - this.lastClickTime >= 600)) {
      this.clicked = true;
      this.lastClickTime = currentTime;

      if (event >= 1) {
        this.getAllSpecimens(event);
      }
    }
  }

  showPopup: boolean = false;
  checkbox1: boolean = true;
  checkbox2: boolean = true;
  checkbox3: boolean = true;
  checkbox4: boolean = true;
  checkbox5: boolean = true;
  checkbox6: boolean = true;
  checkbox7: boolean = true;
  checkbox8: boolean = true;
  checkbox9: boolean = true;
  checkbox10: boolean = true;
  checkbox11: boolean = true;
  checkbox12: boolean = true;


  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }
  hiddenPopup():void{
    this.showPopup = false;
  }

  toggleColumn(columnNumber: number): void {
    if (columnNumber === 2) {
      this.checkbox1 = !this.checkbox1;
    }
    if (columnNumber === 3) {
      this.checkbox2 = !this.checkbox2;
    }
    if (columnNumber === 4) {
      this.checkbox3 = !this.checkbox3;
    }
    if (columnNumber === 5) {
      this.checkbox4 = !this.checkbox4;
    }
    if (columnNumber === 6) {
      this.checkbox5 = !this.checkbox5;
    }
    if (columnNumber === 7) {
      this.checkbox6 = !this.checkbox6;
    }
    if (columnNumber === 8) {
      this.checkbox7 = !this.checkbox7;
    }
    if (columnNumber === 9) {
      this.checkbox8 = !this.checkbox8;
    }
    if (columnNumber === 10) {
      this.checkbox9 = !this.checkbox9;
    }
    if (columnNumber === 11) {
      this.checkbox10 = !this.checkbox10;
    }
    if (columnNumber === 12) {
      this.checkbox11 = !this.checkbox11;
    }
    if (columnNumber === 13) {
      this.checkbox12 = !this.checkbox12;
    }
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  deleteSpecimens(id: string, ms_name:string) {
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa mẫu ${ms_name} không?`).then((result) => {
      if (result) {
        this.loading = true;
        this.SpecimensService.deleteSpecimens(id)
          .subscribe((res) => {
            this.loading = false;
            this.showSuccessToast('Xóa mẫu vật thành công');
            this.getAllSpecimens(this.currentPage);
          },
            (error) => {
              this.loading = false;
              //this.showErrorToast('Xóa mẫu vật thất bại');
              ResponseHandler.HANDLE_HTTP_STATUS(this.SpecimensService.apiUrl + "/medical-supply/" + id, error);
            }
          )
      }
    });
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }


  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm';
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }


  showColumnSelector = false;



  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000,
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000,
    });
  }

  convertToVietnamTime(timeString: string): any {
    const timeValue = timeString.split('(')[0].trim();
    const datetimeObject = new Date(timeValue);
    const vietnamTimezone = 7;
    const vietnamTime = new Date(datetimeObject.getTime() + vietnamTimezone * 60 * 60 * 1000);
    return vietnamTime;
  }

}
