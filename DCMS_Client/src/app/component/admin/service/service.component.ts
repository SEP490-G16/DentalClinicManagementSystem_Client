import { Component, OnInit } from '@angular/core';
import {MedicalProcedureGroupService} from "../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  medicalProcedureGroups:any;
  constructor(private medicalProcedureGroupService:MedicalProcedureGroupService,
              private toastr: ToastrService) { }
  id:any;
  ngOnInit(): void {
    this.getMedicalProcedureGroupList();
  }
  getMedicalProcedureGroupList(){
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      console.log(res);
      this.medicalProcedureGroups = res.data;
    })
  }
  deleteMedicalProcedureGroup(id:string){
    console.log(id);
    this.medicalProcedureGroupService.deleteMedicalProcedureGroup(id).subscribe(data=>{
        this.toastr.success('Xoá nhóm thủ thuật thành công !');
        const index = this.medicalProcedureGroups.findIndex((medicalGroup:any) => medicalGroup.medical_procedure_group_id === id);
        if (index !== -1) {
          this.medicalProcedureGroups.splice(index, 1);
        }
      },
      error => {
        this.toastr.error('Xoá nhóm thủ thuật thất bại!');
      }
    )
  }
  openEditGroupService(id:any){
    this.id = id;
  }
}
