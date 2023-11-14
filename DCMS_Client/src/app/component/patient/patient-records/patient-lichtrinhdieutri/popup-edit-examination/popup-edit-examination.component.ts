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
      facility_id: "F-14",
      description: "",
      staff_id: "",
      xRayImageDes: "",
      medicine: ""

    } as Examination;
  }

  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate([href + this.patient_Id]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate([href + this.patient_Id]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate([href + this.patient_Id]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate([href + this.patient_Id]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
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
    this.examination.facility_id = "F-14";
    this.tcDetailService.getExamination(this.examinationId)
      .subscribe((data) => {
        console.log("data: ", data);
        this.examination = data.data[0];
        this.examination.created_date = this.examination.created_date.split(" ")[0];

        this.staff_id = this.examination.staff_id;
        console.log("examination: ", this.examination);

      },
        (err) => {
          this.toastr.error(err.error.message,'Lỗi khi lấy dữ liệu lần khám');
        })
  }



  putExamination() {

    console.log("Put Examination: ", this.examination);
    this.examination.staff_id = this.staff_id;
    this.tcDetailService.putExamination(this.examinationId, this.examination)
      .subscribe((res) => {
        this.toastr.success(res.message,'Sửa lần khám thành công');

        // setTimeout(() => {
        //   this.router.navigate([''])
        // }, 3000);
      },
        (err) => {
          this.toastr.error(err.error.message,'Sửa lần khám thất bại');
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


}
