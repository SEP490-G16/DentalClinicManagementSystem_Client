import { Component, OnInit } from '@angular/core';
import { CommonService } from "../../../../service/commonMethod/common.service";
import { ActivatedRoute } from "@angular/router";
import {
  PopupExaminationDetailComponent
} from "../patient-payment-tab/popup-examination-detail/popup-examination-detail.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DetailReceiptsComponent } from "./detail-receipts/detail-receipts.component";
import { ReceiptsService } from 'src/app/service/ReceiptService/ReceiptService.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptsComponent implements OnInit {
  ReceiptsList:any = [];
  patientId: any;
  roleId: string[] = [];
  patientName:any;
  name:any

  paymentType: any = '';
  constructor(private commonService: CommonService,
    private receiptsService: ReceiptsService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.getReceiptsByPatientId();
    this.name = sessionStorage.getItem('patient');
    if (this.name){
      this.name = JSON.parse(this.name);
      this.patientName = this.name.patient_name;
    }
  }

  getReceiptsByPatientId() {
    this.receiptsService.getReceiptByPatientId(this.patientId)
      .subscribe((res) => {
        this.ReceiptsList = res.data;
        console.log("Res: ", this.ReceiptsList);
      },
        (err) => {
          this.toastr.error(err.error.message, "Láy hóa đơn của bệnh nhân thất bại");
        })
  }

  listResult:any[] = [];
  openPopupDetail(RecDetail:any) {
    this.listResult.splice(0, this.listResult.length);
    const modalRef = this.modalService.open(DetailReceiptsComponent, { size: 'xl' });
    RecDetail.forEach((item:any) => {
      if (item.p_total_paid != 0) {
        this.listResult.push(item);
      }
    })
    modalRef.componentInstance.receiptDetails = this.listResult;
  }

  confirmPaymentCast(rec:any) {
    this.receiptsService.putReceiptByPatientId(rec.r_receipt_id, "1").subscribe((data) =>{
      this.ReceiptsList.forEach((item:any) => {
        if (item.r_receipt_id == rec.r_receipt_id) {
          item.r_payment_type = 1;
          item.r_status = 2;
        }
      })
    })
  }

  confirmPaymentTrans(rec:any) {
    this.receiptsService.putReceiptByPatientId(rec.r_receipt_id, "2").subscribe((data) =>{
      this.ReceiptsList.forEach((item:any) => {
        if (item.r_receipt_id == rec.r_receipt_id) {
          item.r_payment_type = 2;
          item.r_status = 2;
        }
      })
    })
  }

  calculateTotalPayment(details: any[]): number {
    return details.reduce((acc, detail) => acc + (detail.p_total_paid), 0);
  }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.patientId);
  }
}
