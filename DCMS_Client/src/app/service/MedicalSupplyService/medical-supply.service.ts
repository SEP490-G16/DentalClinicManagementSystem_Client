import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MedicalSupplyService {
  private url= 'https://o0pwf246i1.execute-api.ap-southeast-1.amazonaws.com/dev';
  constructor(private http:HttpClient) { }

  addMedicalSupply(specimens:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(specimens);
    return this.http.post(`${this.url}/medical-supply`, requestBody, {headers});
  }
  approveSpecimens(id:any, specimen:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(specimen);
    return this.http.put(`${this.url}/medical-supply/${id}`,requestBody,{headers});
  }

  getApproveSpecimensList(status:any, paging:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.get(`${this.url}/medical-supply/status/${status}/${paging}`,{headers})
  }
}
