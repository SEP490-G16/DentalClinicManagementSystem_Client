import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MaterialWarehouseService {
  private url = "https://96rec52gi8.execute-api.ap-southeast-1.amazonaws.com/dev";
  constructor(private http: HttpClient) { }

  ImportMaterial(materials:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(materials);
    return this.http.post(`${this.url}/material-warehouse`,requestBody,{headers});
  }
  getMaterialsByImportMaterialBill(importMaterialBillId:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.get(`${this.url}/material-warehouse/${importMaterialBillId}`,{headers});
  }

  deleteMaterialImportMaterial(materialWarehouseId:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.delete(`${this.url}/material-warehouse/material_warehouse_id/${materialWarehouseId}`,{headers});
  }
  updateMaterialImportMaterial(materialWarehouseId:any, materialBody:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(materialBody);
    return this.http.put(`${this.url}/material-warehouse/material_warehouse_id/${materialWarehouseId}`,requestBody,{headers});
  }

  getMaterialWarehousse_Remaining(paging:number):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.url}/material-warehouse/remaining/${paging}`, {headers});
  }
}
