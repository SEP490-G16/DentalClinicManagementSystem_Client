import { Component, OnInit } from '@angular/core';
import {MedicalSupplyService} from "../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";

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
    order_date:'',
    orderer:'',
    received_date:'',
    receiver:'',
    facility_id:'',
    warranty:'',
    description:'',
    patient_id:'',
    status:'',

  }
  id:any
  approveSpecimens(id:any,medical:any){
    this.id = id;
    this.specimensBody={
      name:medical.ms_name,
      type:medical.ms_type,
      quantity:medical.ms_quantity,
      unit_price:medical.ms_unit_price,
      order_date:medical.ms_order_date,
      orderer:medical.ms_orderer,
      received_date:medical.ms_received_date,
      receiver:medical.ms_receiver,
      facility_id:medical.facility_id,
      warranty:medical.ms_warranty,
      description:medical.ms_description,
      patient_id:medical.p_patient_id,
      status:'2',
    }
    this.medicalSupplyService.approveSpecimens(this.id, this.specimensBody).subscribe(data=>{
      this.toastr.success('Duyệt mẫu thành công !');
        const index = this.approveSpecimensList.findIndex((medical:any) => medical.ms_id === this.id);
        if (index !== -1) {
          this.approveSpecimensList.splice(index, 1);
        }
    },
      error => {
      this.toastr.error('Duyệt mẫu thất bại !');
      }
    )
  }

  getApproveSpecimensList(status:any, paging:any){
    this.medicalSupplyService.getApproveSpecimensList(status, paging).subscribe(data=>{
      this.approveSpecimensList = data.data;
      console.log(this.approveSpecimensList);
    })
  }
}
