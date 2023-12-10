import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private api_url = 'https://a6ezx9f8g8.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }

  getExpense(startDate:number, endDate:number): Observable<any> {
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
    console.log("chech header:", headers);
    return this.http.get(`${this.api_url}/expenses/${startDate}/${endDate}`, { headers });
  }
}
