import { Component, OnInit } from '@angular/core';
import {CommonService} from "../../../../service/commonMethod/common.service";
import {ActivatedRoute} from "@angular/router";
import {
  PopupExaminationDetailComponent
} from "../patient-payment-tab/popup-examination-detail/popup-examination-detail.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DetailReceiptsComponent} from "./detail-receipts/detail-receipts.component";

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptsComponent implements OnInit {

  constructor(private commonService: CommonService,private route: ActivatedRoute,private modalService: NgbModal) { }
  id:any;
  roleId: string[] = [];
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
  }
  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.id);
  }
  openPopupDetail(){
    const modalRef = this.modalService.open(DetailReceiptsComponent, { size: 'xl' });
  }
}
