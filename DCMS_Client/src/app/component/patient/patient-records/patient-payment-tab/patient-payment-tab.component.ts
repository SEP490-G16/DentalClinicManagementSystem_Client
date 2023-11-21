import { ConvertTimestamp } from './../../../../service/Lib/ConvertDateToTimestamp';
import { Patient } from './../../../../model/IPatient';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupPaymentComponent } from './pop-up-payment/popup-payment.component';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import * as moment from 'moment';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
@Component({
  selector: 'app-patient-payment-tab',
  templateUrl: './patient-payment-tab.component.html',
  styleUrls: ['./patient-payment-tab.component.css']
})
export class PatientPaymentTabComponent implements OnInit {
  Patient_Id: string = "";
  Material_Usage_Report: any[] = [];
  showDetails: boolean = false;

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
    this.Patient_Id = this.route.snapshot.params['id'];

    const startDATE = 1697771019;
    const currentDATE = ConvertTimestamp.dateToTimestamp(moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'));
    console.log("CurrentDate: ", currentDATE);
    this.getMaterialUsageReport(startDATE, currentDATE);
  }

  getMaterialUsageReport(startDATE: number, endDATE: number) {
    this.materialUsageService.getMaterialUsageReport(startDATE, endDATE)
      .subscribe((res: any) => {
        console.log("Material usage Report: ", res.data);
        this.Material_Usage_Report
          = res.data.filter((el: any) => el.p_data.p_patient_id === this.Patient_Id);
        console.log("Filter Material Report: ", this.Material_Usage_Report);

        // Group by treatment course ID
        const groupedReport = res.data.reduce((acc: { [key: string]: Report }, current: Report) => {
          const tcId = current.tc_data.tc_treatment_course_id;
          if (!acc[tcId]) {
            acc[tcId] = { ...current, mu_data: [] };
          }
          acc[tcId].mu_data = acc[tcId].mu_data.concat(current.mu_data);
          return acc;
        }, {});

        // Convert the grouped object back to array
        this.Material_Usage_Report = Object.values(groupedReport);

        // calculate the totals for each grouped entry
        this.Material_Usage_Report.forEach(report => {
          report.total = this.calculateTotal(report.mu_data);
          report.totalPaid = this.calculateTotalPaid(report.mu_data);
          report.remaining = report.total - report.totalPaid;
        });

        console.log("Grouped Material Report: ", this.Material_Usage_Report);
      },
        (err) => {
          this.toastr.error(err.error.message, "Lấy Thông tin thanh toán thất bại")
        })
  }

  calculateTotal(muData: any[]): number {
    return muData.reduce((acc, current) => acc + current.mu_total, 0);
  }

  calculateTotalPaid(muData: any[]): number {
    return muData.reduce((acc, current) => acc + current.mu_total_paid, 0);
  }

  calculateRemaining(total: number, totalPaid: number): number {
    return this.getAbsoluteValue(total - totalPaid);
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }


  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  thanhtoan(materialUsage: any, treatmentCourse: any, patient: any) {
    const modalRef = this.modalService.open(PopupPaymentComponent, { size: 'xl' });
    modalRef.componentInstance.TreatmentCourse = treatmentCourse;
    modalRef.componentInstance.Patient = patient;
    modalRef.componentInstance.MaterialUsage = materialUsage
    modalRef.result.then((result) => {
    }, (reason) => {

    });
  }

  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate([href + this.Patient_Id]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate([href + this.Patient_Id]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate([href + this.Patient_Id]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate([href + this.Patient_Id]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }

}


interface Report {
  mu_data: Mu[]
  tc_data: TcData
  p_data: ProcedureData
}

export interface Mu {
  mu_material_usage_id: string
  mu_material_warehouse_id?: string
  mu_medical_procedure_id?: string
  mu_examination_id: string
  mu_quantity: number
  mu_price: number
  mu_total: number
  mu_total_paid: number
  mu_description: any
  mu_status: number
  mu_created_date: string
}

export interface TcData {
  tc_treatment_course_id: string
  tc_description: string
  tc_status: number
  tc_created_date: string
  tc_name: string
}

export interface ProcedureData {
  p_patient_id: string
  p_patient_name: string
  p_date_of_birth: string
  p_gender: number
  p_phone_number: string
  p_full_medical_history: any
  p_dental_medical_history: string
  p_email: string
  p_address: string
  p_description: string
  p_profile_image: any
  p_active: number
  p_created_date: string
}
