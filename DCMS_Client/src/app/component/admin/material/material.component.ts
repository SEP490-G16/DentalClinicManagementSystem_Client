import { Component, OnInit } from '@angular/core';
import {MaterialService} from "../../../service/MaterialService/material.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {

  materialList:any;
  material:any;
  loading:boolean = false;
  constructor(private materialService:MaterialService,
              private toastr: ToastrService) { }

  pagingMaterial = {
    paging:1,
    total:0
  };
  ngOnInit(): void {
    this.getMaterials(this.pagingMaterial.paging);
  }
  getMaterials(paging:number){
    this.loading = true;
    this.materialService.getMaterials(paging).subscribe(data=>{
      this.materialList = data.data;
      this.loading = false;
      if (this.materialList.length < 11){
        this.pagingMaterial.total+=this.materialList.length;
      }
      else
      {
        this.pagingMaterial.total=this.materialList.length;
      }
    })
  }
  pageChanged(event: number) {
    this.pagingMaterial.paging = event;
    this.getMaterials(this.pagingMaterial.paging);
  }
  deleteMaterial(id:string){
    const isConfirmed = window.confirm('Bạn có chắc muốn xoá vật liệu này không ?');
    if (isConfirmed){
      this.loading = true;
      this.materialService.deleteMaterial(id).subscribe(data=>{
        this.toastr.success('Xoá vật liệu thành công !');
          const index = this.materialList.findIndex((material:any) => material.material_id === id);
          if (index !== -1) {
            this.materialList.splice(index, 1);
          }
          this.loading = false;
      },
        error => {
        this.toastr.error('Xoá vật liệu thất bại !');
        }
        )
    }
  }
  openEditMaterial(material:any){
    this.material = material;
  }
}
