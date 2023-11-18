import { TreatmentCourseDetailService } from './../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { ITreatmentCourse } from './../../../../model/ITreatment-Course';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { treatementCourseDSService } from './../../../../service/Data-Sharing/Treatment-Course-Detail.service';
import { ITreatmentCourseDetail, TreatmentCourseDetail } from 'src/app/model/ITreatmentCourseDetail';
import { CommonService } from 'src/app/service/commonMethod/common.service';
@Component({
  selector: 'app-patient-lichtrinhdieutri',
  templateUrl: './patient-lichtrinhdieutri.component.html',
  styleUrls: ['./patient-lichtrinhdieutri.component.css']
})
export class PatientLichtrinhdieutriComponent implements OnInit {
  id: string = "";
  examinations: any;
  ITreatmentCourse: any;

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private treatmentCourseService: TreatmentCourseService,
    private commonService: CommonService,
    private TreatmentCourseDetailService: TreatmentCourseDetailService,
  ) { }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.id);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getTreatmentCourse();
  }


  getTreatmentCourse() {
    this.treatmentCourseService.getTreatmentCourse(this.id)
      .subscribe((data) => {
        console.log("Treatment course: ", data);
        this.ITreatmentCourse = data;
        console.log("Data nhan", this.ITreatmentCourse)
        this.ITreatmentCourse.sort((a: any, b: any) => {
          const dateA = new Date(a.created_date).getTime();
          const dateB = new Date(b.created_date).getTime();
          return dateB - dateA;
        });
      }
      )
  }

  getExamination(courseId: string) {
    if (this.ITreatmentCourse.length > 0) {
      this.TreatmentCourseDetailService.getTreatmentCourseDetail(courseId)
        .subscribe(data => {
          console.log("Examination: ", data.data);
          this.examinations = data.data;
          console.log("Data nhan", this.examinations);
        })
    }
  }

  TreatmentCourse: any;
  editTreatmentCourse(course: any) {
    this.TreatmentCourse = course;
  }

  deleteTreatmentCourse(treatment_course_id: string) {
    console.log("course treatment id", treatment_course_id);
    const cf = confirm('Bạn có muốn xóa lộ trình này không?');
    if (cf) {
      this.treatmentCourseService.deleteTreatmentCourse(treatment_course_id)
        .subscribe((res) => {
          this.toastr.success(res.message, 'Xóa liệu trình thành công');
          window.location.reload();
        },
          (err) => {
            this.toastr.error(err.error.message, 'Xóa liệu trình thất bại');
          }
        )
    }
  }

  deleteExamination(examination_id: string) {
    const cf = confirm('Bạn có muốn xóa lần khám này không?');
    if (cf) {
      this.TreatmentCourseDetailService.deleteExamination(examination_id)
        .subscribe(() => {
          this.toastr.success('Xóa Lần khám thành công!');
          window.location.reload();
        },
          (err) => {
            this.toastr.error(err.error.message, "Xóa lần khám thất bại!");
          })
    }
  }

  TreatmentCourseDetail: any;
  navigateTreatmentCourse_Detail(examination: any) {
    const TreatmentCourseDetail: TreatmentCourseDetail = examination;
    this.TreatmentCourseDetail = TreatmentCourseDetail;
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/chitiet/' + examination.examination_id]);
  }

  navigateAddExamination(tcId: string) {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/themlankham/' + tcId]);
  }

  navigateEditExamination(examination: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/sualankham/' + examination.treatment_course_id + '/' + examination.examination_id]);
  }

}
