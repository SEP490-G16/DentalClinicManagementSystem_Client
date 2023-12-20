import { ConvertTimestamp } from './../../../../service/Lib/ConvertDateToTimestamp';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupPaymentComponent } from './pop-up-payment/popup-payment.component';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import * as moment from 'moment';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
//import jsPDF from 'jspdf';
//import html2canvas from 'html2canvas';
import { PopupExaminationDetailComponent } from './popup-examination-detail/popup-examination-detail.component';

@Component({
  selector: 'app-patient-payment-tab',
  templateUrl: './patient-payment-tab.component.html',
  styleUrls: ['./patient-payment-tab.component.css']
})
export class PatientPaymentTabComponent implements OnInit {
  RoleId: any;
  Patient_Id: string = "";
  PatientInfor:any;
  TreatmentCourse:any
  currentDate: string = "";
  showDetails: { [key: string]: boolean } = {};
  Material_Usage_Report: any[] = [];
  roleId: string[] = [];
  patientName:any;
  name:any;
  totalPaid = {
    totalPrice: 0,
    totalPaid: 0,
    remaining: 0,
  }

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
    private toastr: ToastrService) {
    this.currentDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    let role = sessionStorage.getItem('role');
    if (role != null) {
      this.RoleId = role.split(',');
    }
    this.Patient_Id = this.route.snapshot.params['id'];
    const startDATE = 1698827581;
    const currentDATE = ConvertTimestamp.dateToTimestamp(moment().tz('Asia/Ho_Chi_Minh').add(1, 'days').format('YYYY-MM-DD'));
    console.log("CurrentDate: ", currentDATE);
    this.getMaterialUsageReport(startDATE, currentDATE);
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
  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }

  getMaterialUsageReport(startDATE: number, endDATE: number) {
    this.materialUsageService.getMaterialUsagePatientReport(this.Patient_Id)
      .subscribe((res: any) => {
        console.log("Data: ", res.data);
        this.Material_Usage_Report
          = res.data.filter((el: any) => el.p_data.p_patient_id === this.Patient_Id);
        console.log("Filter Material Report: ", this.Material_Usage_Report);

        // Group by treatment course ID
        const groupedReport = this.Material_Usage_Report.reduce((acc: { [key: string]: Report }, current: Report) => {
          const tcId = current.tc_data.tc_treatment_course_id;
          if (!acc[tcId]) {
            acc[tcId] = { ...current, mu_data: [] };
          }
          acc[tcId].mu_data = acc[tcId].mu_data.concat(current.mu_data);
          acc[tcId].mu_data = acc[tcId].mu_data.filter(item => item.mu_medical_procedure_id != null);
          return acc;
        }, {});

        this.Material_Usage_Report = Object.values(groupedReport);

        this.Material_Usage_Report.forEach(report => {
          this.PatientInfor = report.p_data;
          report.total = this.calculateTotal(report.mu_data);
          report.totalPaid = this.calculateTotalPaid(report.mu_data);
          report.remaining = report.total - report.totalPaid;
        });

        this.Material_Usage_Report.forEach(report => {
          this.totalPaid.totalPrice += this.calculateTotal(report.mu_data);
          this.totalPaid.totalPaid += this.calculateTotalPaid(report.mu_data);
          this.totalPaid.remaining = this.totalPaid.totalPrice - this.totalPaid.totalPaid;
        });

        console.log("Grouped Material Report: ", this.Material_Usage_Report);
      },
        (err) => {
          this.toastr.error(err.error.message, "Lấy Thông tin thanh toán thất bại")
        })
  }

  listTotal:any[] = [];
  calculateTotal(muData: any[]): number {
    this.listTotal = muData.filter(mu => mu.mu_material_warehouse_id == null);
    return this.listTotal.reduce((acc, current) => acc + current.mu_total, 0);
  }

  listTotalPay: any[] = [];
  calculateTotalPaid(muData: any[]): number {
    this.listTotalPay = muData.filter(mu => mu.mu_material_warehouse_id == null);
    return this.listTotalPay.reduce((acc, current) => acc + current.mu_total_paid, 0);
  }

  calculateRemaining(total: number, totalPaid: number): number {
    return this.getAbsoluteValue(total - totalPaid);
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  // toggleDetails(reportId: string): void {
  //   if (this.showDetails[reportId] === undefined) {
  //     this.showDetails[reportId] = false;
  //   }
  //   this.showDetails[reportId] = !this.showDetails[reportId];
  // }

  toggleDetails(): void {

  }

  // thanhtoan(materialUsage: any, treatmentCourse: any, patient: any) {
  //   const modalRef = this.modalService.open(PopupPaymentComponent, { size: 'xl' });
  //   modalRef.componentInstance.TreatmentCourse = treatmentCourse;
  //   modalRef.componentInstance.Patient = patient;
  //   modalRef.componentInstance.MaterialUsage = materialUsage;
  //   modalRef.result.then((result) => {
  //   }, (reason) => {

  //   });
  // }

  thanhtoan() {
      const modalRef = this.modalService.open(PopupPaymentComponent, { size: 'xl' });
      modalRef.componentInstance.MaterialUsage = this.Material_Usage_Report;
      modalRef.componentInstance.Patient = this.PatientInfor;
      modalRef.result.then((result) => {
      }, (reason) => {

      });
  }


  examinationDetail() {
    const modalRef = this.modalService.open(PopupExaminationDetailComponent, { size: 'xl' });
    modalRef.componentInstance.MaterialUsage = this.Material_Usage_Report;
    modalRef.componentInstance.Patient = this.PatientInfor;
    modalRef.result.then((result) => {
    }, (reason) => {

    });
  }

  @ViewChild('pdfContent') pdfContent!: ElementRef;
  generatePDF() {
    // html2canvas(this.pdfContent.nativeElement).then(canvas => {
    //   const contentDataURL = canvas.toDataURL('image/png');
    //   let pdf = new jsPDF('p', 'mm', 'a4');
    //   var width = pdf.internal.pageSize.getWidth();
    //   var height = canvas.height * width / canvas.width;
    //   pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);

    //   window.open(pdf.output('bloburl'), '_blank');
    // });
  }

  navigateHref(href: string) {
    this.router.navigate([href + this.Patient_Id]);
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
