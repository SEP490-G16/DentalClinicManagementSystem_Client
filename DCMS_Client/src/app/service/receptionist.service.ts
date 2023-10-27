import { CognitoService } from './cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistService {
  private apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService:CognitoService) { }



  getAppointmentList(startTime: string, endTime: string):Observable<any> {
      let idToken = sessionStorage.getItem("id_Token");

      const headers = new HttpHeaders({
        'Authorization': `${idToken}`

      });
      return this.http.get(`${this.apiUrl}/appointment/${startTime}/${endTime}`, { headers });
  }

  getWaitingRooms():Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': `application/json`
    });
      return this.http.get(`${this.apiUrl}/waiting-room`, { headers });
  }

}
