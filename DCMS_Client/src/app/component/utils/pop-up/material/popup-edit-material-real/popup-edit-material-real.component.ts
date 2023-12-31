import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/service/MaterialService/material.service';
import { ResponseHandler } from '../../../libs/ResponseHandler';

@Component({
  selector: 'app-popup-edit-material-real',
  templateUrl: './popup-edit-material-real.component.html',
  styleUrls: ['../popup-edit-material/popup-edit-material.component.css']
})
export class PopupEditMaterialRealComponent implements OnInit, OnChanges {
  @Output() materialUpdated = new EventEmitter<any>();
  @Input() materialEdit: any;
  material = {
    name: '',
    description: '',
    unit: '',
    quantity: '',
    unitPrice: '',
    total: 0,
  }
  materialBody = {
    material_name: '',
    unit: '',
    total: 0
  }
  validateMaterial = {
    name: '',
    unit: ''
  }
  disable:boolean = false;
  isSubmitted: boolean = false;
  constructor(private materialSerivce: MaterialService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['materialEdit'].currentValue) {
      console.log(this.materialEdit);
      this.material.name = this.materialEdit.material_name;
      this.material.unit = this.materialEdit.unit;
      this.material.total = this.materialEdit.total ? this.materialEdit.total : 0
    }
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
      material_name: this.material.name,
      unit: this.material.unit,
      total: this.material.total
    }
    this.disable = true;
    this.materialSerivce.updateMaterial(this.materialEdit.material_id, this.materialBody).subscribe(data => {
      this.toastr.success('Chính sửa vật liệu thành công!');
      this.disable = false;
      window.location.reload();
      // let ref = document.getElementById('cancel-editMaterial');
      // ref?.click();
      // const newMaterialId = data.data.medical_id;
      // const Body = {
      //   material_id: newMaterialId,
      //   material_name: this.material.name,
      //   unit: this.material.unit,
      //   total: this.material.total
      // }
      // this.materialUpdated.emit(Body);
    },
      error => {
        this.disable = false;
        this.toastr.error(error.error.message, 'Sửa vật liệu thất bại!');
        // ResponseHandler.HANDLE_HTTP_STATUS(this.materialSerivce.url + "/material", error);
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
