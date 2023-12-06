import { ITreatmentCourse } from './../../model/ITreatment-Course';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TreatmentCourseService {
  public apiUrl = 'https://ltmup12v3i.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService: CognitoService) { }

  getTreatmentCourse(id: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/treatment-course/patient-id/${id}`, { headers });
  }

  postTreatmentCourse(PostTreatmentCourse: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PostTreatmentCourse);
    return this.http.post(`${this.apiUrl}/treatment-course`, requestBody, { headers });
  }

  putTreatmentCourse(id: string, PutTreatmentCourse: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutTreatmentCourse);
    return this.http.put(`https://ltmup12v3i.execute-api.ap-southeast-1.amazonaws.com/dev/treatment-course/${id}`, requestBody, { headers });
  }

  deleteTreatmentCourse(id: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.delete(`${this.apiUrl}/treatment-course/${id}`, { headers });
  }

  getImageXRay(id: any) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json'
    });
    return this.http.get(`https://l0p7qq0j0f.execute-api.ap-southeast-1.amazonaws.com/dev/x-ray-image/patient/${id}`, { headers });
  }

  postImageXRay(id: any, listIamge: any) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = {
      patient_id: id,
      image_arr: listIamge
    }
    return this.http.post(`https://l0p7qq0j0f.execute-api.ap-southeast-1.amazonaws.com/dev/x-ray-image`, requestBody, { headers });
  }

  putImageXRay() {

  }

  deleteImageXRay(id: any, urlImage: any) {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.delete(`https://l0p7qq0j0f.execute-api.ap-southeast-1.amazonaws.com/dev/x-ray-image/${id}/${urlImage}`, { headers });
  }

}
