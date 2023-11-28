import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAddAppointment, IEditAppointmentBody } from "../../model/IAppointment";

@Injectable({
  providedIn: 'root'
})
export class ReceptionistAppointmentService {
  public apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService: CognitoService) { }

  getAppointmentList(startTime: number, endTime: number): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.get(`${this.apiUrl}/appointment/${startTime}/${endTime}`, { headers, responseType: 'text' });
  }

  postAppointment(addAppointment: IAddAppointment): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${idToken}`,
    });

    const requestBody = JSON.stringify(addAppointment);
    return this.http.post(`${this.apiUrl}/appointment`, requestBody, { headers });
  }

  putAppointment(appointment: IEditAppointmentBody, appointmentId: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${idToken}`,
    });

    const requestBody = JSON.stringify(appointment);

    return this.http.put(`${this.apiUrl}/appointment/${appointmentId}`, requestBody, { headers });
  }

  async getAppointmentByPatient(startTime: number, endTime: number): Promise<any> {
    const idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    try {
      return await this.http.get(`${this.apiUrl}/appointment/${startTime}/${endTime}`, { headers, responseType: 'text' }).toPromise();
    } catch (error) {
      console.error("Lỗi khi gọi API: ", error);
      throw error;
    }
  }

  deleteAppointment(epoch:number, appointmentId: string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
      return this.http.delete(`${this.apiUrl}/appointment/${epoch}/${appointmentId}`, { headers });
  }

}
