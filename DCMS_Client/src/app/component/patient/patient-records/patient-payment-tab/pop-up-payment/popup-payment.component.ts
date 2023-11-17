import { TreatmentCourseDetailService } from './../../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  // PatientPayment = {
  //   created_date: "",
  //   examination_id: "",
  //   material_usage_id: "",
  //   paid_material_usage_id: "",
  //   status: 1,
  //   total_paid: 0
  // }
  MaterialUsage: MaterialUsage [];
  staff_name = "";
  totalSum:number = 0;
  totalPaid: number = 0;
  constructor(
    private toastr:ToastrService,
    private examinationService:TreatmentCourseDetailService,
    private modalService: NgbModal
  ) {
    this.MaterialUsage = []
  }

  ngOnInit(): void {
    // this.PatientPayment = this.PMU;
    // this.staff_name = this.Ex.staff_id;
    this.MaterialUsage = this.MU;

    this.MaterialUsage.sort((a:any, b:any) => {
        const dateA = new Date(a.created_date).getTime();
        const dateB = new Date(b.created_date).getTime();
        return dateB - dateA;
    })

    this.totalSum = this.MaterialUsage.reduce((sum, current) => {
      return sum + (current.total || 0);
    }, 0);

    this.totalPaid = this.MaterialUsage.reduce((sum, current) => {
      return sum + (current.total_paid || 0);
    }, 0);

    console.log("Material Usage: ", this.MaterialUsage);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  close() {
    this.modalService.dismissAll('Modal closed');
  }

  dismiss() {
    this.modalService.dismissAll('Cross click');
  }

}

interface MaterialUsage {
  created_date: string;
  description: string;
  examination_id: string;
  material_usage_id: string;
  material_warehouse_id: string;
  price: number;
  quantity: number;
  status: number;
  total: number;
  total_paid: number;
  treatment_course_id: string;
}
