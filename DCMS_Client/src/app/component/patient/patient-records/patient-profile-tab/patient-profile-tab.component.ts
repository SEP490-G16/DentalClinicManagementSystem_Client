import { Component, OnInit } from '@angular/core';
import {PatientService} from "../../../../service/PatientService/patient.service";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-patient-profile-tab',
  templateUrl: './patient-profile-tab.component.html',
  styleUrls: ['./patient-profile-tab.component.css']
})
export class PatientProfileTabComponent implements OnInit {

  constructor(private patientService:PatientService,
              private route:ActivatedRoute,
              private toastr: ToastrService) { }
  patient:any;
  id:any;
  patientBody:any={
    created_date: '',
    patient_name:'',
    gender:0,
    phone_number:'',
    email:'',
    address:'',
    dental_medical_history:'',
    description:''

  }
  ngOnInit(): void {
    this.id=this.route.snapshot.params['id'];
    this.getPatient(this.id);
  }
  imageURL: string | ArrayBuffer = '';

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }


  isEditing: boolean = false;

  toggleEditing() {
    this.isEditing = !this.isEditing;
    if (this.isEditing==false){
      console.log(this.isEditing)
      this.patientBody = {
        created_date: this.patient.created_date,
        patient_name: this.patient.patient_name,
        gender: this.patient.gender,
        phone_number: this.patient.phone_number,
        email: this.patient.email,
        address: this.patient.address,
        dental_medical_history: this.patient.dental_medical_history,
        description: this.patient.description
      }
      this.patientService.updatePatient(this.patientBody, this.id).subscribe(data=>{
        this.toastr.success('Cập nhật bệnh nhân thành công !')
      },error => {
        this.toastr.error('Cập nhật bệnh nhân thất bại!')
      })
    }

  }
  getPatient(id:string){
    this.patientService.getPatientById(id).subscribe(data=>{
      this.patient = data;
      console.log(data);
    })
  }

}
