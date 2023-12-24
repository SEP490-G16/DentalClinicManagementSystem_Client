import { IPostWaitingRoom, IPostWaitingRoomNew, IPutWaitingRoomNew } from './../../model/IWaitingRoom';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistWaitingRoomService {
  public apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService: CognitoService) { }

  private listWatingRoom = new BehaviorSubject<any[]>([]);
  data$ = this.listWatingRoom.asObservable();
  updateData(newData: any[]): void {
    this.listWatingRoom.next(newData);
  }

  private Notification = new BehaviorSubject<any>({
    status: '1',
    content: {
      epoch: '',
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      patient_created_date: '',
      status_value: '',
      appointment_id: '',
      appointment_epoch: '',
    }
  });

  dataAn$ = this.Notification.asObservable();
  updateAnalysesData(newData: any): void {
    console.log("đã update nha");
    this.Notification.next(newData);
  }

  getWaitingRooms(): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.get(`${this.apiUrl}/waiting-room`, { headers });
  }

  postWaitingRoom(PostWaitingRoom: IPostWaitingRoom): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PostWaitingRoom);
    return this.http.post(`${this.apiUrl}/waiting-room`, requestBody, { headers });
  }

  postWaitingRoomNew(PostWaitingRoom: IPostWaitingRoomNew): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PostWaitingRoom);
    return this.http.post(`${this.apiUrl}/waiting-room`, requestBody, { headers });
  }


  putWaitingRoom(PutWaitingRoom: IPostWaitingRoom): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutWaitingRoom);
    return this.http.put(`${this.apiUrl}/waiting-room/${PutWaitingRoom.epoch}`, requestBody, { headers });
  }

  putWaitingRoomNew(SoftKey:any, PutWaitingRoom: IPutWaitingRoomNew): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutWaitingRoom);
    return this.http.put(`${this.apiUrl}/waiting-room/${SoftKey}`, requestBody, { headers });
  }

  deleteWaitingRooms(DeleteWaitingRoom: IPostWaitingRoom): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.delete(`${this.apiUrl}/waiting-room/${DeleteWaitingRoom.epoch}`, { headers });
  }

  deleteWaitingRoomsNew(softkey:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.delete(`${this.apiUrl}/waiting-room/${softkey}`, { headers });
  }

  putNewPatientId(id: any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    return this.http.put(`https://gf4tlb2kyi.execute-api.ap-southeast-1.amazonaws.com/dev/update-new-patient/${id}`, {}, { headers });
  }
}
