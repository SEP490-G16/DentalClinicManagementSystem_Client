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
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { ConfirmationModalComponent } from 'src/app/component/utils/pop-up/common/confirm-modal/confirm-modal.component';
import { ConfirmDeleteModalComponent } from 'src/app/component/utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptsComponent implements OnInit {
  ReceiptsList: any = [];
  patientId: any;
  Patient: any;
  roleId: string[] = [];
  patientName:any;
  name:any

  paymentType: any = '';
  constructor(private commonService: CommonService,
    private receiptsService: ReceiptsService,
    private patientService: PatientService,
    private paidMaterialUsageService: PaidMaterialUsageService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.getPatientInformation();
    this.getReceiptsByPatientId();
    this.name = sessionStorage.getItem('patient');
    if (this.name) {
      this.name = JSON.parse(this.name);
      this.patientName = this.name.patient_name;
      // sessionStorage.removeItem("patient");
    } else {
      this.patientService.getPatientById(this.patientId).subscribe((patient: any) => {
        console.log("Patient: ", patient);
        this.patientName = patient.patient_name;
        sessionStorage.setItem('patient', JSON.stringify(patient));
      },err => {
        this.toastr.error("Bệnh nhân có thể đã bị xóa và hiện không tồn tại trong hệ thống");
      })
    }
  }

  getPatientInformation() {
    this.patientService.getPatientById(this.patientId)
      .subscribe((res) => {
        console.log("Res Patient: ", res);
        this.Patient = res;
      })
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
  openPopupDetail(RecDetail:any,createDate:any, paymentType:any,patient:any) {
    this.listResult.splice(0, this.listResult.length);
    const modalRef = this.modalService.open(DetailReceiptsComponent, { size: 'xl' });
    RecDetail.forEach((item:any) => {
      if (item.p_total_paid != 0) {
        this.listResult.push(item);
      }
    })
    modalRef.componentInstance.receiptDetails = this.listResult;
    modalRef.componentInstance.createDate = createDate;
    modalRef.componentInstance.paymentType = paymentType;
    modalRef.componentInstance.Patient = patient;
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

  openConfirmationModal(message: string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmButtonText = 'Xác nhận thanh toán';
    modalRef.componentInstance.cancelButtonText = 'Hủy';

    return modalRef.result;
  }


  confirmPayment(RecDetail: any) {
    console.log("RecDetail: ", RecDetail);
    this.openConfirmationModal("Bạn có chắc chắn muốn thay đổi thời gian chấm công đến không?")
    .then((result) => {
      if (result === 'confirm') {
        // this.paidMaterialUsageService.postPaidMaterialUsage()
      } else {

      }
    });
  }

  openDeleteModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteReceipt(Receipt:any) {
    this.openDeleteModal(`Bạn có chắc chắn muốn xóa phiếu thu ${Receipt.r_receipt_id} không?`).then((result) => {
      if (result === true) {
          this.receiptsService.deleteReceipt(Receipt.r_receipt_id)
          .subscribe((res) => {
            this.toastr.success(`Xóa phiếu thu ${Receipt.r_receipt_id} thành công`, "Xóa phiếu thu");
            window.location.reload();
          },
          (error) => {
            this.toastr.error(`Xóa phiếu thu ${Receipt.r_receipt_id} thất bại`, "Xóa phiếu thu");
          }
          )
      }
    });
  }

  calculateTotalPayment(details: any[]): number {
    return details.reduce((acc, detail) => acc + (detail.p_total_paid), 0);
  }

  convertToFormattedDate(dateString: string): string {
    if (!dateString || dateString === '0000-00-00 00:00:00' || dateString.toLowerCase() === 'null') {
      return '';
    }

    const dateObject = new Date(dateString);

    if (isNaN(dateObject.getTime())) {
      return '';
    }

    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1; // Tháng bắt đầu từ 0
    const day = dateObject.getDate();

    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.patientId);
  }
}
