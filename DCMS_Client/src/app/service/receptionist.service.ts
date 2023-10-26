import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistService {
  private apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }

  getAppointmentList(startTime: string, endTime: string):Promise<any> {
    // Get Cognito ID Token after Login
    return Auth.currentSession().then((session) => {
      const idToken = session.getIdToken().getJwtToken();

      //Create Sub
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${idToken}`
      });

      // Call API with HttpClient
      return this.http.get(`${this.apiUrl}/appointment/${startTime}/${endTime}`, { headers });
    });
  }

  getWaitingRooms():Promise<any> {
    // Get Cognito ID Token after Login
    return Auth.currentSession().then((session) => {
      const idToken = session.getIdToken().getJwtToken();
      console.log(idToken);
      //Create Sub
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${idToken}`
      });

      // Call API with HttpClient
      return this.http.get(`${this.apiUrl}/waiting-room`, { headers });
    });
  }

}
