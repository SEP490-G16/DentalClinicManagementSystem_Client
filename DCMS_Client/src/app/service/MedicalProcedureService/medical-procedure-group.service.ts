import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MedicalProcedureGroupService {
  public url = 'https://660tvt9ige.execute-api.ap-southeast-1.amazonaws.com/dev';
  constructor(private http: HttpClient) { }
  getMedicalProcedureGroupList():Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept':'application/json'
    });
    return this.http.get(`${this.url}/medical-procedure-group`, {headers});
  }
  updateMedicalProcedureGroup(medicalProcedureGroup:any,id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(medicalProcedureGroup);
    return this.http.put(`${this.url}/medical-procedure-group/${id}`,requestBody, {headers});
  }
  deleteMedicalProcedureGroup(id:string):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.delete(`${this.url}/medical-procedure-group/${id}`, {headers});
  }
  addMedicalProcedureGroup(medicalProcedureGroup:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(medicalProcedureGroup);
    return this.http.post(`${this.url}/medical-procedure-group`,requestBody,{headers});
  }
  getMedicalProcedureGroupWithDetailList():Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept':'application/json'
    });
    return this.http.get(`${this.url}/medical-procedure-group-with-detail`, {headers});
  }
}
