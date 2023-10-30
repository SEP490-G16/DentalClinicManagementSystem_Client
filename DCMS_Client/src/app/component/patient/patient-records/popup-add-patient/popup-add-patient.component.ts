import { Component, OnInit } from '@angular/core';
import {PatientService} from "../../../../service/PatientService/patient.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-add-patient',
  templateUrl: './popup-add-patient.component.html',
  styleUrls: ['./popup-add-patient.component.css']
})
export class PopupAddPatientComponent implements OnInit {
  patient1:any={
    patientName:'',
    Email:'',
    Gender:0,
    phone_Number:'',
    Address:'',
    full_medical_History:'',
    dental_medical_History:'',
    dob:''
  }
  constructor(private patientService:PatientService,
              private toastr: ToastrService) { }
  patientBody:any={
    patient_name:'',
    email:'',
    gender:0,
    phone_number:'',
    address:'',
    full_medical_history:'',
    dental_medical_history:'',
    date_of_birth:''
  }
  ngOnInit(): void {
  }
  addPatient(){
    this.patientBody={
        /*patient_id:this.patient.patient_id,*/
        patient_name:this.patient1.patientName,
        email:this.patient1.Email,
        gender:this.patient1.Gender,
        phone_number:this.patient1.phone_Number,
        address:this.patient1.Address,
        full_medical_history:this.patient1.full_medical_History,
        dental_medical_history:this.patient1.dental_medical_History,
      date_of_birth:this.patient1.dob
    }
    this.patientService.addPatient(this.patientBody).subscribe(data=>{
      this.toastr.success('Thêm mới bệnh nhân thành công!');
      let ref = document.getElementById('cancel');
      ref?.click();
      window.location.reload();
    },error => {
      this.toastr.error('Thêm mới bệnh nhân thất bại!');
    })
  }
}
