import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class MaterialUsageService {
  public url = 'https://834bsm6e7l.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }
  getMaterialUsage_By_TreatmentCourse(id: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.url}/material-usage/treatment-course/${id}`, { headers });
  }

  getMaterialUsagePatientReport(id: any) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.url}/material-usage/patient/${id}`, { headers });
  }

  getMaterialUsageReport(startDate: number, endDate: number) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.url}/material-usage/report/${startDate}/${endDate}`, { headers });
  }

  postMaterialUsage(MaterialUsage: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(MaterialUsage);
    return this.http.post(`${this.url}/material-usage`, requestBody, { headers });
  }

  // puttMaterialUsage(MaterialUsage:any): Observable<any> {
  //   let idToken = sessionStorage.getItem("id_Token");
  //   const headers = new HttpHeaders({
  //     'Authorization': `${idToken}`,
  //     "Content-Type": "application/json; charset=utf8"
  //   });
  //   const requestBody = JSON.stringify(MaterialUsage);
  //   return this.http.put(`${this.url}/material-usage`, requestBody, { headers });
  // }

  putMaterialUsage(ID: any, MaterialUsage: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(MaterialUsage);
    return this.http.put(`${this.url}/material-usage/${ID}`, requestBody, { headers });
  }

  deleteMaterialUsage(id: any,): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    return this.http.delete(`${this.url}/material-usage/${id}`,{headers});
  }

  postProcedureMaterialUsage(ProcedureMaterialUsage: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(ProcedureMaterialUsage);
    return this.http.post(`${this.url}/material-usage/procedure`, requestBody, { headers });
  }

  putProcedureMaterialUsage(ProcedureMaterialUsage: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(ProcedureMaterialUsage);
    return this.http.post(`${this.url}/material-usage/procedure`, requestBody, { headers });
  }


}
