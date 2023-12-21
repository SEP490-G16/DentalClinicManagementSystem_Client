import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TimeKeepingService {

  public url = "https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev";
  constructor(private http:HttpClient) { }

  getFollowingTimekeeping(startTime:any, endTime:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json',
    });
    return this.http.get(`${this.url}/timekeeping/${startTime}/${endTime}`,{headers});
  }

  getFollowingTimekeepingNew(startTime:any, endTime:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json',
    });
    return this.http.get(`https://twjwpq3ype.execute-api.ap-southeast-1.amazonaws.com/prod/timekeeping/${startTime}/${endTime}`,{headers});
  }
}
