import { TreatmentCourseDetailService } from './../../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConvertTimestamp } from 'src/app/service/Lib/ConvertDateToTimestamp';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { FacilityService } from 'src/app/service/FacilityService/facility.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';

@Component({
  selector: 'app-popup-payment-tab',
  templateUrl: './popup-payment.component.html',
  styleUrls: ['./popup-payment.component.css']
})
export class PopupPaymentComponent implements OnInit, OnChanges {
  @Input() MaterialUsage!: any;
  TreatmentCourse: any
  @Input() Patient: any

  MaterialUsageDisplay: MaterialUsage[] = []
  total: number = 0
  totalPaid: number = 0
  remaining: number = 0
  currentDate: string = ""
  paymentAmount: any;
  Body_Paid_MU: Paid_material_usage[] = [];

  constructor(
    private toastr: ToastrService,
    private examinationService: TreatmentCourseDetailService,
    private paidMaterialUsageService: PaidMaterialUsageService,
    private modalService: NgbModal,
    private facilityService: FacilityService,
    private materialUsageService: MaterialUsageService
  ) {
    this.currentDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  }

  oldTotal: any
  oldTotalPaid: any
  oldRemaining: any


  checkPayment: boolean = false;
  facility_name: any;
  ngOnInit(): void {
    console.log("material usage: ", this.MaterialUsage);
    this.MaterialUsageDisplay = this.MaterialUsage.map((item: any) => item.mu_data).flat();
    this.TreatmentCourse = this.MaterialUsage.map((item: any) => item.tc_data).flat();
    console.log("Material Usage Display : ", this.MaterialUsageDisplay);
    this.MaterialUsageDisplay.sort((a: any, b: any) => {
      const dateA = new Date(a.created_date).getTime();
      const dateB = new Date(b.created_date).getTime();
      return dateB - dateA;
    })

    this.MaterialUsageDisplay.forEach((mu: any) => {
      if ((mu.mu_total - mu.mu_total_paid) != 0) {
        this.checkPayment = true;
        return;
      }
    })
    console.log("Material Usage Display Sort: ", this.MaterialUsageDisplay);
    console.log("TreatmentCourse: ", this.TreatmentCourse);
    this.totalPaid = this.MaterialUsageDisplay.reduce((acc: any, mu: any) => acc + (Number(mu.mu_total_paid) || 0), 0);
    this.oldTotalPaid = this.totalPaid;
    this.total = this.MaterialUsageDisplay.reduce((acc: any, mu: any) => acc + (Number(mu.mu_total) || 0), 0);
    this.oldTotal = this.total;
    this.remaining = this.total - this.totalPaid;
    this.oldRemaining = this.remaining;
    const facility = sessionStorage.getItem('locale');
    if (facility != null) {
      this.facilityService.getFacilityList().subscribe((data) => {
        var listFacility = data.data;
        listFacility.forEach((item: any) => {
          if (item.facility_id == facility) {
            this.facility_name = item.name;
          }
        })
      })
    }

    this.MaterialUsage.forEach((usage: any) => {
      usage.mu_data.forEach((mu: any) => {
        const chietkhau = mu.mu_description.split(" ")[2];
        if (chietkhau) {
          mu.chietkhau = parseInt(chietkhau);
          mu.mu_price = ((mu.mu_price * 100) / (100 - mu.chietkhau));
        } else {
          mu.chietkhau = 0;
        }
      });
    });
    console.log("Final Material Usage: ", this.MaterialUsage);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }


