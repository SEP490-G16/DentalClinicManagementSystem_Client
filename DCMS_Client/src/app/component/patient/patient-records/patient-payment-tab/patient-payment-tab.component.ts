import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, switchMap } from 'rxjs';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupPaymentComponent } from './pop-up-payment/popup-payment.component';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
@Component({
  selector: 'app-patient-payment-tab',
  templateUrl: './patient-payment-tab.component.html',
  styleUrls: ['./patient-payment-tab.component.css']
})
export class PatientPaymentTabComponent implements OnInit {
  id: string = "";
  PaidMaterialUsage: any;
  facility: any;
  Total:number = 0;
  Total_Paid: number = 0;
  PMU: any;
  Material_Usage: Material_Usage[] = [];

  TreatmentCourse: any;
  TreatmentCourseId = [];
  Examination: any[] = [];

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private router: Router,
    private treatmentCourse_PatientService: TreatmentCourseService,
    private examinationService: TreatmentCourseDetailService,
    private paidMaterialUsage: PaidMaterialUsageService,
    private materialUsageService: MaterialUsageService,
    private modalService: NgbModal,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    const fa = sessionStorage.getItem("locale");
    if (sessionStorage.getItem("locale")) {
      this.facility = fa;
    }

    // this.getPaidMaterialUsage();
    this.getMaterialUsage_By_TreatmentCourse();
  }

  getMaterialUsage_By_TreatmentCourse() {
    this.treatmentCourse_PatientService.getTreatmentCourse(this.id)
      .subscribe((data) => {
        console.log("Get TreatmentCourse of Patient: ", data);
        this.TreatmentCourse = data;
        this.TreatmentCourse.sort((a: any, b: any) => {
          const dateA = new Date(a.created_date).getTime();
          const dateB = new Date(b.created_date).getTime();
          return dateB - dateA;
        })
        this.TreatmentCourseId = data.map((d: any) => d.treatment_course_id);
        console.log("Lưu các Treatmentcourse: ", this.TreatmentCourseId);

        //Lấy examination của Treatment Course đó:
        // this.TreatmentCourseId.forEach(element => {
        //   this.examinationService.getTreatmentCourseDetail(element)
        //   .subscribe((res) => {
        //     console.log("res: ", res.data);
        //     this.Examination.push(res.data);
        //   })
        // });
        this.TreatmentCourseId.forEach((treatmentCourseId) => {
          //Fix cứng TreatmentCourseId để test
          // this.materialUsageService.getMaterialUsage_By_TreatmentCourse(treatmentCourseId)
          this.materialUsageService.getMaterialUsage_By_TreatmentCourse("T-00000001")
            .subscribe((res) => {
              // console.log("treatment course: ", res.data);
              res.data.forEach((material: any) => {
                this.Material_Usage.push(material);
              });
              console.log("Material Usage: ", this.Material_Usage);
              this.Material_Usage.sort((a: any, b: any) => {
                const dateA = new Date(a.created_date).getTime();
                const dateB = new Date(b.created_date).getTime();
                return dateB - dateA;
              })
              this.Total = this.Material_Usage.reduce((sum, current) => {
                return sum + (current.total || 0);
              }, 0);

              this.Total_Paid = this.Material_Usage.reduce((sum, current) => {
                return sum + (current.total_paid || 0);
              }, 0);
            },
              (err) => {
                this.toastr.error(err.error.message, "Lỗi trong việc lấy danh sách Material By Treatment Couse")
              }
            )
        })
      });
  }


  getPaidMaterialUsage(exId: string) {
    this.paidMaterialUsage.getPaidMaterialUsageExamination(exId)
      .subscribe((datas) => {
        console.log("Datas", datas);
        this.PaidMaterialUsage = datas.data;

        //Tổng chi phí
        let totalPaidSum = 0;
        datas.data.forEach((data: any) => {
          if (data && data.total_paid) {
            totalPaidSum += data.total_paid;
          }
        });
        console.log("Total Paid Sum:", totalPaidSum);

        this.Total = totalPaidSum;

      },
        (err) => {
          this.toastr.error(err.error.message, "Nhận dữ liệu Thanh toán thất bại");
        }
      )
  }

  async thanhtoan(mu: any) {
    try {
      // this.PMU = pmu;
      const examinationResponse = await this.examinationService.getExamination(mu.examination_id).toPromise();
      this.Examination = examinationResponse.data[0];
      console.log("Examination", this.Examination);

      console.log("", mu);
      const modalRef = this.modalService.open(PopupPaymentComponent, { size: 'xl' });
      modalRef.componentInstance.Ex = this.Examination;
      modalRef.componentInstance.MU = mu;

      modalRef.result.then((result) => {
      }, (reason) => {

      });
    } catch (error) {
      console.error(error);
    }
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate([href + this.id]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate([href + this.id]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate([href + this.id]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate([href + this.id]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }
}

interface Material_Usage {
  material_usage_id: string,
  material_warehouse_id: string,
  treatment_course_id: string,
  examination_id: string,
  quantity: number,
  price: number,
  total: number,
  total_paid: number,
  description: string,
  status: string,
  created_date: string,
}
