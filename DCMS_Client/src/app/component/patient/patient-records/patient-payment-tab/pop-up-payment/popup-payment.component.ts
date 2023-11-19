import { TreatmentCourseDetailService } from './../../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConvertTimestamp } from 'src/app/service/Lib/ConvertDateToTimestamp';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
@Component({
  selector: 'app-popup-payment-tab',
  templateUrl: './popup-payment.component.html',
  styleUrls: ['./popup-payment.component.css']
})
export class PopupPaymentComponent implements OnInit, OnChanges {
  @Input() MaterialUsage: any
  @Input() TreatmentCourse:any
  @Input() Patient:any

  currentDate: string = ""
  constructor(
    private toastr:ToastrService,
    private examinationService:TreatmentCourseDetailService,
    private modalService: NgbModal
  ) {
    this.currentDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    console.log("Material :", this.MaterialUsage);
    console.log("Patient :", this.Patient);
    console.log("TreatmentCourse :", this.TreatmentCourse);
    this.MaterialUsage.sort((a:any, b:any) => {
        const dateA = new Date(a.created_date).getTime();
        const dateB = new Date(b.created_date).getTime();
        return dateB - dateA;
    })
    console.log("Material Usage Sort: ", this.MaterialUsage);
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

// interface MaterialUsage {
//   created_date: string;
//   description: string;
//   examination_id: string;
//   material_usage_id: string;
//   material_warehouse_id: string;
//   price: number;
//   quantity: number;
//   status: number;
//   total: number;
//   total_paid: number;
//   treatment_course_id: string;
// }
