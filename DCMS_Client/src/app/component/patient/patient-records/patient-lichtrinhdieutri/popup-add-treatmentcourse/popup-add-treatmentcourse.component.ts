import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-popup-add-treatmentcourse',
  templateUrl: './popup-add-treatmentcourse.component.html',
  styleUrls: ['./popup-add-treatmentcourse.component.css']
})
export class PopupAddTreatmentcourseComponent implements OnInit {

  Add_TreatmentCourse = {
    patient_id: "",
    description: "",
    name: "",
  };
  Patient_Id :string = "";
  constructor(
    private treatmentCourseService: TreatmentCourseService,
    private methodService:CommonService,
    private toastr:ToastrService,
    private route:ActivatedRoute,
    private router:Router
  ) {
  }


  ngOnInit(): void {
    this.Patient_Id = this.route.snapshot.params['id'];
  }


  addTreatmentCourse() {
    console.log(this.Add_TreatmentCourse);
    this.Add_TreatmentCourse.patient_id = this.Patient_Id;
    this.treatmentCourseService.postTreatmentCourse(this.Add_TreatmentCourse).
      subscribe((res) => {
        console.log(res);
        this.toastr.success(res.message, "Thêm liệu trình thành công");
        this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.Patient_Id + '/themlankham/' + res.treatment_course_id])
        // window.location.reload();
      },
        (err) => {
          this.methodService.showToast(err.error.message, "Thêm liệu trình thất bại", 2);
          console.log(err.error.message);
        }
      )
  }

}
