import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MaterialService } from "../../../../../service/MaterialService/material.service";
import { ToastrService } from "ngx-toastr";
import { ResponseHandler } from "../../../libs/ResponseHandler";

@Component({
  selector: 'app-popup-add-material',
  templateUrl: './popup-add-material.component.html',
  styleUrls: ['./popup-add-material.component.css']
})
export class PopupAddMaterialComponent implements OnInit {
  @Input() materialList: any;
  @Output() materialAdded = new EventEmitter<any>();
  material = {
    name: '',
    description: '',
    unit: '',
    total: 0,
  }
  materialBody = {
    material_id: '',
    material_name: '',
    unit: '',
    total: 0,
  }
  validateMaterial = {
    name: '',
    unit: ''
  }
  isSubmitted: boolean = false;
  disable:boolean = false;
  constructor(private materialSerivce: MaterialService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
  }
  addMaterial() {
    this.resetValidate();
    if (!this.material.name) {
      this.validateMaterial.name = "Vui lòng nhập tên vật liệu!";
      this.isSubmitted = true;
    }
    if (!this.material.unit) {
      this.validateMaterial.unit = "Vui lòng nhập đơn vị!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    this.materialBody = {
      material_id: '',
      material_name: this.material.name,
      unit: this.material.unit,
      total: this.material.total
    }
    console.log(this.materialBody);
    this.disable = true;
    this.materialSerivce.addMaterial(this.materialBody).subscribe(data => {
      this.toastr.success('Thêm mới vật liệu thành công!');
      //window.location.reload();
      let ref = document.getElementById('cancel-addMaterial');
      ref?.click();
      const newMaterialId = data.data.medical_id;
      this.materialBody.material_id = newMaterialId;
      this.materialList.unshift(this.materialBody);

      //
      this.materialAdded.emit(this.materialBody);
      this.disable = false;
      this.material = {
        name: '',
        description: '',
        unit: '',
        total: 0,
      }
    },
      (error) => {
      this.disable = false;
        this.toastr.error(error.error.message, 'Thêm mới vật liệu thất bại!');
        // ResponseHandler.HANDLE_HTTP_STATUS(this.materialSerivce.url+"/material", error.error.message);
      }
    )
  }
   resetValidate() {
    this.validateMaterial = {
      name: '',
      unit: ''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
}
