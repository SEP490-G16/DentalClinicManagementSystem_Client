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
  validateService={
    serviceName:'',
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
  isSubmitted:boolean = false;
  constructor(private medicalProcedureService:MedicalProcedureService,
              private toastr: ToastrService,
              private medicalProcedureGroupService:MedicalProcedureGroupService) { }

  ngOnInit(): void {
    this.getMedicalProcedureGroupList();
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  addMedicalProcedure(){
    this.resetValidate();
    if (!this.service.serviceGroupName){
      this.validateService.serviceGroupName = "Vui lòng chọn nhóm thủ thuật!"
      this.isSubmitted = true;
    }
    if (!this.service.serviceName){
      this.validateService.serviceName = "Vui lòng nhập tên thủ thuật!"
      this.isSubmitted = true
    }
    if (!this.service.price){
      this.validateService.price = "Vui lòng nhập đơn giá"
      this.isSubmitted = true;
    }
    else if (!this.checkNumber(this.service.price)){
      this.validateService.price = "Đơn giá là số dương!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
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
  private resetValidate(){
    this.validateService={
      serviceName:'',
      price:'',
      serviceGroupName:'',
    }
    this.isSubmitted = false;
  }
}
