import { Component, OnInit } from '@angular/core';
import { MedicalProcedureGroupService } from "../../../service/MedicalProcedureService/medical-procedure-group.service";
import { ToastrService } from "ngx-toastr";
import { MedicalProcedureService } from "../../../service/MedicalProcedureService/medical-procedure.service";
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  mgData: any[] = [];
  filteredMgData: any[] = [];
  medicalProcedureList: any[] = [];
  constructor(private medicalProcedureGroupService: MedicalProcedureGroupService,
    private medicalProcedure: MedicalProcedureService,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService) { }
  id: any;
  idService: any;
  service: any;
  name: any;
  description: any;
  searchTerm: string = '';
  medicalProcedureItem = {
    mp_id: '',
    mp_name: '',
    mp_description: '',
    mp_price: '',
    mg_id: '',
    mg_name: ''
  }
  originalMedicalProcedureList: any[] = [];
  ngOnInit(): void {
    this.getMedicalProcedureList();
  }
  getMedicalProcedureList() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList().subscribe(data => {
      this.mgData = data.data.map((item: any) => {
        return {
          mg_id: item.mg_id,
          mg_name: item.mg_name,
          mg_description: item.mg_description,
          mp_id: item.mp_id,
          mp_name: item.mp_name,
          mp_description: item.mp_description,
          mp_price: item.mp_price
        };
      })
      const mgIdMap = new Map<string, { mg_name: string, mg_description: string }[]>();
      this.mgData.forEach((item) => {
        const mgId = item.mg_id;
        if (!mgIdMap.has(mgId)) {
          mgIdMap.set(mgId, item);
        }
      });
      this.filteredMgData = Array.from(mgIdMap.values());
      this.getMedicalProcedureChildren(this.filteredMgData[0].mg_id);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      }
    )
  }
  getMedicalProcedureChildren(id: any) {
    this.mgData.forEach(item => {
      if (item.mg_id == id) {
        this.medicalProcedureList.push(this.medicalProcedureItem)
      }
    })
    console.log(this.medicalProcedureList)
  }
  // deleteMedicalProcedureGroup(id: string) {
  //   console.log(id);
  //   const cf = confirm("Bạn có muốn xóa nhóm thủ thuật này không?");
  //   if (cf) {
  //     this.medicalProcedureGroupService.deleteMedicalProcedureGroup(id).subscribe(data => {
  //       this.toastr.success('Xoá nhóm thủ thuật thành công !');
  //       const index = this.medicalProcedureGroups.findIndex((medicalGroup: any) => medicalGroup.medical_procedure_group_id === id);
  //       if (index !== -1) {
  //         this.medicalProcedureGroups.splice(index, 1);
  //       }
  //     },
  //       error => {
  //         ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group/" + id, error);
  //       }
  //     )
  //   }
  // }

  // deleteMedicalProcedure(id: string) {
  //   console.log(id);
  //   const cf = confirm("Bạn có muốn xóa thủ thuật này không?");
  //   if (cf) {
  //     this.medicalProcedure.deleteMedicalProcedure(id).subscribe(data => {
  //       this.toastr.success('Xoá thủ thuật thành công !');
  //       const index = this.medicalProcedureList.findIndex((medicalG: any) => medicalG.mp_id === id);
  //       if (index !== -1) {
  //         this.medicalProcedureList.splice(index, 1);
  //       }
  //     },
  //       error => {
  //         ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedure.url + "/medical-procedure/" + id, error);
  //       }
  //     )
  //   }
  // }

  // openEditGroupService(id: any, name: any, description: any) {
  //   this.id = id;
  //   this.name = name;
  //   this.description = description
  //   console.log(this.name);
  //   console.log(this.id);
  //   console.log(this.description)
  // }
  // openEditService(id: any, service: any) {
  //   this.idService = id;
  //   this.service = service;
  // }

  // getMedicalProcedureList(id: string, searchTerm?: string) {
  //   this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList().subscribe(data => {
  //     console.log(data);
  //     if (!searchTerm) {
  //       const firstGroupId = this.medicalProcedureGroups.length > 0 ? this.medicalProcedureGroups[0].medical_procedure_group_id : '';
  //       this.medicalProcedureList = data.data.filter((item: any) => item.mg_id === (id || firstGroupId));
  //     }
  //     else {
  //       this.medicalProcedureList = data.data.filter((item: any) => item.mp_name.toLowerCase().includes(searchTerm.toLowerCase()));
  //     }
  //     console.log(this.medicalProcedureList)
  //   },
  //     error => {
  //       ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
  //     }
  //   )
  // }
  // onSearchInputChange(): void {
  //   const firstGroupId = this.medicalProcedureGroups.length > 0 ? this.medicalProcedureGroups[0].medical_procedure_group_id : '';
  //   //this.getMedicalProcedureList(firstGroupId, this.searchTerm);
  // }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

}
