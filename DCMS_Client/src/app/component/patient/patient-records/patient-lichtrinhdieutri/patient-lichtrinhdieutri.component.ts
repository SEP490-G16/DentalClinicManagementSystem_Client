import { TreatmentCourseDetailService } from './../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteModalComponent } from 'src/app/component/utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
@Component({
  selector: 'app-patient-lichtrinhdieutri',
  templateUrl: './patient-lichtrinhdieutri.component.html',
  styleUrls: ['./patient-lichtrinhdieutri.component.css']
})
export class PatientLichtrinhdieutriComponent implements OnInit {
  loading: boolean = false;

  id: string = "";
  examinations: any;
  patientName:any;
  ITreatmentCourse: any[] = [];
  collapsedStates: { [key: string]: boolean } = {};
  roleId: string[] = []
  constructor(
    private cognitoService: CognitoService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private treatmentCourseService: TreatmentCourseService,
    private commonService: CommonService,
    private TreatmentCourseDetailService: TreatmentCourseDetailService,
    private modalService: NgbModal
  ) { }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.id);
  }
  name:any
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getTreatmentCourse();
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.name = sessionStorage.getItem('patient');
    if (this.name){
      this.name = JSON.parse(this.name);
      this.patientName = this.name.patient_name;
    }
  }


  getTreatmentCourse() {
    this.loading = true;
    this.treatmentCourseService.getTreatmentCourse(this.id)
      .subscribe((data) => {
        this.ITreatmentCourse = data;
        console.log("Treatment course: ", this.ITreatmentCourse);
        this.ITreatmentCourse.forEach((course: any) => {
          this.collapsedStates[course.treatment_course_id] = true; // Khởi tạo trạng thái collapsed
        });
        this.ITreatmentCourse.sort((a: any, b: any) => {
          const dateA = new Date(a.created_date).getTime();
          const dateB = new Date(b.created_date).getTime();
          return dateB - dateA;
        });
        this.loading = false;
      },
        error => {
          this.loading = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl + "/treatment-course/patient-id/" + this.id, error);
        }
      )
  }

  toggleStates: { [key: string]: boolean } = {};
  toggleCollapse(courseId: string) {
    if (this.toggleStates[courseId] === undefined) {
      this.toggleStates[courseId] = false;
    }

    this.toggleStates[courseId] = !this.toggleStates[courseId];
    this.TreatmentCourseDetailService.getTreatmentCourseDetail(courseId).subscribe(
      data => {
        this.examinations = data.data;
        console.log(this.examinations);
      },
      error => {
      }
    );
  }

  TreatmentCourse: any;
  editTreatmentCourse(course: any) {
    this.TreatmentCourse = course;
  }

  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  deleteTreatmentCourse(treatment_course_id: string) {
    this.openConfirmationModal('Bạn có muốn xóa đợt khám này không?').then((result) => {
      if (result === 'confirm') {
        this.treatmentCourseService.deleteTreatmentCourse(treatment_course_id)
          .subscribe((res) => {
            this.toastr.success(res.message, 'Xóa đợt khám thành công');
            const index = this.ITreatmentCourse.findIndex((ex: any) => ex.treatment_course_id === treatment_course_id);
            if (index !== -1) {
              this.ITreatmentCourse.splice(index, 1);
            }
            this.loading = false;

          },
            (error) => {
              //this.toastr.error(err.error.message, 'Xóa liệu trình thất bại');
              ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl + "/treatment-course/" + treatment_course_id, error);
            }
          )
      }
    });
  }


  deleteExamination(examination_id: string) {
    this.openConfirmationModal('Bạn có muốn xóa lần khám này không?').then((result) => {
      if (result === 'confirm') {
        this.TreatmentCourseDetailService.deleteExamination(examination_id)
          .subscribe(() => {
            this.toastr.success('Xóa Lần khám thành công!');

            const index = this.examinations.findIndex((ex: any) => ex.examination_id === examination_id);
            if (index !== -1) {
              this.examinations.splice(index, 1);
            }
            this.loading = false;

          },
            (error) => {
              //this.toastr.error(err.error.message, "Xóa lần khám thất bại!");
              ResponseHandler.HANDLE_HTTP_STATUS(this.TreatmentCourseDetailService.apiUrl + "/examination/" + examination_id, error);
            })
      }
    });
  }

  TreatmentCourseDetail: any;

  navigateAddExamination(tcId: string) {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/themlankham/' + tcId]);
  }

  navigateEditExamination(examination: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/sualankham/' + examination.treatment_course_id + '/' + examination.examination_id]);
  }

}
