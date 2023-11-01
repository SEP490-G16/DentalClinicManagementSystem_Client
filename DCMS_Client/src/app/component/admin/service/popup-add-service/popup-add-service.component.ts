import {Component, Input, OnInit} from '@angular/core';
import {MedicalProcedureService} from "../../../../service/MedicalProcedureService/medical-procedure.service";
import {ToastrService} from "ngx-toastr";
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";

@Component({
  selector: 'app-popup-add-service',
  templateUrl: './popup-add-service.component.html',
  styleUrls: ['./popup-add-service.component.css']
})
export class PopupAddServiceComponent implements OnInit {
  @Input() medicalProcedureList:any;
  service={
    serviceName:'',
    description:'',
    price:'',
    serviceGroupName:'',
  }
  serviceBody={
    name:'',
    mp_description:'',
    price:'',
    medical_procedure_group_id:'',
  }
  medicalProcedureGroups:any;
  isNotPositiveNumber: boolean = false;
  isCheckSelect:boolean = false;
  constructor(private medicalProcedureService:MedicalProcedureService,
              private toastr: ToastrService,
              private medicalProcedureGroupService:MedicalProcedureGroupService) { }

  ngOnInit(): void {
    this.getMedicalProcedureGroupList();
  }
  checkPositiveNumber() {
    const price = parseFloat(this.service.price);
    if (price <= 0 || isNaN(price)) {
      this.isNotPositiveNumber = true;
    } else {
      this.isNotPositiveNumber = false;
    }
  }
  addMedicalProcedure(){
    if (this.service.serviceGroupName == null){
      this.isCheckSelect = true;
    }
    this.serviceBody={
      name:this.service.serviceName,
      mp_description:this.service.description,
      price:this.service.price,
      medical_procedure_group_id: this.service.serviceGroupName
    }
    this.medicalProcedureService.addMedicalProcedure(this.serviceBody).subscribe(data=>{
      this.toastr.success('Thêm mới thành công !');
        this.medicalProcedureList.unshift(this.serviceBody);
    },
      error => {
      this.toastr.error('Thêm mới thất bại !');
      })
  }
  getMedicalProcedureGroupList(){
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      console.log(res);
      this.medicalProcedureGroups = res.data;
    })
  }
}
