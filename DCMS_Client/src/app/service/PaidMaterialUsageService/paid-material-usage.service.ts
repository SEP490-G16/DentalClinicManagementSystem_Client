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
    // let idToken = sessionStorage.getItem("id_Token");

    // const headers = new HttpHeaders({
    //   'Authorization': `${idToken}`
    // });
    var tokenAcess = localStorage.getItem("securityAccess");
    var idToken;
    var token;
    if (tokenAcess != null) {
      console.log("check localStorage: ", tokenAcess);
      idToken = tokenAcess.split('/');
      console.log("Check tokenAcess: ",idToken[0]);
      const now = new Date();
      if (idToken[1] <= now.getMinutes().toString()) {
        token = idToken[0];
      }
    }
    console.log("Check tokenAcess 1: ",token);
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Accept': 'application/json'
    });
    return this.http.get(`${this.url}/expenses/`+startTime+"/"+endTime, {headers : headers, responseType:'text'});
  }

  postExpense(expensesInput:any):Observable<any> {
    // let idToken = sessionStorage.getItem("id_Token");

    // const headers = new HttpHeaders({
    //   'Authorization': `${idToken}`,
    //   "Content-Type": "application/json; charset=utf8" 
    // });
    var tokenAcess = localStorage.getItem("securityAccess");
    var idToken;
    var token;
    if (tokenAcess != null) {
      console.log("check localStorage: ", tokenAcess);
      idToken = tokenAcess.split('/');
      console.log("Check tokenAcess: ",idToken[0]);
      const now = new Date();
      if (idToken[1] <= now.getMinutes().toString()) {
        token = idToken[0];
      }
    }
    console.log("Check tokenAcess 1: ",token);
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      "Content-Type": "application/json; charset=utf8" 
    });
    return this.http.post(`${this.url}/expenses`, expensesInput,{headers});
  } 

  updatePaidMaterialUsage(epoch:any, expensesInput:any):Observable<any>{
    // let idToken = sessionStorage.getItem("id_Token");
    // const headers = new HttpHeaders({
    //   'Authorization': `${idToken}`,
    //   "Content-Type": "application/json; charset=utf8"
    // });
    var tokenAcess = localStorage.getItem("securityAccess");
    var idToken;
    var token;
    if (tokenAcess != null) {
      console.log("check localStorage: ", tokenAcess);
      idToken = tokenAcess.split('/');
      console.log("Check tokenAcess: ",idToken[0]);
      const now = new Date();
      if (idToken[1] <= now.getMinutes().toString()) {
        token = idToken[0];
      }
    }
    console.log("Check tokenAcess 1: ",token);
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      "Content-Type": "application/json; charset=utf8" 
    });
    return this.http.put(`${this.url}/expenses/${epoch}`,expensesInput,{headers});
  }

  deletePaidMaterialUsage(epoch:any,id:any):Observable<any>{
    // let idToken = sessionStorage.getItem("id_Token");
    // const headers = new HttpHeaders({
    //   'Authorization': `${idToken}`,
    // });
    var tokenAcess = localStorage.getItem("securityAccess");
    var idToken;
    var token;
    if (tokenAcess != null) {
      idToken = tokenAcess.split('/');
      const now = new Date();
      if (idToken[1] <= now.getMinutes().toString()) {
        token = idToken[0];
      }
    }
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
    });
    return this.http.delete(`${this.url}/expenses/${epoch}/${id}`,{headers});
  }

}
