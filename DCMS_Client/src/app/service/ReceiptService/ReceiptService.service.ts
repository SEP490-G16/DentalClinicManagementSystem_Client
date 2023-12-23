import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptsService {
  private api_url = 'https://6565l2zhpg.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient) { }

  getReceiptByPatientId(patientId:string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json'
    });

    return this.http.get(`${this.api_url}/receipt/patient/${patientId}`, { headers });
  }

  putReceiptByPatientId(receiptId:any, paymentType:any): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json'
    });
    const payment_type = JSON.stringify({"payment_type": paymentType, "status": "2"});
    return this.http.put(`${this.api_url}/receipt/${receiptId}`, payment_type,{ headers });
  }

  deleteReceipt(id:any):Observable<any>{
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type':'application/json'
    });
    return this.http.delete(`${this.api_url}/receipt/${id}`,{headers});
  }
}
