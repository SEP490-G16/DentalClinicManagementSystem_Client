import { IAddAppointment } from './../../model/IAppointment';
import { CognitoService } from '../cognito.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  public test = 'https://gf4tlb2kyi.execute-api.ap-southeast-1.amazonaws.com/dev';

  private patientListSubject = new BehaviorSubject<any[]>([]);
  public patientList$: Observable<any[]> = this.patientListSubject.asObservable();

  constructor(private http: HttpClient) { }
  getPatientPhoneNumber(sdt: string): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    console.log("id token", idToken);
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.test}/patient/phone-number/${sdt}`, { headers });
  }
  getPatientList(paging: number): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.test}/patient/name/${paging}`, { headers });
  }
  getPatientById(id: string) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Accept': 'application/json'
    });
    return this.http.get(`${this.test}/patient/${id}`, { headers })
  }
  deletePatient(id: string) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete(`${this.test}/patient/${id}`, { headers });
  }
  updatePatientListAfterDeletion(deletedPatientId: string) {
    const currentList = this.patientListSubject.value; // Nếu currentList ban đầu là [], sẽ vẫn là []
    const updatedList = currentList.filter(p => p.patient_id !== deletedPatientId);
    this.patientListSubject.next(updatedList); // Nếu updatedList rỗng, bạn sẽ cập nhật một danh sách rỗng
  }

  getPatientByName(name: string, paging: number): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.test}/patient/name/${name}/${paging}`, { headers });
  }
  updatePatient(patient: any, id: any) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
    });
    const requestBody = JSON.stringify(patient);
    return this.http.put(`${this.test}/patient/${id}`, requestBody, { headers });
  }
  addPatient(patient: any) {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });
    const requestBody = JSON.stringify(patient);
    return this.http.post(`${this.test}/patient`, requestBody, { headers });
  }

  getPatientTotal(): Observable<any> {
    let idToken = sessionStorage.getItem("id_Token");
    const headers = new HttpHeaders({
      'Authorization': `${idToken}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.test}/patient/total-patient`, { headers });
  }
}
