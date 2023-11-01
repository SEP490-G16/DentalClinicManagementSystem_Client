import {Component, Input, OnInit} from '@angular/core';
import {PatientService} from "../../../../service/PatientService/patient.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-delete-patient',
  templateUrl: './popup-delete-patient.component.html',
  styleUrls: ['./popup-delete-patient.component.css']
})
export class PopupDeletePatientComponent implements OnInit {
  @Input() patientList:any;
  @Input() id:any;
  constructor(private patientService:PatientService,
              private toastr:ToastrService) { }

  ngOnInit(): void {

  }
  deletePatient(){
    this.patientService.deletePatient(this.id).subscribe(data=>{
        let ref = document.getElementById('cancel-patient');
        ref?.click();
        this.toastr.success('Xoá bệnh nhân thành công !');
        console.log(this.patientList);
        /*let modal = document.querySelector('.modal');
        console.log(modal);
        if (modal) {
          modal.setAttribute('style', 'display: none;');
        }*/

        const index = this.patientList.findIndex((patient:any) => patient.patient_id === this.id);
        if (index !== -1) {
          this.patientList.splice(index, 1);
        }
      },
      error => {
        this.toastr.error('Xoá bệnh nhân thất bại!');
      }
    )
  }
}