  updateTotalandRemaining(MaterialUsage: any) {
   this.total = 0;
   this.remaining = 0;
    this.MaterialUsage.forEach((parent: any) => {
      parent.mu_data.forEach((mu: any) => {
        if (mu.mu_material_usage_id == MaterialUsage.mu_material_usage_id) {
          this.total += Number(this.calculateChietKhau(mu.mu_price, mu.mu_quantity, mu.chietkhau));
        } else {
          this.total += Number(((mu.mu_price * (100 - mu.chietkhau)) / 100) * mu.mu_quantity);
        }
      });
    });
    this.remaining = this.total - this.totalPaid;
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  calculateChietKhau(price: number, quantity: number, chietkhau: number) {
    return ((price * quantity * (100 - chietkhau)) / 100).toFixed(2);
  }

  calculateDiscount(price: number, mu: any) {
    const initialPriceStr = mu.mu_description.split(" ")[1];
    const intital = initialPriceStr ? parseInt(initialPriceStr) : 0;

    if (intital == 0) {
      return 0;
    }
    // Calculate the discount; ensure not to divide by zero
    if (intital == price) {
      return 0;
    }

    return (100 - ((price / intital) * 100)).toFixed(1);
  }

  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
  validateAmount = {
    soTien: ''
  }
  isSubmittedAmout: boolean = false;
  resetValidateAmount() {
    this.validateAmount = {
      soTien: ''
    }
    this.isSubmittedAmout = false;
  }

  receipt = {
    patient_id: "",
    payment_type: null,
    receipt: [] as Paid_material_usage[]
  }

  changePaymentAmount() {
    console.log("Payment  amount: " ,this.paymentAmount);
  }

  postPayment() {

    console.log("Material Usage Display: ", this.MaterialUsageDisplay)
    this.resetValidateAmount();
    if (!this.checkNumber(this.paymentAmount) || this.paymentAmount > this.total) {
      this.validateAmount.soTien = "Vui lòng nhập lại số tiền!";
      this.isSubmittedAmout = true;
    }
    if (this.isSubmittedAmout) {
      return;
    }

    // this.MaterialUsageDisplay.forEach((item:any) => {
    //   if (item.tempPaidAmount !=0 && item.tempPaidAmount != null && item.tempPaidAmount != undefined) {
    //     this.resetValidateAmount();
    //     if (!this.checkNumber(item.tempPaidAmount)){
    //       this.validateAmount.soTien = "Vui lòng nhập lại số tiền!";
    //       this.isSubmittedAmout = true;
    //     }
    //     if (this.isSubmittedAmout){
    //       return;
    //     }
    //   }
    // })


    //total_paid = 0 thay cho null;
    this.MaterialUsage.forEach((parent: any) => {
      parent.mu_data.forEach((mu_data: any) => {
        const amountDue = mu_data.mu_total - mu_data.mu_total_paid;
        let total_paid;
        if (this.paymentAmount >= amountDue) {
          total_paid = amountDue;
          this.paymentAmount -= amountDue;
        } else {
          total_paid = this.paymentAmount;
          this.paymentAmount = 0;
        }

        let body = {
          treatment_course_id: parent.tc_data.tc_treatment_course_id,
          material_usage_id: mu_data.mu_material_usage_id,
          total_paid: total_paid
        };

        if (amountDue > 0) {
          this.Body_Paid_MU.push(body);
        }
        console.log("Chietkhau: ", mu_data.chietkhau);
        if (mu_data.chietkhau !== 0 && mu_data.chietkhau != "") {
          let Body_MaterialUsage = {
            material_usage_id: mu_data.mu_material_usage_id,
            medical_procedure_id: mu_data.mu_medical_procedure_id,
            treatment_course_id: parent.tc_data.tc_treatment_course_id,
            quantity: mu_data.mu_quantity,
            price: ((mu_data.mu_price * (100 - mu_data.chietkhau)) / 100).toFixed(2),
            total_paid: body.total_paid,
            description: mu_data.mu_description + ` ${mu_data.chietkhau}`
          }
          this.materialUsageService.putMaterialUsage(Body_MaterialUsage.material_usage_id, Body_MaterialUsage).subscribe((res) => {
            this.toastr.success(res.message, "Sửa Material Usage thành công!");
          });
        }
      });
    });
    this.receipt = {
      patient_id: this.Patient.p_patient_id,
      payment_type: null,
      receipt: this.Body_Paid_MU
    }
    this.paidMaterialUsageService.postPaidMaterialUsage(this.receipt)
      .subscribe((res: any) => {
        this.toastr.success(res.message, "Thanh toán thành công!");
        // alert();
        window.location.reload();
      },
        (err) => {
          this.toastr.error(err.error.message, "Thanh toán thất bại!")
        })
  }

  @ViewChild('pdfContent') pdfContent!: ElementRef;
  generateExDetailPdf() {
    html2canvas(this.pdfContent.nativeElement, { scale: 0.5 }).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jsPDF('p', 'mm', 'a4');
      var width = pdf.internal.pageSize.getWidth();
      var maxHeight = 200;
      var height = canvas.height * width / canvas.width;
      height = Math.min(height, maxHeight);
      pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);

      window.open(pdf.output('bloburl'), '_blank');
    });
  }


  close() {
    this.modalService.dismissAll('Modal closed');
  }

  dismiss() {
    this.modalService.dismissAll('Cross click');
  }
  convertToFormattedDate(dateString: string): string {
    const dateObject = new Date(dateString);

    if (isNaN(dateObject.getTime())) {
      return '';
    }

    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1; // Tháng bắt đầu từ 0
    const day = dateObject.getDate();

    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  }
}

interface Paid_material_usage {
  treatment_course_id: string,
  material_usage_id: string,
  total_paid: number
}

interface MaterialUsage {
  created_date: string;
  description: string;
  mu_examination_id: string;
  mu_material_usage_id: string;
  mu_medical_procedure_id: string,
  material_warehouse_id: string;
  mu_price: number;
  mu_mpname: string;
  mu_quantity: number;
  mu_status: number;
  mu_total: number;
  mu_total_paid: number;
  treatment_course_id: string;
  tempPaidAmount?: number;
  chietkhau: number;
}

