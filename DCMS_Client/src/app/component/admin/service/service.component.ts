import { Component, OnInit } from '@angular/core';
import {MedicalProcedureGroupService} from "../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";
import {MedicalProcedureService} from "../../../service/MedicalProcedureService/medical-procedure.service";
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  medicalProcedureGroups:any;
  medicalProcedureList:any;
  serviceGroupId:any;
  constructor(private medicalProcedureGroupService:MedicalProcedureGroupService,
              private medicalProcedure:MedicalProcedureService,
              private cognitoService: CognitoService,
              private router: Router,
              private toastr: ToastrService) { }
  id:any;
  idService:any;
  service:any;
  name:any;
  description:any;
  ngOnInit(): void {
    this.getMedicalProcedureGroupList();
  }
  getMedicalProcedureGroupList(){
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      this.medicalProcedureGroups = res.data;
      console.log(this.medicalProcedureGroups)
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

  deleteMedicalProcedure(id:string){
    console.log(id);
    this.medicalProcedure.deleteMedicalProcedure(id).subscribe(data=>{
        this.toastr.success('Xoá thủ thuật thành công !');
        const index = this.medicalProcedureList.findIndex((medicalG:any) => medicalG.mp_id === id);
        if (index !== -1) {
          this.medicalProcedureList.splice(index, 1);
        }
      },
      error => {
        this.toastr.error('Xoá  thủ thuật thất bại!');
      }
    )
  }


  openEditGroupService(id:any,name:any,description:any){
    this.id = id;
    this.name = name;
    this.description = description
    console.log(this.name);
    console.log(this.id);
    console.log(this.description)
  }
  openEditService(id:any,service:any){
    this.idService = id;
    this.service = service;
  }

  getMedicalProcedureList(id:string){
    this.medicalProcedureGroupService.getMedicalProcedureList().subscribe(data=>{
      console.log(data);
      this.medicalProcedureList = data.data.filter((item:any) => item.mg_id === id);
      console.log(this.medicalProcedureList)
    })
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

}
