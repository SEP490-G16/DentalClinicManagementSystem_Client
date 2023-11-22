import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {PatientService} from "../../../../../service/PatientService/patient.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-delete-patient',
  templateUrl: './popup-delete-patient.component.html',
  styleUrls: ['./popup-delete-patient.component.css']
})
export class PopupDeletePatientComponent implements OnInit,OnChanges {
  @Input() patientList:any;
  @Input() id:any;
  constructor(private patientService:PatientService,
              private toastr:ToastrService) { }

  ngOnInit(): void {

  }
  patientId:any;
  deletePatient(){
    this.patientService.deletePatient(this.patientId).subscribe(data=>{
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
      //window.location.reload();
      },
      error => {
        this.toastr.error('Xoá bệnh nhân thất bại!');
      }
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id){
      this.patientId = this.id;
    }
  }
}
