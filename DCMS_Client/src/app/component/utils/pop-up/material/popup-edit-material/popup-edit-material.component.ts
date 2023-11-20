import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MaterialService} from "../../../../../service/MaterialService/material.service";
import {ToastrService} from "ngx-toastr";
import { MaterialWarehouseService } from 'src/app/service/MaterialService/material-warehouse.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";

@Component({
  selector: 'app-popup-edit-material',
  templateUrl: './popup-edit-material.component.html',
  styleUrls: ['./popup-edit-material.component.css']
})
export class PopupEditMaterialComponent implements OnChanges {
  @Input() item:any;
  @Input() material:any;
  @Input() materialList:any;
  materialInput = {
    name:'',
    unit:'',
    quantity: 0
  }
  materialBody={
    //material_warehouse_id:'',
    quantity_import: 0,
    remaining: 0,
    price: 0,
    warranty: '',
    discount: ''
  }
  validateMaterial={
    id: '',
    name:'',
    unit:'',
    quantity:0
  }
  isSubmitted:boolean = false;
  //id:any;
  constructor(private materialSerivce:MaterialService,
              private matMaterialWarehouseService: MaterialWarehouseService,
              private toastr:ToastrService) { }

  ngOnInit(): void {
  }
  updateMaterial(){
    this.resetValidates();
    if (!this.materialInput.name){
      this.validateMaterial.name = "Vui lòng nhập tên vật liệu!";
      this.isSubmitted = true;
    }
    if (!this.materialInput.unit){
      this.validateMaterial.unit = "Vui lòng nhập đơn vị!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.materialBody = {
      discount: this.item.discount,
      quantity_import: this.materialInput.quantity,
      remaining: this.item.quantity,
      price: this.material.unitPrice,
      warranty: this.item.expiryDate,
    }
    console.log(this.materialBody);
    //return;
    this.matMaterialWarehouseService.updateMaterialImportMaterial(this.item.mw_material_warehouse_id,this.materialBody).subscribe(data=>{
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
        ResponseHandler.HANDLE_HTTP_STATUS(this.matMaterialWarehouseService.url+"/material-warehouse/material_warehouse_id/"+this.item.mw_material_warehouse_id, error);
      }
    )
  }
  private resetValidates(){
    this.validateMaterial = {
      id: '',
      name:'',
      unit:'',
      quantity: 0
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['material'] && this.material){
      this.materialInput.name = this.material.materialName;
      this.materialInput.unit = this.material.unit;
      this.materialInput.quantity = this.item.quantity;
    }
  }
}
