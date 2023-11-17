import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MedicalProcedureService} from "../../../../../service/MedicalProcedureService/medical-procedure.service";
import {
  MedicalProcedureGroupService
} from "../../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-edit-service',
  templateUrl: './popup-edit-service.component.html',
  styleUrls: ['./popup-edit-service.component.css']
})
export class PopupEditServiceComponent implements OnChanges {
  @Input() id:any;
  @Input() medicalProcedureGroups:any;
  @Input() serviceObject:any;
  @Input() medicalProcedureList:any;
  service={
    serviceName:'',
    description:'',
    price:'',
    serviceGroupName:'',
  }
  serviceBody={
    name:'',
    description:'',
    price:'',
    medical_procedure_group_id:'',
  }
  validateService={
    serviceName:'',
    price:'',
    serviceGroupName:'',
  }
  serviceRes = {
    mp_id: '',
    mp_name: '',
    mp_description: '',
    mg_name: '',
    mp_price: '',
  }
  isSubmitted:boolean = false;
  medicalProcedureGroupList:any;
  loading:boolean = false;
  constructor(private medicalProcedureService: MedicalProcedureService,
              private medicalProcedureGroupService:MedicalProcedureGroupService,
              private toastr:ToastrService) { }

  ngOnInit(): void {
    //this.getMedicalProcedureGroupList();
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  ngOnChanges(changes: SimpleChanges): void {
    /*if (changes['id']){
      this.getMedicalProcedure(this.id);
    }*/
    if (changes['medicalProcedureGroups']){
      this.medicalProcedureGroupList = this.medicalProcedureGroups;
    }
    if (changes['serviceObject']){
      this.service.serviceName = this.serviceObject.mp_name;
      this.service.price = this.serviceObject.mp_price;
      this.service.serviceGroupName = this.serviceObject.mg_id;
      this.service.description = this.serviceObject.mp_description;
      const matchingGroup = this.medicalProcedureGroups.find((group:any) => group.medical_procedure_group_id === this.serviceObject.mg_id);
      if (matchingGroup) {
        this.service.serviceGroupName = matchingGroup.medical_procedure_group_id;
        console.log(this.service.serviceGroupName)
      }
    }
  }
  /*private getMedicalProcedure(id:any){
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
  }*/
  /*getMedicalProcedureGroupList(){
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      console.log(res);
      this.medicalProcedureGroups = res.data;
    })
  }*/
  updateServiceRes(){
    this.serviceRes = {
      mp_id:'',
      mp_name: this.serviceBody.name,
      mp_description: this.serviceBody.description,
      mp_price: this.serviceBody.price,
      mg_name: ''
    }
    const selectedGroup = this.medicalProcedureGroupList.find((f:any) => f.medical_procedure_group_id === this.service.serviceGroupName);
    if (selectedGroup) {
      this.serviceRes.mg_name = selectedGroup.name;
    }
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
      description:this.service.description,
      price:this.service.price,
      medical_procedure_group_id: this.service.serviceGroupName
    }
    this.loading = true;
    this.medicalProcedureService.updateMedicalProcedure(this.id, this.serviceBody).subscribe(data=>{
      this.toastr.success('Cập nhật thủ thuật thành công');
        // let ref = document.getElementById('cancel-service');
        // ref?.click();
        window.location.reload();
        // this.updateServiceRes();
        // this.serviceRes.mp_id = this.id;
        // const index = this.medicalProcedureList.findIndex((service:any) => service.mp_id === this.id);
        // if (index !== -1) {
        //   this.medicalProcedureList[index] = this.serviceRes;
        // }
    },
      error => {
      this.loading = false;
      this.toastr.error('Cập nhật thủ thuật thất bại!');
      })
  }
   resetValidate(){
    this.validateService={
      serviceName:'',
      price:'',
      serviceGroupName:'',
    }
    this.isSubmitted = false;
  }
}
