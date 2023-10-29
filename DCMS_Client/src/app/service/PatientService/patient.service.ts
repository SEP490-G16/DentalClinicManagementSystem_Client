import { IAddAppointment } from './../../model/IAppointment';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private test = 'https://gf4tlb2kyi.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }
  getPatientPhoneNumber(sdt:string):Observable<any> {
      let idToken = sessionStorage.getItem("id_Token");

      const headers = new HttpHeaders({
        'Authorization': `${idToken}`,
        'Content-Type':'application/json'
      });

      return this.http.get(`${this.test}/patient/phone-number/${sdt}`, { headers });
    }

}
