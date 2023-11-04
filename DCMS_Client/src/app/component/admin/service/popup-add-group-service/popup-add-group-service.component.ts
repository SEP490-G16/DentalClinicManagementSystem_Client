import {Component, Input, OnInit} from '@angular/core';
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-popup-add-group-service',
  templateUrl: './popup-add-group-service.component.html',
  styleUrls: ['./popup-add-group-service.component.css']
})
export class PopupAddGroupServiceComponent implements OnInit {
  @Input() medicalProcedureGroups:any;
  serviceGroup={
    serviceGroupName:'',
    description:''
  }
  serviceGroupBody={
    name:'',
    description:'',
  }
  isCheckName:boolean=false;
  constructor(private medicalProcedureGroupService: MedicalProcedureGroupService,
              private toastr:ToastrService) { }

  ngOnInit(): void {
  }
  addMedicalProcedureGroup(){
    if (!this.serviceGroup.serviceGroupName) {
      this.isCheckName = true;
      return;
    }
    this.serviceGroupBody={
      name: this.serviceGroup.serviceGroupName,
      description: this.serviceGroup.description
    }
    this.medicalProcedureGroupService.addMedicalProcedureGroup(this.serviceGroupBody).subscribe(data=>{
      this.toastr.success('Thêm mới thành công!')
      let ref = document.getElementById('cancel-medical');
      ref?.click();
      this.medicalProcedureGroups.unshift(this.serviceGroupBody);
      /*this.serviceGroupBody.isNew = true;
      this.serviceGroupBody.isPulsing = true;
      setTimeout(() => {
        this.serviceGroupBody.isPulsing = false;
        this.serviceGroupBody.isNew = false;
      }, 2000);*/
    },
      error => {
      this.toastr.error('Thêm mới thất bại!')
      })
  }
}
