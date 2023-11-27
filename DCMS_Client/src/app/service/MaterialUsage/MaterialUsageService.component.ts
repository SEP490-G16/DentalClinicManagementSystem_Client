import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class MaterialUsageService {
  public url ='https://834bsm6e7l.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }
  getMaterialUsage_By_TreatmentCourse(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.url}/material-usage/treatment-course/${id}`,{headers});
  }

  getMaterialUsageReport(id:any) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.url}/material-usage/patient/${id}`,{headers});
  }

  postMaterialUsage(MaterialUsage:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(MaterialUsage);
    return this.http.post(`${this.url}/material-usage`, requestBody, { headers });
  }

  puttMaterialUsage(MaterialUsage:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(MaterialUsage);
    return this.http.put(`${this.url}/material-usage`, requestBody, { headers });
  }

  postProcedureMaterialUsage(ProcedureMaterialUsage:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(ProcedureMaterialUsage);
    return this.http.post(`${this.url}/material-usage/procedure`, requestBody, { headers });
  }

  putProcedureMaterialUsage(ProcedureMaterialUsage:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(ProcedureMaterialUsage);
    return this.http.post(`${this.url}/material-usage/procedure`, requestBody, { headers });
  }

}
