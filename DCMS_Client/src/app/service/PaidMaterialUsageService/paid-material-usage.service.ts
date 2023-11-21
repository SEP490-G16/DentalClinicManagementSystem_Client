import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaidMaterialUsageService {

  public url = "https://gg1spfr4gl.execute-api.ap-southeast-1.amazonaws.com/dev";
  

  //expenses/{epoch}/{end-date}
  constructor(private http:HttpClient) { }

  getListExpense(startTime:string, endTime:string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
    return this.http.get(`${this.url}/expenses/`+startTime+"/"+endTime,{headers : headers, responseType:'text'});
  }

  postExpense(expensesInput:any):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8" 
    });
    return this.http.post(`${this.url}/expenses`, expensesInput,{headers});
  } 

  updatePaidMaterialUsage(epoch:any, expensesInput:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    return this.http.put(`${this.url}/expenses/${epoch}`,expensesInput,{headers});
  }

  deletePaidMaterialUsage(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
    });
    return this.http.delete(`${this.url}/expenses/${id}`,{headers});
  }

}
