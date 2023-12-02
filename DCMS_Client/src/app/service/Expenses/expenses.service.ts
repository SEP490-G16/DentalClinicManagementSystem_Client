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
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json'
    });

    return this.http.get(`${this.api_url}/expenses/${startDate}/${endDate}`, { headers });
  }
}
