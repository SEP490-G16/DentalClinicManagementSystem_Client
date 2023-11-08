import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MaterialService} from "../../../../service/MaterialService/material.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-edit-material',
  templateUrl: './popup-edit-material.component.html',
  styleUrls: ['./popup-edit-material.component.css']
})
export class PopupEditMaterialComponent implements OnChanges {
  @Input() material:any;
  @Input() materialList:any;
  materialInput = {
    name:'',
    unit:''
  }
  materialBody={
    material_id:'',
    material_name:'',
    unit:''
  }
  validateMaterial={
    name:'',
    unit:''
  }
  isSubmitted:boolean = false;
  id:any;
  constructor(private materialSerivce:MaterialService,
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
      material_id:'',
      material_name: this.materialInput.name,
      unit: this.materialInput.unit
    }
    this.materialSerivce.updateMaterial(this.id,this.materialBody).subscribe(data=>{
        this.toastr.success('Cập nhật vật liệu thành công!');
        //window.location.reload();
        let ref = document.getElementById('cancel-editMaterial');
        ref?.click();
        this.materialBody.material_id = this.id;
        const index = this.materialList.findIndex((material:any) => material.material_id === this.id);
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
      name:'',
      unit:''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['material']){
      this.id = this.material.material_id;
      this.materialInput.name = this.material.material_name;
      this.materialInput.unit = this.material.unit;
    }
  }
}
