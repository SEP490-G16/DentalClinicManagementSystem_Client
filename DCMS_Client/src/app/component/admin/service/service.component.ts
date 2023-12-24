import { Component, OnInit } from '@angular/core';
import { MedicalProcedureGroupService } from "../../../service/MedicalProcedureService/medical-procedure-group.service";
import { ToastrService } from "ngx-toastr";
import { MedicalProcedureService } from "../../../service/MedicalProcedureService/medical-procedure.service";
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  medicalProcedureGroups: any [] = [];
  filteredMgData: any[] = [];
  medicalProcedureList: any[] = [];
  constructor(private medicalProcedureGroupService: MedicalProcedureGroupService,
    private medicalProcedure: MedicalProcedureService,
    private cognitoService: CognitoService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService) { }
  id: any;
  idService: any;
  service: any;
  name: any;
  description: any;
  searchTerm: string = '';
  originalMedicalProcedureList: any[] = [];
  ngOnInit(): void {
    this.getMedicalProcedureList();
  }
  getMedicalProcedureList() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList().subscribe(data => {
      this.medicalProcedureGroups = data.data.map((item: any) => {
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
      this.medicalProcedureGroups.forEach((item: any) => {
        const mgId = item.mg_id;
        if (!mgIdMap.has(mgId)) {
          mgIdMap.set(mgId, item);
        }
      });
      this.filteredMgData = Array.from(mgIdMap.values());
      this.getMedicalProcedureChildren(this.filteredMgData[0].mg_id);
      console.log(this.filteredMgData);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      }
    )
  }
  activeGroupId: any = null;
  getMedicalProcedureChildren(id: any) {
    this.activeGroupId = id;
    this.medicalProcedureList = [];
    for (var i = 0; i < this.medicalProcedureGroups.length; i++) {
      if (this.searchTerm == "" || this.searchTerm == null || this.searchTerm == undefined) {
        if (id == null) {
          id = this.medicalProcedureGroups[0].mg_id;
        }
        if (this.medicalProcedureGroups[i].mg_id == id && this.medicalProcedureGroups[i].mp_id != null) {
          this.medicalProcedureList.push(this.medicalProcedureGroups[i]);
        }
      } else {
        if (this.medicalProcedureGroups[i].mp_name.includes(this.searchTerm.toLocaleLowerCase())) {
          this.medicalProcedureList.push(this.medicalProcedureGroups[i]);
        }
      }
    }
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteMedicalProcedureGroup(id: string, mg_name: string) {
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa nhóm thủ thuật ${mg_name} không?`).then((result) => {
      if (result) {
        this.medicalProcedureGroupService.deleteMedicalProcedureGroup(id)
          .subscribe((res) => {
            this.toastr.success('Xoá nhóm thủ thuật thành công !');
            const index = this.filteredMgData.findIndex((medicalGroup: any) => medicalGroup.mg_id === id);
            if (index !== -1) {
              this.filteredMgData.splice(index, 1);
            }
          },
            (error) => {
              //this.showErrorToast('Xóa mẫu vật thất bại');
              ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group/" + id, error);
            }
          )
      }
    });
  }

  deleteMedicalProcedure(id: string, mp_name: string) {
    console.log("procedure: ", this.filteredMgData);
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa thủ thuật ${mp_name} không?`).then((result) => {
      if (result) {
        this.medicalProcedure.deleteMedicalProcedure(id)
          .subscribe((res) => {
            this.toastr.success('Xoá thủ thuật thành công !');
            const index = this.medicalProcedureList.findIndex((medicalG: any) => medicalG.mp_id === id);
            if (index !== -1) {
              this.medicalProcedureList.splice(index, 1);
            }

            const index2 = this.medicalProcedureGroups.findIndex((medicalG: any) => medicalG.mp_id === id);
            if (index2 !== -1) {
              this.medicalProcedureGroups.splice(index2, 1);
            }

          },
            (error) => {
              //this.showErrorToast('Xóa mẫu vật thất bại');
              ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedure.url + "/medical-procedure/" + id, error);
            }
          )
      }
    });
  }

  openEditGroupService(id: any, name: any, description: any) {
    this.id = id;
    this.name = name;
    this.description = description
    console.log(this.name);
    console.log(this.id);
    console.log(this.description)
  }
  openEditService(id: any, service: any) {
    this.idService = id;
    this.service = service;
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

}
