
import { ITreatmentCourse } from './../../model/ITreatment-Course';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TreatmentCourseDetailService {
  public apiUrl = 'https://0l59n7hga6.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService:CognitoService) { }

  getTreatmentCourseDetail(id:string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept':'application/json'
    });
    return this.http.get(`${this.apiUrl}/examination/treatment-course/${id}`, { headers });
  }


  getExamination(id:string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept':'application/json'
    });

    return this.http.get(`${this.apiUrl}/examination/${id}`, { headers });
  }

  getDetailByExamnination(id:any):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept':'application/json'
    });

    return this.http.get(`https://834bsm6e7l.execute-api.ap-southeast-1.amazonaws.com/dev/material-usage/examination/${id}`, { headers });
  }

  postExamination(PostTreatmentCourse:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PostTreatmentCourse);
    return this.http.post(`${this.apiUrl}/examination`, requestBody, { headers });
  }

  putExamination(id:string, PutTreatmentCourse:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutTreatmentCourse);
    return this.http.put(`${this.apiUrl}/examination/${id}`, requestBody, { headers });
  }

  deleteExamination(id:string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
      return this.http.delete(`${this.apiUrl}/examination/${id}`, { headers });
  }


}


//https://0l59n7hga6.execute-api.ap-southeast-1.amazonaws.com/dev
