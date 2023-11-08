import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Examination } from 'src/app/model/ITreatmentCourseDetail';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-popup-edit-examination',
  templateUrl: './popup-edit-examination.component.html',
  styleUrls: ['./popup-edit-examination.component.css']
})
export class PopupEditExaminationComponent implements OnInit {

  imageURL: string | ArrayBuffer = 'https://www.cignodental.com/wp-content/uploads/2021/03/are_dental_x_rays_safe_greenfield_wi.jpeg';


  patient_Id: string = "";
  treatmentCourse_Id:string = "";
  examinationId:string = "";
  examination:Examination = {} as Examination;

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private tcDetailService: TreatmentCourseDetailService,
  ) {

    this.examination.created_date = new Date().toISOString().substring(0, 10);
  }

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];
    this.examinationId =  this.route.snapshot.params['examinationId'];
    console.log("Patient Id", this.patient_Id);
    console.log("Treatment Id", this.treatmentCourse_Id);
    console.log("Examination Id", this.treatmentCourse_Id);

    this.getExamination();
  }

  getExamination() {
    this.tcDetailService.getExamination(this.examinationId)
    .subscribe((data) => {
        console.log("data: ", data);
    },
    (err) => {
      this.showErrorToast('Lỗi khi lấy dữ liệu lần khám');
    })
  }


  putExamination() {
    this.tcDetailService.putExamination(this.examinationId,this.examination)
    .subscribe(() => {
        this.showSuccessToast('Sửa lần khám thành công');
    },
    (err) => {
      this.showErrorToast('Sửa lần khám thất bại');
    })

  }


  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
        this.examination.xRayImage = this.imageURL; // Di chuyển dòng này vào đây
        console.log(this.examination.xRayImage);
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
