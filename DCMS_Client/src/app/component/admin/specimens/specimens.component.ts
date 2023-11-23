import { SpecimensService } from './../../../service/SpecimensService/SpecimensService.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CognitoService } from 'src/app/service/cognito.service';
import {ResponseHandler} from "../../utils/libs/ResponseHandler";
import * as moment from 'moment-timezone';
import { SpecimensRoot } from 'src/app/model/ISpecimens';
import { ToastrService } from 'ngx-toastr';
import { LaboService } from 'src/app/service/LaboService/Labo.service';
@Component({
  selector: 'app-specimens',
  templateUrl: './specimens.component.html',
  styleUrls: ['./specimens.component.css']
})
export class SpecimensComponent implements OnInit {


  SpecimensRoot: SpecimensRoot;
  currentPage: number = 1;
  hasNextPage: boolean = false;

  labos:any[] = [];
  laboFilter: string = '0';
  orderDateFilter: string = '';
  receivedDateFilter: string = '';
  useDateFilter: string = '';
  statusFilter: string = '0';

  SpecimensFilter = {
    ms_order_date: "",
    ms_received_date: "",
  }

  filteredSpecimens: any[] = [];
  labo_id: any = "";
  status: any = "";
  loading:boolean=false;

  pagingSearch = {
    paging:1,
    total:0
  }
  count:number=1;

  constructor(
    private SpecimensService: SpecimensService,
    private laboService:LaboService,
    private cognitoService: CognitoService,
    private toastr:ToastrService,
    private router: Router
  ) {


    this.SpecimensRoot = {
      message: '',
      data: []
    };


    // this.filteredSpecimens = [
    //   {
    //     ms_id: "",
    //     ms_type: "",
    //     ms_name: "",
    //     ms_quantity: 0,
    //     ms_unit_price: 0,
    //     ms_order_date: "",
    //     ms_orderer: "",
    //     ms_received_date: "",
    //     ms_receiver: "",
    //     ms_warranty: "",
    //     ms_description: "",
    //     ms_status: 0,
    //     lb_id: "",
    //     facility_id: "",
    //     p_patient_id: "",
    //     p_patient_name: "",
    //   }
    // ]


  }

  ngOnInit(): void {
    this.getAllLabo();
    this.getAllSpecimens(this.pagingSearch.paging);
    // console.log(this.dateToTimestamp("2023-11-03 10:49:43"));
  }

