import { TreatmentCourseDetailService } from './../../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-popup-payment-tab',
  templateUrl: './popup-payment.component.html',
  styleUrls: ['./popup-payment.component.css']
})
export class PopupPaymentComponent implements OnInit, OnChanges {
  @Input() PMU:any
  @Input() Ex:any
  @Input() MU:any
  PatientPayment = {
    created_date: "",
    examination_id: "",
    material_usage_id: "",
    paid_material_usage_id: "",
    status: 1,
    total_paid: 0
  }
  staff_name = "";
  MaterialUsage:any;
  constructor(
    private toastr:ToastrService,
    private examinationService:TreatmentCourseDetailService
  ) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['PMU'] && changes['PMU'].currentValue) {
      this.PatientPayment = this.PMU;
    }
    if (changes['Ex'] && changes['Ex'].currentValue) {
      this.staff_name = this.Ex.staff_name;
    }
    if (changes['MU'] && changes['MU'].currentValue) {
      this.MaterialUsage = this.MU;
      console.log("Oki", this.MaterialUsage);
    }
  }


}
