import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-popup-add-treatmentcourse',
  templateUrl: './popup-add-treatmentcourse.component.html',
  styleUrls: ['./popup-add-treatmentcourse.component.css']
})
export class PopupAddTreatmentcourseComponent implements OnInit, OnChanges {
  @Input() Patient_Id: any;
  TreatmentCourse: TreatmentCourse = {} as TreatmentCourse


  constructor() {
    this.Add_TreatmentCourse = {
      patient_id: "",
      description: "",
      status: 1,
      created_date: "",
      name: "",
    }
  }


  Add_TreatmentCourse: any;
  ngOnInit(): void {
  }

  ngOnChanges(changes:SimpleChanges): void {
    if(changes['Patient_Id']) {
      this.Add_TreatmentCourse.patient_id = this.Patient_Id;
    }
  }


  addTreatmentCourse() {
    console.log(this.Add_TreatmentCourse);
  }
}
