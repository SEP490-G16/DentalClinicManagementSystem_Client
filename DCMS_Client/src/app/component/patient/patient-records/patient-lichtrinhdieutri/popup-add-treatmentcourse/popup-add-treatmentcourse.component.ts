import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-popup-add-treatmentcourse',
  templateUrl: './popup-add-treatmentcourse.component.html',
  styleUrls: ['./popup-add-treatmentcourse.component.css']
})
export class PopupAddTreatmentcourseComponent implements OnInit, OnChanges {
  @Input() Patient_Id: any;
  TreatmentCourse: TreatmentCourse = {} as TreatmentCourse


  constructor(
    private treatmentCourseService: TreatmentCourseService,
    private toastr: ToastrService
  ) {
    this.Add_TreatmentCourse = {
      patient_id: "",
      description: "",
      name: "",
    }
  }


  Add_TreatmentCourse: any;
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Patient_Id']) {
      this.Add_TreatmentCourse.patient_id = this.Patient_Id;
    }
  }


  addTreatmentCourse() {
    console.log(this.Add_TreatmentCourse);
    this.treatmentCourseService.postTreatmentCourse(this.Add_TreatmentCourse).
      subscribe((res) => {
        this.showSuccessToast("Thêm lịch trình điều trị thành công");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
        (err) => {
          this.showErrorToast("Thêm lịch trình điều trị thất bại");

        }
      )
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }
}
