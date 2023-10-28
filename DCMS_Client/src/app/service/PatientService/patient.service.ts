import { IAddAppointment } from './../../model/IAppointment';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';
  constructor(private http: HttpClient, private cognitoService: CognitoService) { }

  getPatientByPhone(phone: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,

    });
    return this.http.get(`${this.apiUrl}/patient/phone-number/${phone}`, { headers });

  }

}
