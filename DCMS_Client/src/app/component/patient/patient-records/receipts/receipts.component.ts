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

  confirmPayment() {

  }

  calculateTotalPayment(details: any[]): number {
    return details.reduce((acc, detail) => acc + (detail.p_total_paid), 0);
  }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.patientId);
  }
}
