import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MaterialUsageReportService {

  public url = "https://834bsm6e7l.execute-api.ap-southeast-1.amazonaws.com/dev"
  constructor(private http:HttpClient) { }

  getMaterialUsages(startDate:any, endDate:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.get(`${this.url}/material-usage/report/${startDate}/${endDate}`,{headers});
  }
}
