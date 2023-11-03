import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEditLabo, ILabos, IPostLabo } from 'src/app/model/ILabo';

@Injectable({
  providedIn: 'root'
})
export class LaboService {
  private apiUrl = 'https://c9yk48b9bg.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService:CognitoService) { }

  getLabos():Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
      return this.http.get(`${this.apiUrl}/labo`, { headers });
  }

  postLabo(PostLabo: IPostLabo): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PostLabo);
    return this.http.post(`${this.apiUrl}/labo`, requestBody, { headers });
  }

  putLabo(laboId:string, PutLaboBody:IEditLabo): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutLaboBody);
    return this.http.put(`${this.apiUrl}/labo/${laboId}`, requestBody, { headers });
  }

  deleteLabo(laboId:string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
      return this.http.delete(`${this.apiUrl}/labo/${laboId}`, { headers });
  }
}
