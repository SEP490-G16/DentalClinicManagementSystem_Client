import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";

@Component({
  selector: 'app-popup-edit-treatmentcourse',
  templateUrl: './popup-edit-treatmentcourse.component.html',
  styleUrls: ['./popup-edit-treatmentcourse.component.css']
})
export class PopupEditTreatmentcourseComponent implements OnInit {
  @Input() TreatmentCourse: any;


  constructor(
    private treatmentCourseService:TreatmentCourseService,
    private toastr: ToastrService
  ) {
    this.Edit_TreatmentCourse = {
      patient_id: "",
      description: "",
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
        name: this.TreatmentCourse.name,
      }
    }
  }


  editTreatmentCourse() {
    console.log(this.Edit_TreatmentCourse);
    this.treatmentCourseService.putTreatmentCourse(this.TreatmentCourse.treatment_course_id, this.Edit_TreatmentCourse)
    .subscribe((res) => {
        this.toastr.success(res.message, "Sửa Lịch trình điều trị");
        window.location.reload();
    },
    (error) => {
      //this.toastr.error(err.error.message, "Sửa Lịch trình điều trị thất bại");
      ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl+"/treatment-course/"+this.TreatmentCourse.treatment_course_id, error);
    }
    )
  }

}
