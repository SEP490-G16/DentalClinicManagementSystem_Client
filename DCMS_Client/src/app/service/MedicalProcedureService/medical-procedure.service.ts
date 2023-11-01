import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MedicalProcedureService {
  private url ='https://or744yzk0g.execute-api.ap-southeast-1.amazonaws.com/dev';
  constructor(private http: HttpClient) { }
  addMedicalProcedure(medicalProcedureGroup:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(medicalProcedureGroup);
    return this.http.post(`${this.url}/medical-procedure`,requestBody,{headers});
  }

  getMedicalProcedure(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.get(`${this.url}/medical-procedure/${id}`,{headers});
  }

  updateMedicalProcedure(id:any, medicalProcedure:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(medicalProcedure);
    return this.http.put(`${this.url}/medical-procedure/${id}`, requestBody,{headers});
  }

  deleteMedicalProcedure(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.delete(`${this.url}/medical-procedure/${id}`,{headers});
  }
}
