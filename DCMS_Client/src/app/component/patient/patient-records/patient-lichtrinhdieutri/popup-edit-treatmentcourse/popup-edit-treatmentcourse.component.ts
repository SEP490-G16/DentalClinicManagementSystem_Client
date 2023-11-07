import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-popup-edit-treatmentcourse',
  templateUrl: './popup-edit-treatmentcourse.component.html',
  styleUrls: ['./popup-edit-treatmentcourse.component.css']
})
export class PopupEditTreatmentcourseComponent implements OnInit {
  @Input() TreatmentCourse: any;


  constructor() {
    this.Edit_TreatmentCourse = {
      patient_id: "",
      description: "",
      status: 1,
      created_date: "",
      name: "",
    }
  }


  Edit_TreatmentCourse: any;
  ngOnInit(): void {
  }

  ngOnChanges(changes:SimpleChanges): void {
    if(changes['TreatmentCourse'].currentValue != undefined) {
      this.Edit_TreatmentCourse = {
        patient_id: this.TreatmentCourse.patient_id,
        description: this.TreatmentCourse.description,
        status: this.TreatmentCourse.status,
        created_date: this.TreatmentCourse.created_date.split(' ')[0],
        name: this.TreatmentCourse.name,
      }
    }
  }


  editTreatmentCourse() {
    console.log(this.Edit_TreatmentCourse);

  }

}
