import { ITreatmentCourse } from './../../../../model/ITreatment-Course';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-patient-lichtrinhdieutri',
  templateUrl: './patient-lichtrinhdieutri.component.html',
  styleUrls: ['./patient-lichtrinhdieutri.component.css']
})
export class PatientLichtrinhdieutriComponent implements OnInit {
  id: string = "";

  ITreatmentCourse: ITreatmentCourse = [];

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private treatmentCourseService: TreatmentCourseService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    // this.getTreatmentCourse();

    this.ITreatmentCourse = [
      {
        "treatment_course_id": "T-00000001",
        "patient_id": "P-000001",
        "description": "Mô tả điều trị",
        "status": 1,
        "created_date": "2023-10-26 19:02:42",
        "name": "Điều trị răng"
      }
    ]

  }



  getTreatmentCourse() {
    this.treatmentCourseService.getTreatmentCourse(this.id)
      .subscribe((data) => {
        console.log(data);

      },
        (err) => {
          this.showErrorToast(err.message);
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

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }

}
