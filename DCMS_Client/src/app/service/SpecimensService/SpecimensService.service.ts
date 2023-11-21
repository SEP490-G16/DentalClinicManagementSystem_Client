import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PutSpecimen } from 'src/app/model/ISpecimens';

@Injectable({
  providedIn: 'root'
})
export class SpecimensService {
  public apiUrl = 'https://o0pwf246i1.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private cognitoService:CognitoService) { }

  getSpecimens(paging:number):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
      return this.http.get(`${this.apiUrl}/medical-supply/status/${2}/${paging}`, { headers });
  }

  async getSpecimensAsync(paging: number): Promise<any> {
    const idToken = sessionStorage.getItem('id_Token');
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });

    try {
      const response = await this.http.get(`${this.apiUrl}/medical-supply/status/${2}/${paging}`, { headers }).toPromise();
      return response;
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      throw error;
    }
  }
;
  filterSpecimens(querySearch:string, paging:number):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json',
    });
      return this.http.get(`${this.apiUrl}/medical-supply/search?querySearch?paging=${paging}`, { headers });
  }

  // postSpecimens(PostLabo: IPostLabo): Observable<any> {
  //   let idToken = sessionStorage.getItem("id_Token");
  //   const headers = new HttpHeaders({
  //     'Authorization': `${idToken}`,
  //     "Content-Type": "application/json; charset=utf8"
  //   });
  //   const requestBody = JSON.stringify(PostLabo);
  //   return this.http.post(`${this.apiUrl}/labo`, requestBody, { headers });
  // }

  putSpecimens(id:string, PutSpecimens:PutSpecimen): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      "Content-Type": "application/json; charset=utf8"
    });
    const requestBody = JSON.stringify(PutSpecimens);
    return this.http.put(`${this.apiUrl}/medical-supply/${id}`, requestBody, { headers });
  }

  deleteSpecimens(specimenId:string):Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");

    const headers = new HttpHeaders({
      'Authorization': `${idToken}`
    });
      return this.http.delete(`${this.apiUrl}/medical-supply/${specimenId}`, { headers });
  }
}

//https://o0pwf246i1.execute-api.ap-southeast-1.amazonaws.com/dev
