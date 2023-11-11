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
  loading:boolean = false;
  searchTerm: string = '';
  originalMedicalProcedureList: any[] = [];
  ngOnInit(): void {
     this.getMedicalProcedureGroupList();

  }
  getMedicalProcedureGroupList(){
    this.loading = true;
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe((res:any)=>{
      this.medicalProcedureGroups = res.data;
      if (Array.isArray(this.medicalProcedureGroups) && this.medicalProcedureGroups.length > 0) {
        // Lấy id của nhóm đầu tiên
        const firstGroupId = this.medicalProcedureGroups[0].medical_procedure_group_id;

        console.log(firstGroupId);

        // Gọi hàm để hiển thị danh sách thủ thuật của nhóm đầu tiên
        this.getMedicalProcedureList(firstGroupId);
      }
      this.loading = false;
      console.log(this.medicalProcedureGroups)
    })
  }
  deleteMedicalProcedureGroup(id:string) {
    console.log(id);
    const cf = confirm("Bạn có muốn xóa nhóm thủ thuật này không?");
    if (cf) {
      this.loading = true;
      this.medicalProcedureGroupService.deleteMedicalProcedureGroup(id).subscribe(data => {
          this.toastr.success('Xoá nhóm thủ thuật thành công !');
          const index = this.medicalProcedureGroups.findIndex((medicalGroup: any) => medicalGroup.medical_procedure_group_id === id);
          if (index !== -1) {
            this.medicalProcedureGroups.splice(index, 1);
          }
          this.loading = false;
        },
        error => {
        this.loading = false;
          this.toastr.error('Xoá nhóm thủ thuật thất bại!');
        }
      )
    }
  }

  deleteMedicalProcedure(id:string) {
    console.log(id);
    const cf = confirm("Bạn có muốn xóa thủ thuật này không?");
    if (cf) {
      this.loading = true;
      this.medicalProcedure.deleteMedicalProcedure(id).subscribe(data => {
          this.toastr.success('Xoá thủ thuật thành công !');
          const index = this.medicalProcedureList.findIndex((medicalG: any) => medicalG.mp_id === id);
          if (index !== -1) {
            this.medicalProcedureList.splice(index, 1);
          }
          this.loading = false;
        },
        error => {
        this.loading = false;
          this.toastr.error('Xoá  thủ thuật thất bại!');
        }
      )
    }
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

  getMedicalProcedureList(id:string, searchTerm?: string){
    this.loading = true;
    this.medicalProcedureGroupService.getMedicalProcedureList().subscribe(data=>{
      console.log(data);
      if (!searchTerm) {
        const firstGroupId = this.medicalProcedureGroups.length > 0 ? this.medicalProcedureGroups[0].medical_procedure_group_id : '';
        this.medicalProcedureList = data.data.filter((item:any) => item.mg_id === (id || firstGroupId));
      }
      else {
        this.medicalProcedureList = data.data.filter((item:any) => item.mp_name.toLowerCase().includes(searchTerm.toLowerCase()));

      }
      //this.medicalProcedureList = data.data.filter((item:any) => item.mg_id === id);
      this.loading = false;
      console.log(this.medicalProcedureList)
    })
  }
  onSearchInputChange(): void {
    // Gọi hàm để hiển thị danh sách thủ thuật dựa trên điều kiện tìm kiếm
    const firstGroupId = this.medicalProcedureGroups.length > 0 ? this.medicalProcedureGroups[0].medical_procedure_group_id : '';
    this.getMedicalProcedureList(firstGroupId, this.searchTerm);
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

}
