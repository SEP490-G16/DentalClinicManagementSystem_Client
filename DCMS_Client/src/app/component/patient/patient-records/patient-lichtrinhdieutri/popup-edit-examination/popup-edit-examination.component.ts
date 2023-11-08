import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITreatmentCourse } from 'src/app/model/ITreatment-Course';
import { Examination } from 'src/app/model/ITreatmentCourseDetail';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-popup-edit-examination',
  templateUrl: './popup-edit-examination.component.html',
  styleUrls: ['./popup-edit-examination.component.css']
})
export class PopupEditExaminationComponent implements OnInit {

  imageURL: string | ArrayBuffer = 'https://www.cignodental.com/wp-content/uploads/2021/03/are_dental_x_rays_safe_greenfield_wi.jpeg';


  patient_Id: string = "";
  treatmentCourse_Id: string = "";
  examinationId: string = "";

  treatmentCourse: ITreatmentCourse = [];
  examination: Examination;

  staff_id:string = "";

  doctors = [
    {
      doctorid: "ad2879dd-626c-4ade-8c95-da187af572ad",
      doctorName: "Thế"
    }
  ]

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private tcService: TreatmentCourseService,
    private tcDetailService: TreatmentCourseDetailService,
  ) {
    this.examination = {
      treatment_course_id: "",
      diagnosis: "",
      xRayImage: "",
      created_date: "",
      facility_id: "",
      description: "",
      staff_id: "",
      xRayImageDes: "",
      medicine: ""

    } as Examination;
  }

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];
    this.examinationId = this.route.snapshot.params['examinationId'];
    console.log("Patient Id", this.patient_Id);
    console.log("Treatment Id", this.treatmentCourse_Id);
    console.log("Examination Id", this.examinationId);

    this.getTreatmentCourse();
    this.getExamination();
  }

  getTreatmentCourse() {
    this.tcService.getTreatmentCourse(this.patient_Id)
      .subscribe((data) => {
        console.log("data treatment: ", data);
        this.treatmentCourse = data;
        console.log("treatment course: ", this.treatmentCourse);
      })
  }

  getExamination() {
    this.tcDetailService.getExamination(this.examinationId)
      .subscribe((data) => {
        console.log("data: ", data);
        this.examination = data.data[0];
        this.examination.created_date = this.examination.created_date.split(" ")[0];

        this.staff_id = this.examination.staff_id;
        console.log("examination: ", this.examination);

      },
        (err) => {
          this.showErrorToast('Lỗi khi lấy dữ liệu lần khám');
        })
  }



  putExamination() {

    console.log("Put Examination: ", this.examination);
    this.examination.staff_id = this.staff_id;
    console.log(this.examination)
    this.tcDetailService.putExamination(this.examinationId, this.examination)
      .subscribe(() => {
        this.showSuccessToast('Sửa lần khám thành công');

        // setTimeout(() => {
        //   this.router.navigate([''])
        // }, 3000);
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