  getAllLabo() {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
      console.log(this.labos);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.laboService.apiUrl+"/labo", error);
      }
      )
  }

  filterByLabo() {
    this.laboFilter = this.labo_id;
    this.filterSpecimenInSystem(this.laboFilter, this.orderDateFilter, this.receivedDateFilter, this.useDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterStatus() {
    this.statusFilter = this.status;
    this.filterSpecimenInSystem(this.laboFilter, this.orderDateFilter, this.receivedDateFilter, this.useDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterByOrderDate(order:string) {
    this.orderDateFilter = this.dateToTimestamp(order).toString();
    this.filterSpecimenInSystem(this.laboFilter, this.orderDateFilter, this.receivedDateFilter, this.useDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterByReceivedDate(received:string) {
    this.receivedDateFilter = this.dateToTimestamp(received).toString();
    this.filterSpecimenInSystem(this.laboFilter, this.orderDateFilter, this.receivedDateFilter, this.useDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterByUseDate(useD:string) {
    this.useDateFilter = this.dateToTimestamp(useD).toString();
    this.filterSpecimenInSystem(this.laboFilter, this.orderDateFilter, this.receivedDateFilter, this.useDateFilter, this.statusFilter, this.pagingSearch.paging);
  }

  filterSpecimenInSystem(laboId:string, orderDate: string, receivedDate: string, useDate: string, statusId: string, paging:number) {
    var querySearch = `labo_id${laboId}?status=${statusId}`
    if (orderDate != '') {
       querySearch += `?order_date_start=${orderDate}`;
    }

    if (receivedDate != '') {
      querySearch += `?order_date_start=${receivedDate}`;
    }

    if (useDate != '') {
      querySearch += `?order_date_start=${useDate}`;
    }

    this.SpecimensService.filterSpecimens(querySearch, paging).subscribe((sRoot) => {
      sRoot.data.forEach((item:any) => {
        this.specimenObject.ms_id = item.ms_id;
        this.specimenObject.ms_name = item.ms_name;
        this.specimenObject.ms_type = item.ms_type;
        this.specimenObject.ms_quantity = item.ms_quantity;
        this.specimenObject.ms_unit_price = item.ms_unit_price;
        this.specimenObject.lb_id = item.lb_id;
        this.specimenObject.lb_name = this.getLaboName(item.lb_id);
        this.specimenObject.ms_status = item.ms_status;
        this.specimenObject.ms_order_date = item.ms_order_date;
        this.specimenObject.ms_used_date = item.ms_used_date;
        this.specimenObject.ms_orderer = item.ms_orderer;
        this.specimenObject.ms_received_date = item.ms_received_date;
        this.specimenObject.ms_receiver = item.ms_receiver;
        this.specimenObject.ms_warranty = item.ms_warranty;
        this.filteredSpecimens.push(this.specimenObject);
        this.specimenObject = {
          ms_id:'',
    ms_name:'',
    ms_type: '',
    ms_quantity:'',
    ms_unit_price:'',
    lb_id: '',
    lb_name: '',
    ms_status: 0,
    ms_order_date: '',
    ms_used_date: '',
    ms_orderer: '',
    ms_received_date: '',
    ms_receiver: '',
    ms_warranty: '',
    p_patient_id:'',
    p_patient_name:''
        }
        this.laboName = '';
        this.checkNextPage();
      if (this.filteredSpecimens.length > 10) {
        this.filteredSpecimens.pop();
      }
      })
      this.loading = false;
    })
  }

  specimenObject = {
    ms_id:'',
    ms_name:'',
    ms_type: '',
    ms_quantity:'',
    ms_unit_price:'',
    lb_id: '',
    lb_name: '',
    ms_status: 0,
    ms_order_date: '',
    ms_used_date: '',
    ms_orderer: '',
    ms_received_date: '',
    ms_receiver: '',
    ms_warranty: '',
    p_patient_id:'',
    p_patient_name:''
  }

  laboName: string= '';
  //test nha
  getLaboName(item: any): any {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
      this.labos.forEach((lb: any) => {
        if (lb.labo_id === item) {
          this.laboName = lb.name;
        }
      })
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.laboService.apiUrl+"/labo", error);
      }
      )
    return this.laboName;
  }
  checkNextPage() {
    this.hasNextPage = this.filteredSpecimens.length > 10;
  }
  getAllSpecimens(paging:number) {
    this.loading = true;
    this.currentPage = paging;
    this.filteredSpecimens = [];
    console.log(paging);
    this.SpecimensService.getSpecimens(paging)
      .subscribe((sRoot) => {
        console.log("kjsbgkjws",sRoot.data);
        sRoot.data.forEach((item:any) => {
          this.specimenObject.ms_id = item.ms_id;
          this.specimenObject.ms_name = item.ms_name;
          this.specimenObject.ms_type = item.ms_type;
          this.specimenObject.ms_quantity = item.ms_quantity;
          this.specimenObject.ms_unit_price = item.ms_unit_price;
          this.specimenObject.lb_id = item.lb_id;
          this.specimenObject.lb_name = this.getLaboName(item.lb_id);
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
          ResponseHandler.HANDLE_HTTP_STATUS(this.SpecimensService.apiUrl+"/medical-supply/status/"+2+"/"+paging, error);
        }
      )

    // try {
    //   const sRoot = await this.SpecimensService.getSpecimensAsync(this.paging);
    //   this.SpecimensRoot = sRoot;
    //   this.filteredSpecimens = sRoot.data;
    //   console.log(this.filteredSpecimens);
    // } catch (error) {
    //   console.error('Lỗi khi gọi API:', error);
    // }
  }


  // const orderDate = this.dateToTimestamp(this.SpecimensFilter.ms_order_date);
  // const receivedDate = this.dateToTimestamp(this.SpecimensFilter.ms_received_date);
  // console.log(orderDate)
  // console.log(receivedDate)

  // this.SpecimensService.filterSpecimens(orderDate, orderDate, receivedDate, this.paging)
  //   .subscribe((res) => {
  //     console.log(res);
  //   })

  filterDate() {
    //this.loading = true;
    // this.SpecimensService.filterSpecimens(2, this.SpecimensFilter.ms_order_date, this.SpecimensFilter.ms_received_date, this.pagingSearch.paging)
    //   .subscribe((sRoot) => {
    //     this.SpecimensRoot = sRoot;
    //     this.filteredSpecimens = sRoot.data;
    //     if (this.filteredSpecimens.length < 11){
    //       this.pagingSearch.total+=this.filteredSpecimens.length;
    //     }
    //     else
    //     {
    //       this.pagingSearch.total=this.filteredSpecimens.length;
    //     }
    //     console.log(this.pagingSearch.total)
    //     console.log(this.filteredSpecimens)

    //     this.loading = false;
    //   })
  }

  AllLabos:any;
  PutSpecimen:any;
  openEditSpecimen(specimens:any) {
    this.PutSpecimen = specimens;
    this.AllLabos = this.labos;
  }

  pageChanged(event: number) {
    if (event >= 1) {
      this.getAllSpecimens(event);
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

  toggleColumn(columnNumber: number): void {
    if (columnNumber === 2) {
      this.checkbox1 = !this.checkbox1;
      console.log(this.checkbox1)
    }
    if (columnNumber === 3) {
      this.checkbox2 = !this.checkbox2;
    }
    if (columnNumber === 4){
      this.checkbox3 = !this.checkbox3;
    }
    if (columnNumber === 5){
      this.checkbox4 = !this.checkbox4;
    }
    if (columnNumber === 6){
      this.checkbox5 = !this.checkbox5;
    }
    if (columnNumber === 7){
      this.checkbox6 = !this.checkbox6;
    }
    if (columnNumber === 8){
      this.checkbox7 = !this.checkbox7;
    }
    if (columnNumber === 9){
      this.checkbox8 = !this.checkbox8;
    }
    if (columnNumber === 10){
      this.checkbox9 = !this.checkbox9;
    }
    if (columnNumber === 11){
      this.checkbox10 = !this.checkbox10;
    }
    if (columnNumber === 12){
      this.checkbox11 = !this.checkbox11;
    }console.log()
    if (columnNumber === 13){
      this.checkbox12 = !this.checkbox12;
    }
  }

  deleteSpecimens(id:string) {
    const cf = confirm("Bạn có muốn xóa mẫu vật này không?");
    if(cf) {
      this.loading = true;
      this.SpecimensService.deleteSpecimens(id)
      .subscribe((res) => {
        this.loading = false;
        this.showSuccessToast('Xóa mẫu vật thành công');
        window.location.reload();
      },
      (error) => {
        this.loading = false;
        //this.showErrorToast('Xóa mẫu vật thất bại');
        ResponseHandler.HANDLE_HTTP_STATUS(this.SpecimensService.apiUrl+"/medical-supply/"+id, error);
      }
      )
    }
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() /1000;
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
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }


  showColumnSelector = false; // Biến để kiểm soát việc hiển thị radio buttons



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
