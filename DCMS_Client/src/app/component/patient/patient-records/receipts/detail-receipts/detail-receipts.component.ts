import {Component, Input, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-detail-receipts',
  templateUrl: './detail-receipts.component.html',
  styleUrls: ['./detail-receipts.component.css']
})
export class DetailReceiptsComponent implements OnInit {
  receiptDetails: any;
  @Input() createDate: any
  @Input() paymentType:any;
  @Input() Patient:any;
  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    console.log(this.receiptDetails)
  }

  getTotalDebtTotal(): number {
    return this.receiptDetails.reduce((acc:any, detail:any) => acc + detail.mu_total, 0);
  }

  getTotalPayment(): number {
    return this.receiptDetails.reduce((acc:any, detail:any) => acc + detail.p_total_paid, 0);
  }

  getTotalRemain(): number {
    return this.receiptDetails.reduce((acc:any, detail:any) => acc + (detail.mu_total - detail.p_total_paid), 0);
  }

  close() {
    this.modalService.dismissAll('Modal closed');
  }

  dismiss() {
    this.modalService.dismissAll('Cross click');
  }
}
