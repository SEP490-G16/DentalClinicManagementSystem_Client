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


  patient_Id:string = "";
  treatmentCourse_Id:string = "";

  TreatmentCourseDetail:TreatmentCourseDetail = {} as TreatmentCourseDetail;

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route:ActivatedRoute,
    private tcDetailService:TreatmentCourseDetailService,
  ) { }

  ngOnInit(): void {
    this.patient_Id=this.route.snapshot.params['id'];
    console.log("Patient Id", this.patient_Id);

    this.treatmentCourse_Id=this.route.snapshot.params['treatmentCourseId'];
    console.log("TreatmentCourse Id", this.treatmentCourse_Id);

    this.getTreatmentCourseDetail();

  }

  getTreatmentCourseDetail() {
    this.tcDetailService.getTreatmentCourseDetail(this.treatmentCourse_Id)
    .subscribe((arr) => {
      console.log("Detail DATA ", arr);
      this.TreatmentCourseDetail = arr.data[0];
      console.log("Treametn course detail: " ,this.TreatmentCourseDetail);
      this.TreatmentCourseDetail.created_date = this.TreatmentCourseDetail.created_date.split(" ")[0];
      // console.log(this.TreatmentCourseDetail.created_date);
      // console.log(typeof this.TreatmentCourseDetail.created_date);

            this.cognitoService.getUserBySub(this.TreatmentCourseDetail.staff_id);

      if(this.TreatmentCourseDetail.xRayImage != null) {
        this.imageURL = this.TreatmentCourseDetail.xRayImage;
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
        this.TreatmentCourseDetail.xRayImage = this.imageURL; // Di chuyển dòng này vào đây
        console.log(this.TreatmentCourseDetail.xRayImage);
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
