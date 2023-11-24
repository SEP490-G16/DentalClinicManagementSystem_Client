import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import html2canvas from 'html2canvas';
//import jsPDF from 'jspdf';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';

@Component({
  selector: 'app-popup-examination-detail',
  templateUrl: './popup-examination-detail.component.html',
  styleUrls: ['./popup-examination-detail.component.css']
})
export class PopupExaminationDetailComponent implements OnInit {
  @Input() MaterialUsage!: MaterialUsage;
  @Input() TreatmentCourse: any
  @Input() Patient: any
  currency: any;
  total: number = 0
  totalPaid: number = 0
  remaining: number = 0
  currentDate: string = ""

  Body_Paid_MU: Paid_material_usage[] = [];

  constructor(
    private toastr: ToastrService,
    private examinationService: TreatmentCourseDetailService,
    private paidMaterialUsageService: PaidMaterialUsageService,
    private modalService: NgbModal
  ) {
    this.currentDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    console.log("Material :", this.MaterialUsage);
    console.log("Patient :", this.Patient);
    console.log("TreatmentCourse :", this.TreatmentCourse);
    console.log("Material Usage Sort: ", this.MaterialUsage);

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  @ViewChild('pdfContent') pdfContent!: ElementRef;
  generateExDetailPdf() {
    // html2canvas(this.pdfContent.nativeElement, { scale: 0.5 }).then(canvas => {
    //   const contentDataURL = canvas.toDataURL('image/png');
    //   let pdf = new jsPDF('p', 'mm', 'a4');
    //   var width = pdf.internal.pageSize.getWidth();
    //   var maxHeight = 200;
    //   var height = canvas.height * width / canvas.width;
    //   height = Math.min(height, maxHeight);
    //   pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);

    //   window.open(pdf.output('bloburl'), '_blank');
    // });
  }

  close() {
    this.modalService.dismissAll('Modal closed');
  }

  dismiss() {
    this.modalService.dismissAll('Cross click');
  }

}

interface MaterialUsage {
  mu_created_date: string;
  description: string;
  mu_examination_id: string;
  mu_material_usage_id: string;
  mu_medical_procedure_id: string,
  material_warehouse_id: string;
  mu_price: number;
  mu_quantity: number;
  mu_status: number;
  mu_total: number;
  mu_total_paid: number;
  treatment_course_id: string;
  tempPaidAmount?: number;
}

interface Paid_material_usage {
  material_usage_id: string,
  examination_id: string,
  total_paid: number
}
