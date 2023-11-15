import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class MaterialUsageService {
  private url ='https://834bsm6e7l.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }
  getMaterialUsage_By_TreatmentCourse(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.get(`${this.url}/material-usage/treatment-course/${id}`,{headers});
  }
}
