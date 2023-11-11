import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
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
export class PopupAddServiceComponent implements OnChanges {
  @Input() medicalProcedureList: any;
  @Input() medicalProcedureGroups: any;
  service = {
    serviceName: '',
    description: '',
    price: '',
    serviceGroupName: '',
  }
  validateService = {
    serviceName: '',
    price: '',
    serviceGroupName: '',
  }
  serviceBody = {
    name: '',
    description: '',
    price: '',
    medical_procedure_group_id: '',
  }
  serviceRes = {
    mp_id: '',
    mp_name: '',
    mp_description: '',
    mg_name: '',
    mp_price: '',
  }
  nameServiceGroup:string='';
  medicalProcedureGroupList:any;
  isSubmitted: boolean = false;
  loading:boolean = false;
  constructor(private medicalProcedureService: MedicalProcedureService,
              private toastr: ToastrService,
              private medicalProcedureGroupService: MedicalProcedureGroupService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
        if (changes['medicalProcedureGroups']){
          this.medicalProcedureGroupList = this.medicalProcedureGroups;
        }
  }

  ngOnInit(): void {
    //this.getMedicalProcedureGroupList();
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
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
      description:this.service.description,
      price:this.service.price,
      medical_procedure_group_id: this.service.serviceGroupName
    }
    this.loading = true;
    this.updateServiceRes();
    this.medicalProcedureService.addMedicalProcedure(this.serviceBody).subscribe(data=>{
      this.toastr.success('Thêm mới thành công !');
        /*let ref = document.getElementById('cancel-addService');
        ref?.click();
        this.loading = false;
        this.serviceRes.mp_id = data.data.medical_procedure_group_id;
        this.medicalProcedureList.unshift(this.serviceRes);*/
      window.location.reload();

    },
      error => {
      this.loading = false;
      this.toastr.error('Thêm mới thất bại !');
      })
  }
  /*getMedicalProcedureGroupList(){
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      console.log(res);
      this.medicalProcedureGroups = res.data;
    })
  }*/
  private resetValidate(){
    this.validateService={
      serviceName:'',
      price:'',
      serviceGroupName:'',
    }
    this.isSubmitted = false;
  }
}
