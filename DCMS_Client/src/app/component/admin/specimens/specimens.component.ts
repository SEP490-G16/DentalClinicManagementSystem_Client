import { SpecimensService } from './../../../service/SpecimensService/SpecimensService.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CognitoService } from 'src/app/service/cognito.service';

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

  paging: number = 1;

  labos:any;
  laboFilter: any = null;

  SpecimensFilter = {
    ms_order_date: "",
    ms_received_date: "",
  }

  filteredSpecimens: any;
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
      console.log("Get all Labo: ", this.labos);
    })
  }

  filterByLabo() {
    let selectedLabo = this.labo_id;
    if (selectedLabo === '') {
      this.filteredSpecimens = this.SpecimensRoot.data;
    } else {
      this.filteredSpecimens = this.SpecimensRoot.data.filter(specimen => {
        if (selectedLabo === 'null') {
          return specimen.lb_id === null;
        } else {
          // console.log("specimen.lb_id: ", specimen.lb_id)
          // console.log("selected labo: ", typeof selectedLabo)
          return specimen.lb_id === selectedLabo;
        }
      });
    }
  }

  filterStatus() {
    let selectedStatus = this.status;
    if (selectedStatus === '') {
      this.filteredSpecimens = this.SpecimensRoot.data;
    } else {
      this.filteredSpecimens = this.SpecimensRoot.data.filter(specimen => {
        if (selectedStatus === 'null') {
          return specimen.ms_status === null;
        } else {
          return specimen.ms_status === parseInt(selectedStatus);
        }
      });
    }
  }

  getAllSpecimens(paging:number) {
    this.loading = true;
    this.SpecimensService.getSpecimens(paging)
      .subscribe((sRoot) => {
        this.SpecimensRoot = sRoot;
        this.filteredSpecimens = sRoot.data;
        if (this.filteredSpecimens.length < 11){
          this.pagingSearch.total+=this.filteredSpecimens.length;
        }
        else
        {
          this.pagingSearch.total=this.filteredSpecimens.length;
        }
        console.log(this.pagingSearch.total)
        console.log(this.filteredSpecimens)

        this.loading = false;
      })

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
    this.loading = true;
    this.SpecimensService.filterSpecimens(2, this.SpecimensFilter.ms_order_date, this.SpecimensFilter.ms_received_date, this.pagingSearch.paging)
      .subscribe((sRoot) => {
        this.SpecimensRoot = sRoot;
        this.filteredSpecimens = sRoot.data;
        if (this.filteredSpecimens.length < 11){
          this.pagingSearch.total+=this.filteredSpecimens.length;
        }
        else
        {
          this.pagingSearch.total=this.filteredSpecimens.length;
        }
        console.log(this.pagingSearch.total)
        console.log(this.filteredSpecimens)

        this.loading = false;
      })
  }

  AllLabos:any;
  PutSpecimen:any;
  openEditSpecimen(specimens:any) {
    this.PutSpecimen = specimens;
    this.AllLabos = this.labos;
  }

  pageChanged(event: number) {
    this.pagingSearch.paging = event;
    console.log(this.pagingSearch.paging)
    this.getAllSpecimens(this.pagingSearch.paging);
  }

  showPopup: boolean = false;
  checkbox1: boolean = false;
  checkbox2: boolean = false;
  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  toggleColumn(columnNumber: number): void {
    if (columnNumber === 12) {
      this.checkbox1 = !this.checkbox1;
    } else if (columnNumber === 13) {
      this.checkbox2 = !this.checkbox2;
    }
  }

  deleteSpecimens(id:string) {
    const cf = confirm("Bạn có muốn xóa mẫu vật này không?");
    if(cf) {
      this.loading = true;
      this.SpecimensService.deleteSpecimens(id)
      .subscribe((res) => {
        this.showSuccessToast('Xóa mẫu vật thành công');
        window.location.reload();
      },
      (err) => {
        this.loading = false;
        this.showErrorToast('Xóa mẫu vật thất bại');
      }
      )
    }
  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng cho chuỗi ngày đầu ra
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const dateStr = moment.tz(timestamp, timeZone).format(format);
    return dateStr;
  }


  timestampToTime(timestamp: number): string {
    const timeZone = 'Asia/Ho_Chi_Minh';
    const timeStr = moment.tz(timestamp, timeZone).format('HH:mm');
    return timeStr;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf();
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
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

}
