import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PaidMaterialUsageService {
  private apiUrls = 'https://6jg8mtl495.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }
  getPaidMaterialUsageExamination(id:string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrls}/paid-material-usage/examination/${id}`, { headers });
  }
  postPaidMaterialUsage(Body:any){
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(Body);
    return this.http.post(`${this.apiUrls}/paid-material-usage`, requestBody, {headers});
  }

  putPaidMaterialUsage(id:string, Body:any){
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(Body);
    return this.http.post(`${this.apiUrls}/paid-material-usage/${id}`, requestBody, {headers});
  }
}
