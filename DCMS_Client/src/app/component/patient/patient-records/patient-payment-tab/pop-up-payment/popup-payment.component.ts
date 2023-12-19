import { TreatmentCourseDetailService } from './../../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConvertTimestamp } from 'src/app/service/Lib/ConvertDateToTimestamp';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { FacilityService } from 'src/app/service/FacilityService/facility.service';

@Component({
  selector: 'app-popup-payment-tab',
  templateUrl: './popup-payment.component.html',
  styleUrls: ['./popup-payment.component.css']
})
export class PopupPaymentComponent implements OnInit, OnChanges {
  @Input() MaterialUsage!: MaterialUsage[];
  @Input() TreatmentCourse: any
  @Input() Patient: any

  total: number = 0
  totalPaid: number = 0
  remaining: number = 0
  currentDate: string = ""
  paymentAmount:any;
  Body_Paid_MU: Paid_material_usage[] = [];

  constructor(
    private toastr: ToastrService,
    private examinationService: TreatmentCourseDetailService,
    private paidMaterialUsageService: PaidMaterialUsageService,
    private modalService: NgbModal,
    private facilityService: FacilityService
  ) {
    this.currentDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  }

  checkPayment: boolean = false;
  facility_name:any;
  ngOnInit(): void {
    this.MaterialUsage.sort((a: any, b: any) => {
      const dateA = new Date(a.created_date).getTime();
      const dateB = new Date(b.created_date).getTime();
      return dateB - dateA;
    })

    this.MaterialUsage.forEach((mu: any) => {
      if ((mu.mu_total - mu.mu_total_paid) != 0) {
        this.checkPayment = true;
        return;
      }
    })
    console.log("Material Usage Sort: ", this.MaterialUsage);
    this.totalPaid = this.MaterialUsage.reduce((acc: any, mu: any) => acc + (Number(mu.mu_total_paid) || 0), 0);
    this.total = this.MaterialUsage.reduce((acc: any, mu: any) => acc + (Number(mu.mu_total) || 0), 0);
    this.remaining = this.total - this.totalPaid;
    const facility = sessionStorage.getItem('locale');
    if (facility != null) {
      this.facilityService.getFacilityList().subscribe((data) => {
        var listFacility = data.data;
        listFacility.forEach((item:any) => {
          if (item.facility_id == facility) {
            this.facility_name = item.name;
          }
        })
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  receipt = {
    patient_id : "",
    payment_type: null ,
    receipt: [] as Paid_material_usage[]
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  validateAmount={
    soTien:''
  }
  isSubmittedAmout:boolean = false;
  resetValidateAmount(){
    this.validateAmount ={
      soTien: ''
    }
    this.isSubmittedAmout = false;
  }
  postPayment() {
    console.log("Material Usage: ", this.MaterialUsage)
    this.resetValidateAmount();
    if (!this.checkNumber(this.paymentAmount)  || this.paymentAmount > this.total){
      this.validateAmount.soTien = "Vui lòng nhập lại số tiền!";
      this.isSubmittedAmout = true;
    }
    if (this.isSubmittedAmout){
      return;
    }
    this.MaterialUsage.forEach((item:any) => {
      if (item.tempPaidAmount !=0 && item.tempPaidAmount != null && item.tempPaidAmount != undefined) {
        this.resetValidateAmount();
        if (!this.checkNumber(item.tempPaidAmount)){
          this.validateAmount.soTien = "Vui lòng nhập lại số tiền!";
          this.isSubmittedAmout = true;
        }
        if (this.isSubmittedAmout){
          return;
        }
        this.Body_Paid_MU.push({
          treatment_course_id: this.TreatmentCourse.tc_treatment_course_id,
          material_usage_id: item.mu_material_usage_id,
          total_paid: item.tempPaidAmount
        });
      }
    })
    // this.Body_Paid_MU = this.MaterialUsage.map(mu => ({
    //   treatment_course_id: this.TreatmentCourse.tc_treatment_course_id,
    //   material_usage_id: mu.mu_material_usage_id,
    //   total_paid: mu.tempPaidAmount || 0
    // }));
    console.log("Body_Paid_Mu: ", this.Body_Paid_MU);
    this.receipt = {
      patient_id : this.Patient.p_patient_id,
      payment_type: null,
      receipt: this.Body_Paid_MU
    }
    this.paidMaterialUsageService.postPaidMaterialUsage(this.receipt)
      .subscribe((res: any) => {
        this.toastr.success(res.message, "Thanh toán thành công!");
        window.location.reload();
      },
        (err) => {
          this.toastr.error(err.error.message, "Thanh toán thất bại!")
        })
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

interface MaterialUsage {
  created_date: string;
  description: string;
  mu_examination_id: string;
  mu_material_usage_id: string;
  mu_medical_procedure_id: string,
  material_warehouse_id: string;
  mu_price: number;
  mu_mpname:string;
  mu_quantity: number;
  mu_status: number;
  mu_total: number;
  mu_total_paid: number;
  treatment_course_id: string;
  tempPaidAmount?: number;
}

interface Paid_material_usage {
  treatment_course_id: string,
  material_usage_id: string,
  total_paid: number
}
