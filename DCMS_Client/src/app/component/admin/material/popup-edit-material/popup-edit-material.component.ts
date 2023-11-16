import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MaterialService} from "../../../../service/MaterialService/material.service";
import {ToastrService} from "ngx-toastr";
import { MaterialWarehouseService } from 'src/app/service/MaterialService/material-warehouse.service';

@Component({
  selector: 'app-popup-edit-material',
  templateUrl: './popup-edit-material.component.html',
  styleUrls: ['./popup-edit-material.component.css']
})
export class PopupEditMaterialComponent implements OnChanges {
  @Input() detail:any;
  @Input() material:any;
  @Input() materialList:any;
  materialInput = {
    name:'',
    unit:'',
    quantity: 0
  }
  materialBody={
    material_id:'',
    material_name:'',
    unit:'',
    quantity: 0
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
      material_id:this.detail.mw_material_warehouse_id,
      material_name: this.materialInput.name,
      unit: this.materialInput.unit,
      quantity: this.materialInput.quantity,
    }
    this.matMaterialWarehouseService.updateMaterialImportMaterial(this.detail.mw_material_warehouse_id,this.materialBody).subscribe(data=>{
        this.toastr.success('Cập nhật vật liệu thành công!');
        //window.location.reload();
        let ref = document.getElementById('cancel-editMaterial');
        ref?.click();
        this.materialBody.material_id = this.detail;
        const index = this.materialList.findIndex((material:any) => material.material_id === this.detail.mw_material_warehouse_id);
        if (index !== -1) {
          this.materialList[index] = this.materialBody;
        }
      },
      error => {
        this.toastr.error('Cập nhật vật liệu thất bại!');
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
      this.materialInput.quantity = this.detail.quantity;
    }
  }
}
