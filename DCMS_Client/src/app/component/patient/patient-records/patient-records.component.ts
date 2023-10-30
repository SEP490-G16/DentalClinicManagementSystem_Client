import { Component, OnInit } from '@angular/core';
import {PatientService} from "../../../service/PatientService/patient.service";
import {IPatient} from "../../../model/IPatient";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";

@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.css']
})
export class PatientRecordsComponent implements OnInit {

  constructor(private patientService: PatientService,
              private toastr: ToastrService,
              private router: Router,) { }
  patientList:any;
  searchPatientsList:any;
  name:any;
  paging:any;
  id:any;
  search:string='';
  ngOnInit(): void {
    this.paging=1
    this.getPatientList(this.paging);
  }
  getPatientList( paging:number){
    this.patientService.getPatientList(paging).subscribe(patients=>{
      this.patientList = patients.data;
      this.searchPatientsList = this.patientList;
      console.log(this.patientList)
    })
  }
  deletePatient(id:string){
    this.patientService.deletePatient(id).subscribe(data=>{
      this.toastr.success('Xoá bệnh nhân thành công !');
      /*this.getPatientList(this.paging);*/
        this.patientList = this.patientList.filter((patient:any) => patient.patient_id !== id);
    },
      error => {
      this.toastr.error('Xoá bệnh nhân thất bại!');
      }
      )
  }
  detail(id: any) {
    this.router.navigate(['/patient/records/tab/profile', id])
  }
  searchPatient() {
    const search = this.search.toLowerCase().trim();
    if (search) {
      this.searchPatientsList = this.patientList
        .filter((patient:any) => {
          const patientName = patient.patient_name.toLowerCase();
          const patientId = patient.patient_id.toLowerCase();
          return patientName.includes(search) || patientId.includes(search);
        });
    } else {
      this.searchPatientsList = this.patientList;
    }
  }
}
