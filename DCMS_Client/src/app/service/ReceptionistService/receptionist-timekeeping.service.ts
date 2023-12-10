import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistTimekeepingService {
  public apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';

  // status 1: lịch làm việc

  // status 2: chấm công

  private listDisplaySource = new BehaviorSubject<any[]>([]);
  listDisplay$ = this.listDisplaySource.asObservable();

  constructor(private http: HttpClient, private cognitoService: CognitoService) { }

  getTimekeeping(startTime: number, endTime: number): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
    return this.http.get(`${this.apiUrl}/timekeeping/${startTime}/${endTime}`, { headers });
  }

  postTimekeeping(PostTimekeeping: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PostTimekeeping);
    return this.http.post(`${this.apiUrl}/timekeeping `, requestBody, { headers });
  }

  // Trong timekeeping.service.ts
  updateListDisplay(newData: any) {
    // Lấy giá trị hiện tại của BehaviorSubject
    const currentData = this.listDisplaySource.value;
    // Cập nhật dữ liệu mới vào mảng
    const updatedData = [...currentData, newData];
    // Phát ra dữ liệu mới
    this.listDisplaySource.next(updatedData);
  }


  deleteTimekeeping(startTime: number, endTime: number): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.delete(`${this.apiUrl}/timekeeping/${startTime}/${endTime}`, { headers });
  }
}
