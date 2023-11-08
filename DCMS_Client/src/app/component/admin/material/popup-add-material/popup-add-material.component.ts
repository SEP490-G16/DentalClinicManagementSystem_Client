import {Component, Input, OnInit} from '@angular/core';
import {MaterialService} from "../../../../service/MaterialService/material.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-add-material',
  templateUrl: './popup-add-material.component.html',
  styleUrls: ['./popup-add-material.component.css']
})
export class PopupAddMaterialComponent implements OnInit {
  @Input() materialList:any;
  material = {
    name:'',
    description:'',
    unit:'',
    quantity:'',
    unitPrice:''
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
  constructor(private materialSerivce:MaterialService,
              private toastr:ToastrService) { }

  ngOnInit(): void {
  }
  addMaterial(){
    this.resetValidate();
    if (!this.material.name){
      this.validateMaterial.name = "Vui lòng nhập tên vật liệu!";
      this.isSubmitted = true;
    }
    if (!this.material.unit){
      this.validateMaterial.unit = "Vui lòng nhập đơn vị!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.materialBody = {
      material_id:'',
      material_name: this.material.name,
      unit: this.material.unit
    }
    this.materialSerivce.addMaterial(this.materialBody).subscribe(data=>{
      this.toastr.success('Thêm mới vật liệu thành công!');
      //window.location.reload();
        let ref = document.getElementById('cancel-addMaterial');
        ref?.click();
        const newMaterialId = data.data.medical_id;
        this.materialBody.material_id = newMaterialId;
        this.materialList.unshift(this.materialBody);

    },
      error => {
      this.toastr.error('Thêm mới vật liệu thất bại!');
      }
      )
  }
  private resetValidate(){
    this.validateMaterial = {
      name:'',
      unit:''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
}
