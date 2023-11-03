import { SpecimensService } from './../../../service/SpecimensService/SpecimensService.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CognitoService } from 'src/app/service/cognito.service';

import * as moment from 'moment-timezone';
import { SpecimensRoot } from 'src/app/model/ISpecimens';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-specimens',
  templateUrl: './specimens.component.html',
  styleUrls: ['./specimens.component.css']
})
export class SpecimensComponent implements OnInit {

  SpecimensRoot: SpecimensRoot;

  paging: number = 1;

  laboFilter: any = null;

  SpecimensFilter = {
    ms_order_date: "",
    ms_received_date: "",
  }

  filteredSpecimens: any;
  labo_id: any = "";


  constructor(
    private SpecimensService: SpecimensService,
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
    this.getAllSpecimens();
    console.log(this.dateToTimestamp("2023-11-03 10:49:43"));
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
          return specimen.lb_id === parseInt(selectedLabo);
        }
      });
    }
  }



  getAllSpecimens() {
    this.SpecimensService.getSpecimens(this.paging)
      .subscribe((sRoot) => {
        this.SpecimensRoot = sRoot;
        this.filteredSpecimens = sRoot.data;
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

  showCheckboxes: boolean = false;
  onFilterMS() {
    this.showCheckboxes = !this.showCheckboxes;
  }

  // const orderDate = this.dateToTimestamp(this.SpecimensFilter.ms_order_date);
  // const receivedDate = this.dateToTimestamp(this.SpecimensFilter.ms_received_date);
  // console.log(orderDate)
  // console.log(receivedDate)

  // this.SpecimensService.filterSpecimens(orderDate, orderDate, receivedDate, this.paging)
  //   .subscribe((res) => {
  //     console.log(res);
  //   })

  PutSpecimen:any;
  openEditSpecimen(specimens:any) {
    this.PutSpecimen = specimens;
  }


  deleteSpecimens(id:string) {
    const cf = confirm("Bạn có muốn xóa mẫu vật này không?");
    if(cf) {
      this.SpecimensService.deleteSpecimens(id)
      .subscribe((res) => {
        this.showSuccessToast('Xóa mẫu vật thành công');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      (err) => {
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
