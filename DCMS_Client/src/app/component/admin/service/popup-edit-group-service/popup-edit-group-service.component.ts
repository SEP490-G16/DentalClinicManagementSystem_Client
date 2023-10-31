import {Component, Input, OnInit} from '@angular/core';
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-edit-group-service',
  templateUrl: './popup-edit-group-service.component.html',
  styleUrls: ['./popup-edit-group-service.component.css']
})
export class PopupEditGroupServiceComponent implements OnInit {
  @Input() id:any;
  constructor(private medicalProcedureGroupService: MedicalProcedureGroupService,
              private toastr:ToastrService) { }
  serviceGroup={
    serviceGroupName:'',
    description:''
  }
  serviceGroupBody={
    name:'',
    description:''
  }
  ngOnInit(): void {
  }
  updateServiceGroup(){
    this.serviceGroupBody={
      name: this.serviceGroup.serviceGroupName,
      description: this.serviceGroup.description
    }
    this.medicalProcedureGroupService.updateMedicalProcedureGroup(this.serviceGroupBody, this.id).subscribe(data=>{
      this.toastr.success('Cập nhật nhóm thủ thuật thành công!');
        let ref = document.getElementById('cancel');
        ref?.click();
        window.location.reload();
    },
      error => {
      this.toastr.error('Cập nhật nhóm thủ thuật thất bại!');
      })
  }

}
