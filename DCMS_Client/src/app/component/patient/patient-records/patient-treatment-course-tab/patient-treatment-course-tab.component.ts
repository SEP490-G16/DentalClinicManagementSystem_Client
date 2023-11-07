import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseDetail } from 'src/app/model/ITreatmentCourseDetail';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-patient-treatment-course-tab',
  templateUrl: './patient-treatment-course-tab.component.html',
  styleUrls: ['./patient-treatment-course-tab.component.css']
})
export class PatientTreatmentCourseTabComponent implements OnInit {

  imageURL: string | ArrayBuffer = 'https://www.cignodental.com/wp-content/uploads/2021/03/are_dental_x_rays_safe_greenfield_wi.jpeg';


  patient_Id: string = "";
  examination_Id: string = "";

  treatmentCourseDetail: TreatmentCourseDetail = {} as TreatmentCourseDetail;

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private tcDetailService: TreatmentCourseDetailService,
  ) { }

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    console.log("Patient Id", this.patient_Id);

    this.examination_Id = this.route.snapshot.params['examinationId'];
    console.log("ExaminationId: ", this.examination_Id);

    this.getTreatmentCourseDetail();

  }

  getTreatmentCourseDetail() {
    this.tcDetailService.getExamination(this.examination_Id)
      .subscribe((arr) => {
        console.log("Detail DATA ", arr);
        this.treatmentCourseDetail = arr.data[0];
        console.log("Treametn course detail: ", this.treatmentCourseDetail);
        this.treatmentCourseDetail.created_date = this.treatmentCourseDetail.created_date.split(" ")[0];
        // console.log(this.TreatmentCourseDetail.created_date);
        // console.log(typeof this.TreatmentCourseDetail.created_date);

        // this.cognitoService.getUserBySub(this.treatmentCourseDetail.staff_id);

        if (this.treatmentCourseDetail.xRayImage != null) {
          this.imageURL = this.treatmentCourseDetail.xRayImage;
        }
      })
  }

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
        this.treatmentCourseDetail.xRayImage = this.imageURL; // Di chuyển dòng này vào đây
        console.log(this.treatmentCourseDetail.xRayImage);
      };

      reader.readAsDataURL(file);
    }
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
