import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MedicalProcedureService} from "../../../../service/MedicalProcedureService/medical-procedure.service";
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-edit-service',
  templateUrl: './popup-edit-service.component.html',
  styleUrls: ['./popup-edit-service.component.css']
})
export class PopupEditServiceComponent implements OnChanges {
  @Input() id:any;
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
  validateService={
    serviceName:'',
    price:'',
    serviceGroupName:'',
  }
  isSubmitted:boolean = false;
  medicalProcedureGroups:any;
  constructor(private medicalProcedureService: MedicalProcedureService,
              private medicalProcedureGroupService:MedicalProcedureGroupService,
              private toastr:ToastrService) { }

  ngOnInit(): void {
    this.getMedicalProcedureGroupList();
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']){
      this.getMedicalProcedure(this.id);
    }
  }
  private getMedicalProcedure(id:any){
    this.medicalProcedureService.getMedicalProcedure(id).subscribe(data=>{
      this.service.serviceName = data.data.name;
      this.service.price = data.data.price;
      this.service.serviceGroupName = data.data.medical_procedure_group_id;
      this.service.description = data.data.mp_description;
      const matchingGroup = this.medicalProcedureGroups.find((group:any) => group.medical_procedure_group_id === data.data.medical_procedure_group_id);
      if (matchingGroup) {
        this.service.serviceGroupName = matchingGroup.medical_procedure_group_id;
      }
      console.log(this.service);
    })
  }
  getMedicalProcedureGroupList(){
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      console.log(res);
      this.medicalProcedureGroups = res.data;
    })
  }
  updateMedicalProcedure(){
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
    this.medicalProcedureService.updateMedicalProcedure(this.id, this.serviceBody).subscribe(data=>{
      this.toastr.success('Cập nhật thủ thuật thành công');
        let ref = document.getElementById('cancel-service');
        ref?.click();
        window.location.reload();
    },
      error => {
      this.toastr.error('Cập nhật thủ thuật thất bại!');
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
