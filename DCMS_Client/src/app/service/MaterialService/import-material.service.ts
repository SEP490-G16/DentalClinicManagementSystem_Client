import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImportMaterialService {

  private url='https://uog249mna5.execute-api.ap-southeast-1.amazonaws.com/dev';
  constructor(private http: HttpClient) { }
  getImportMaterials(paging:number):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.get(`${this.url}/import-material/page/${paging}`, {headers});
  }
  addImportBill(importBill:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(importBill);
    return this.http.post(`${this.url}/import-material`, requestBody, {headers});
  }
  updateImportBill(id:any, importBill:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(importBill);
    return this.http.put(`${this.url}/import-material/${id}`,requestBody, {headers});
  }
  deleteImportBill(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.delete(`${this.url}/import-material/${id}`,{headers});
  }
}
