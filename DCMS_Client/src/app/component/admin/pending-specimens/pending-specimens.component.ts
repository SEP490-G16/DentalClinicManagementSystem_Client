import { Component, OnInit } from '@angular/core';
import {MedicalSupplyService} from "../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pending-specimens',
  templateUrl: './pending-specimens.component.html',
  styleUrls: ['./pending-specimens.component.css']
})
export class PendingSpecimensComponent implements OnInit {
  approveSpecimensList:any;
  constructor(private medicalSupplyService: MedicalSupplyService,
              private toastr: ToastrService) { }
  status:any;
  paging:any;
  specimen:any;
  ngOnInit(): void {
    this.status = 1;
    this.paging = 1;
    this.getApproveSpecimensList(this.status, this.paging);
  }

  specimensBody={
    name:'',
    type:'',
    quantity:'',
    unit_price:'',
    order_date: 0,
    orderer:'',
    received_date: 0,
    used_date: 0,
    receiver:'',
    facility_id:'',
    warranty:'',
    description:'',
    patient_id:'',
    labo_id: '',
    status:'',
  }
  id:any
  loading:boolean = false;
  approveSpecimens(id:any,medical:any){
    this.id = id;
    this.specimensBody={
      name:medical.ms_name,
      type:medical.ms_type,
      quantity:medical.ms_quantity,
      unit_price:medical.ms_unit_price,
      order_date: this.dateToTimestamp(medical.ms_order_date),
      orderer:medical.ms_orderer,
      received_date: this.dateToTimestamp(medical.ms_received_date),
      used_date: this.dateToTimestamp(medical.ms_used_date),
      receiver:medical.ms_receiver,
      facility_id:medical.facility_id,
      warranty:medical.ms_warranty,
      description:medical.ms_description,
      patient_id:medical.p_patient_id,
      labo_id: medical.lb_id,
      status:'2',
    }
    this.loading = true;
    this.medicalSupplyService.approveSpecimens(this.id, this.specimensBody).subscribe(data=>{
      this.toastr.success('Duyệt mẫu thành công !');
        const index = this.approveSpecimensList.findIndex((medical:any) => medical.ms_id === this.id);
        if (index !== -1) {
          this.approveSpecimensList.splice(index, 1);
        }
        this.loading = false;
    },
      error => {
      this.loading = false;
      this.toastr.error('Duyệt mẫu thất bại !');
      }
    )
  }

  getApproveSpecimensList(status:any, paging:any){
    this.loading = true;
    this.medicalSupplyService.getApproveSpecimensList(status, paging).subscribe(data=>{
      this.approveSpecimensList = data.data;
      this.loading = false;
      console.log(this.approveSpecimensList);
    })
  }
  deleteApproveSpecimens(id:string){
    console.log(id);
    const isConfirmed = window.confirm('Bạn có chắc muốn xoá mẫu này?');
    if (isConfirmed){
      this.loading = true;
      this.medicalSupplyService.deleteApproveSpecimens(id).subscribe(data=>{
          this.toastr.success('Xoá thủ thuật thành công !');
          const index = this.approveSpecimensList.findIndex((specimens:any) => specimens.ms_id === id);
          if (index !== -1) {
            this.approveSpecimensList.splice(index, 1);
          }
          this.loading = false;
        },
        error => {
        this.loading = false;
          this.toastr.error('Xoá  thủ thuật thất bại!');
        }
      )
    }

  }
  openEditApproveSpecimens(id:any, specimens:any){
    this.id = id;
    this.specimen = specimens;
    console.log(specimens);
    return;
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() /1000;
    return timestamp;
  }
}
