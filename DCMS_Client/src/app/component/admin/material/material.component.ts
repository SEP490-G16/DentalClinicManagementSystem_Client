import { Component, OnInit } from '@angular/core';
import {MaterialService} from "../../../service/MaterialService/material.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {

  materialList:any = [];
  material:any;
  loading:boolean = false;
  enableNextPageButton: boolean = false;
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
      //this.materialList = data.data;
      //this.loading = false;
      if (paging > 1 && this.materialList.length > 10){
        const dataNextPage = [this.materialList[10]];
        this.materialList = dataNextPage.concat(data.data);
      } else {
        this.materialList = data.data;
      }
      //this.pagingMaterial.total = paging === 1 ? this.materialList.length : this.pagingMaterial.total+data.data.length;
      this.enableNextPageButton = this.materialList.length > 10;
      this.loading = false;
    })
  }
  pageChanged(paging: number) {
    this.pagingMaterial.paging = paging;
    console.log("paging:",this.pagingMaterial.paging);
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

  dataTable(): any[] {
    let results = [];
    if (this.materialList) {
      if (this.materialList.length > 10) {
        for (let i = 0; i < 10; i++) {
          results.push(this.materialList[i]);
        }
      } else {
        results = this.materialList;
      }
    }
    return results;
  }
}
