import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  private url = "https://zalz4w17t8.execute-api.ap-southeast-1.amazonaws.com/dev";
  constructor(private http:HttpClient) { }
  addMaterial(material:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(material);
    return this.http.post(`${this.url}/material`,requestBody,{headers});
  }

  updateMaterial(id:any, material:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    const requestBody = JSON.stringify(material);
    return this.http.put(`${this.url}/material/${id}`,requestBody,{headers});
  }

  deleteMaterial(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.delete(`${this.url}/material/${id}`,{headers});
  }
}
