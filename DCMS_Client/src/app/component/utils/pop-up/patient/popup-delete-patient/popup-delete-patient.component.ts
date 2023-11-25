import { Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { PatientService } from "../../../../../service/PatientService/patient.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-popup-delete-patient',
  templateUrl: './popup-delete-patient.component.html',
  styleUrls: ['./popup-delete-patient.component.css']
})
export class PopupDeletePatientComponent implements OnInit, OnChanges {
  @Output() patientDeleted: EventEmitter<void> = new EventEmitter<void>();
  @Input() patientList: any;
  @Input() id: any;
  constructor(private patientService: PatientService,
    private toastr: ToastrService) { }

  ngOnInit(): void {

  }
  patientId: any;
  deletePatient() {
    this.patientService.deletePatient(this.patientId).subscribe(data => {
      let ref = document.getElementById('cancel-patient');
      ref?.click();
      this.toastr.success('Xoá bệnh nhân thành công !');
      this.patientDeleted.emit();
    },
      error => {
        this.toastr.error('Xoá bệnh nhân thất bại!');
      }
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.patientId = this.id;
    }
  }
}
