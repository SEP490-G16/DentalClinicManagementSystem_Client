import { IPostWaitingRoom } from './../../model/IWaitingRoom';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistWaitingRoomService {
  public apiUrl = 'https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService:CognitoService) { }

  getWaitingRooms():Observable<any> {
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

  putWaitingRoom(PutWaitingRoom: IPostWaitingRoom): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutWaitingRoom);
    return this.http.put(`${this.apiUrl}/waiting-room/${PutWaitingRoom.epoch}`, requestBody, { headers });
  }

  deleteWaitingRooms(DeleteWaitingRoom:IPostWaitingRoom):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
      return this.http.delete(`${this.apiUrl}/waiting-room/${DeleteWaitingRoom.epoch}`, { headers });
  }
}
