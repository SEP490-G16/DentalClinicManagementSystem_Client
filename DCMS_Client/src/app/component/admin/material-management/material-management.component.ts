import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/service/MaterialService/material.service';
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
@Component({
  selector: 'app-material-management',
  templateUrl: './material-management.component.html',
  styleUrls: ['./material-management.component.css']
})
export class MaterialManagementComponent implements OnInit {
  materials: any[] = [];
  material: any;
  currentPage: number = 1;
  hasNextPage: boolean = false;
  pagingBill = {
    paging: 1,
    total: 0
  };
  clicked: boolean = false;
  lastClickTime: number = 0;
  constructor(private materialService: MaterialService, private toastr: ToastrService, private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getMaterial(this.pagingBill.paging);
  }

  getMaterial(page : number) {
    this.currentPage = page;
    this.materials = [];
    this.materialService.getMaterial(this.currentPage).subscribe(data =>{
      console.log(data.data);
      this.materials = data.data;
      this.checkNextPage();
      if (this.materials.length > 10) {
        this.materials.pop();
      }
    })
  }
  pageChanged(event: number) {
    const currentTime = new Date().getTime();
    if (!this.clicked || (currentTime - this.lastClickTime >= 600)) {
      this.clicked = true;
      this.lastClickTime = currentTime;

      if (event >= 1) {
        this.getMaterial(event);
      }
    }
  }
  onMaterialAdded(newMaterial: any) {
    this.materials.unshift(newMaterial);
  }

  editMaterial(material: any) {
    this.material = material;
  }
  checkNextPage() {
    this.hasNextPage = this.materials.length > 10;
  }
  onMaterialUpdated(updatedMaterial: any) {
    const index = this.materials.findIndex((m: any) => m.material_id === updatedMaterial.material_id);
    if (index !== -1) {
      this.materials[index] = updatedMaterial;
    } else {
      this.materials.unshift(updatedMaterial);
    }
  }

  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  deleteMaterial(material: any) {
    this.openConfirmationModal(`Bạn có muốn xóa vật liệu ${material.material_name} không?`).then((result) => {
      if (result === true) {
        this.materialService.deleteMaterial(material.material_id).subscribe((res: any) => {
          this.materials = this.materials.filter((m: any) => m.material_id !== material.material_id);
          this.toastr.success(res.message, "Xóa vật liệu thành công");
        },
          (error) => {
            this.toastr.error(error.error.message, "Xóa vật liệu thành công");
          }
        )
      }
    });
  }


}
