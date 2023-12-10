import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PutSpecimen } from 'src/app/model/ISpecimens';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  public apiUrl = 'https://bhomhpu0gb.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService:CognitoService) { }

  getAccessToken(access_code:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    const body = JSON.stringify({"access_code": access_code})
    return this.http.post(`${this.apiUrl}/private-access/get-access-token/`, body, { headers, responseType: 'text' });
  }

  getOTPWhenForgetPassword(id:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.get(`${this.apiUrl}/private-access/${id}`, { headers, responseType: 'text' });
  }

  postPrivateAccess(otp:any, new_access_code:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${idToken}`,
    });
    const requestBody = JSON.stringify({"otp": parseInt(otp), "new_access_code": new_access_code});
    return this.http.post(`${this.apiUrl}/private-access`, requestBody, { headers });
  }
}