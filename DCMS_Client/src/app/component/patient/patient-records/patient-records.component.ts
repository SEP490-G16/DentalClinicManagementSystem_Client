import { Component, OnInit } from '@angular/core';
import {PatientService} from "../../../service/PatientService/patient.service";
import {IPatient} from "../../../model/IPatient";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {PopupAddPatientComponent} from "./popup-add-patient/popup-add-patient.component";
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.css']
})
export class PatientRecordsComponent implements OnInit {

  constructor(private patientService: PatientService,
              private toastr: ToastrService,
              private router: Router,
              private cognitoService:CognitoService,
              private modalService: NgbModal) { }
  patientList:any;
  searchPatientsList:any[]=[];
  pagingSearch = {
    paging:1,
    total:0
  }
  count:number=1;
  id:any;
  search:string='';
  ngOnInit(): void {
      this.getPatientList(this.pagingSearch.paging);
  }
  getPatientList( paging:number){
    this.patientService.getPatientList(paging).subscribe(patients=>{
      console.log(patients)
      this.patientList = patients.data;
      //this.totalPages = Math.ceil(this.patientList.length / this.itemsPerPage);
      this.searchPatientsList = this.patientList;
      if (this.patientList.length < 11){
        this.pagingSearch.total+=this.patientList.length;
      }
      else
      {
        this.pagingSearch.total=this.patientList.length;
      }
      console.log(this.pagingSearch.total)
      console.log(this.searchPatientsList)
    })
  }

  pageChanged(event: number) {
    this.pagingSearch.paging = event;
    console.log(this.pagingSearch.paging)
    this.getPatientList(this.pagingSearch.paging);
  }
  openDeletePatient(id:any,searchPatientsList:any){
    this.id=id;
    this.searchPatientsList = searchPatientsList;
  }

  detail(id: any) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate(['nhanvien/benhnhan/danhsach/tab/hosobenhnhan', id])
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate(['nhanvien/benhnhan/danhsach/tab/hosobenhnhan', id])
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate(['nhanvien/benhnhan/danhsach/tab/hosobenhnhan', id])
      } else if(userGroups.includes('dev-dcms-admin')){
        this.router.navigate(['admin/benhnhan/danhsach/tab/hosobenhnhan', id])
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
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
