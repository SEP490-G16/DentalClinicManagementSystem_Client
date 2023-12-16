import {Component, Input, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FacilityService} from "../../../../../service/FacilityService/facility.service";

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
  facility_name:any;
  constructor(private modalService: NgbModal,private facilityService: FacilityService) { }

  ngOnInit(): void {
    console.log(this.receiptDetails)
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
