import { IAddAppointment } from './../../model/IAppointment';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistAppointmentService {
  private apiUrl = 'https://gf4tlb2kyi.execute-api.ap-southeast-1.amazonaws.com/dev';
  constructor(private http: HttpClient, private cognitoService: CognitoService) { }


  getAppointmentList(startTime: string, endTime: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`

    });
    return this.http.get(`${this.apiUrl}/appointment/${startTime}/${endTime}`, { headers });
  }

  getPatientByPhone(phone: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,

    });
    return this.http.get(`${this.apiUrl}/patient/phone-number/${phone}`, { headers });

  }

  postAppointment(addAppointment: IAddAppointment): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${idToken}`,
    });

    const requestBody = JSON.stringify(addAppointment);
    return this.http.post(`${this.apiUrl}/patient`, requestBody, { headers });
  }
}
