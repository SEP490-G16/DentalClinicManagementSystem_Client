import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";
import {HttpResponse} from "@angular/common/http";
import {tap} from "rxjs";

@Component({
  selector: 'app-popup-edit-group-service',
  templateUrl: './popup-edit-group-service.component.html',
  styleUrls: ['./popup-edit-group-service.component.css']
})
export class PopupEditGroupServiceComponent implements OnChanges {
  @Input() id:any;
  @Input() name:any;
  @Input() description:any;
  @Input() medicalProcedureGroups:any;
  serviceGroup={
    serviceGroupName: '',
    description: ''
  }
  isCheckName:boolean=false;
  constructor(private medicalProcedureGroupService: MedicalProcedureGroupService,
              private toastr:ToastrService) {
  }

  serviceGroupBody={
    medical_procedure_group_id:'',
    name:'',
    description:''
  }
  validate={
    serviceGroupName:''
  }
  loading:boolean = false;
  ngOnInit(): void {
    /*this.serviceGroup={
      serviceGroupName: this.name,
      description: this.description
    }*/
  }

  updateServiceGroup(){
    this.resetValidate();
    if (!this.serviceGroup.serviceGroupName) {
      this.validate.serviceGroupName = 'Tên nhóm thủ thuật không được bỏ trống!'
      this.isCheckName = true;
    }
    if (this.isCheckName){
      return;
    }
    this.serviceGroupBody={
      medical_procedure_group_id:'',
      name: this.serviceGroup.serviceGroupName,
      description: this.serviceGroup.description
    }
    this.loading = true;
     this.medicalProcedureGroupService.updateMedicalProcedureGroup(this.serviceGroupBody, this.id).subscribe(data=>{
       console.log(data);
       this.toastr.success('Cập nhật nhóm thủ thuật thành công!');
        /*let ref = document.getElementById('cancel');
         ref?.click();*/
        window.location.reload();
         /*this.serviceGroupBody.medical_procedure_group_id = this.id;
         const index = this.medicalProcedureGroups.findIndex((serviceGroup:any) => serviceGroup.medical_procedure_group_id === this.id);
         if (index !== -1) {
           this.medicalProcedureGroups[index] = this.serviceGroupBody;
         }*/
     },
       error => {

           this.toastr.error('Cập nhật nhóm thủ thuật thất bại!');

       })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["description"]){
      this.serviceGroup.description = this.description;
    }
    if(changes["name"]){
      this.serviceGroup.serviceGroupName = this.name;
    }
  }
  resetValidate(){
    this.validate={
      serviceGroupName: ''
    }
    this.isCheckName = false;
  }
}
