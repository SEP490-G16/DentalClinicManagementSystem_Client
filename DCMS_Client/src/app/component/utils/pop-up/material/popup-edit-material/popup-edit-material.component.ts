import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MaterialService } from "../../../../../service/MaterialService/material.service";
import { ToastrService } from "ngx-toastr";
import { MaterialWarehouseService } from 'src/app/service/MaterialService/material-warehouse.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormatNgbDate } from '../../../libs/formatNgbDate';
import { TimestampFormat } from '../../../libs/timestampFormat';

@Component({
  selector: 'app-popup-edit-material',
  templateUrl: './popup-edit-material.component.html',
  styleUrls: ['./popup-edit-material.component.css']
})
export class PopupEditMaterialComponent implements OnChanges {
  @Input() item: any;
  @Input() material: any;
  @Input() materialList: any;

  model!: NgbDateStruct;
  materialInput = {
    name: '',
    unit: '',
    quantity: '',
    warrantyDate: ""
  }
  materialBody = {
    //material_warehouse_id:'',
    quantity_import: 0,
    remaining: 0,
    price: 0,
    warranty: 0,
    discount: ''
  }
  validateMaterial = {
    id: '',
    name: '',
    unit: '',
    quantity: '',
    warrantyDate: ""
  }
  isSubmitted: boolean = false;
  //id:any;
  constructor(private materialSerivce: MaterialService,
    private matMaterialWarehouseService: MaterialWarehouseService,
    private toastr: ToastrService) {

    this.model = {
      year: 2023,
      month: 12,
      day: 12
    }
  }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['material'] && this.material) {
      this.materialInput.name = this.material.materialName;
      this.materialInput.unit = this.material.unit;
    }
    if(changes['item'] && this.item) {
      this.materialInput.quantity = this.material.quantity;
      this.model = {
        year: Number(this.item.expiryDate.split(" ")[0].split("-")[0]),
        month: Number(this.item.expiryDate.split(" ")[0].split("-")[1]),
        day: Number(this.item.expiryDate.split(" ")[0].split("-")[2])
      }
    }
  }
  onDateChange() {
    this.materialInput.warrantyDate = FormatNgbDate.formatNgbDateToVNString(this.model)
  }
  updateMaterial() {
    const warrantDate = FormatNgbDate.formatNgbDateToString(this.model);
    this.resetValidates();
    if (!this.materialInput.name) {
      this.validateMaterial.name = "Vui lòng nhập tên vật liệu!";
      this.isSubmitted = true;
    }
    if (!this.materialInput.unit) {
      this.validateMaterial.unit = "Vui lòng nhập đơn vị!";
      this.isSubmitted = true;
    }
    if (!this.checkNumber(this.materialInput.quantity)){
      this.validateMaterial.quantity = "Vui lòng nhập số lượng > 0!";
      this.isSubmitted = true;
    }
    if(this.isDate(warrantDate)) {
      this.validateMaterial.warrantyDate = "Vui lòng nhập đúng định dạng Ngày/Tháng/Năm !";
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    this.materialBody = {
      discount: this.item.discount.toString(),
      quantity_import: this.item.quantity,
      remaining: parseInt(this.materialInput.quantity),
      price: this.material.unitPrice,
      warranty:  TimestampFormat.timeAndDateToTimestamp("20:00",FormatNgbDate.formatNgbDateToString(this.model))
    }
    //return;
    this.matMaterialWarehouseService.updateMaterialImportMaterial(this.item.mw_material_warehouse_id, this.materialBody).subscribe(data => {
      this.toastr.success('Cập nhật vật liệu thành công!');
      window.location.reload();
      let ref = document.getElementById('cancel-editMaterial');
      //ref?.click();
      // this.materialBody.material_warehouse_id = this.item.mw_material_warehouse_id;
      // const index = this.materialList.findIndex((material:any) => material.material_id === this.item.mw_material_warehouse_id);
      // if (index !== -1) {
      //   this.materialList[index] = this.materialBody;
      // }
    },
      error => {
        //this.toastr.error('Cập nhật vật liệu thất bại!');
        ResponseHandler.HANDLE_HTTP_STATUS(this.matMaterialWarehouseService.url + "/material-warehouse/material_warehouse_id/" + this.item.mw_material_warehouse_id, error);
      }
    )
  }
  private resetValidates() {
    this.validateMaterial = {
      id: '',
      name: '',
      unit: '',
      quantity: '',
      warrantyDate: ""
    }
    this.isSubmitted = false;
  }
  private isDate(date: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }

}
