import { Component, OnInit } from '@angular/core';
import { MedicalSupplyService } from "../../../service/MedicalSupplyService/medical-supply.service";
import { ToastrService } from "ngx-toastr";
import * as moment from 'moment-timezone';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";

@Component({
  selector: 'app-pending-specimens',
  templateUrl: './pending-specimens.component.html',
  styleUrls: ['./pending-specimens.component.css']
})
export class PendingSpecimensComponent implements OnInit {
  approveSpecimensList: any;
  constructor(private medicalSupplyService: MedicalSupplyService,
    private modalService: NgbModal,
    private toastr: ToastrService) { }
  status: any;
  paging: any;
  specimen: any;
  ngOnInit(): void {
    this.status = 1;
    this.paging = 1;
    this.getApproveSpecimensList(this.status, this.paging);

  }

  specimensBody = {
    name: '',
    type: '',
    quantity: '',
    unit_price: '',
    order_date: 0,
    orderer: '',
    received_date: 0,
    used_date: 0,
    receiver: '',
    facility_id: '',
    warranty: '',
    description: '',
    patient_id: '',
    labo_id: '',
    status: '',
  }
  id: any
  loading: boolean = false;
  approveSpecimens(id: any, medical: any) {
    this.id = id;
    this.specimensBody = {
      name: medical.ms_name,
      type: medical.ms_type,
      quantity: medical.ms_quantity,
      unit_price: medical.ms_unit_price,
      order_date: this.dateToTimestamp(medical.ms_order_date),
      orderer: medical.ms_orderer,
      received_date: medical.ms_received_date != '' ? this.dateToTimestamp(medical.ms_received_date) : 0,
      used_date: medical.ms_used_date != '' ? this.dateToTimestamp(medical.ms_used_date) : 0,
      receiver: medical.ms_receiver,
      facility_id: medical.facility_id,
      warranty: medical.ms_warranty,
      description: medical.ms_description,
      patient_id: medical.p_patient_id,
      labo_id: medical.lb_id,
      status: '2',
    }
    this.loading = true;
    this.medicalSupplyService.approveSpecimens(this.id, this.specimensBody).subscribe(data => {
      this.toastr.success('Duyệt mẫu thành công !');
      const index = this.approveSpecimensList.findIndex((medical: any) => medical.ms_id === this.id);
      if (index !== -1) {
        this.approveSpecimensList.splice(index, 1);
      }
      this.loading = false;
    },
      error => {
        this.loading = false;
        //this.toastr.error('Duyệt mẫu thất bại !');
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalSupplyService.url + "/medical-supply/" + id, error);
      }
    )
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

  getApproveSpecimensList(status: any, paging: any) {
    this.loading = true;
    this.medicalSupplyService.getApproveSpecimensList(status, paging).subscribe(data => {
      this.approveSpecimensList = data.data;
      this.loading = false;
      console.log(this.approveSpecimensList);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalSupplyService.url + "/medical-supply/status/" + status + "/" + paging, error);
      }
    )
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteApproveSpecimens(id: string, ms_name: string) {
    console.log(id);
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa mẫu ${ms_name} không?`).then((result) => {
      if (result) {
        this.medicalSupplyService.deleteApproveSpecimens(id)
          .subscribe((res) => {
            this.toastr.success('Xoá mẫu thành công !');
            const index = this.approveSpecimensList.findIndex((specimens: any) => specimens.ms_id === id);
            if (index !== -1) {
              this.approveSpecimensList.splice(index, 1);
            }
          },
            (error) => {
              //this.showErrorToast('Xóa mẫu vật thất bại');
              ResponseHandler.HANDLE_HTTP_STATUS(this.medicalSupplyService.url + "/medical-supply/" + id, error);
            }
          )
      }
    });

  }
  openEditApproveSpecimens(id: any, specimens: any) {
    this.id = id;
    this.specimen = specimens;
    console.log("CheckpatientId", specimens);
    return;
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
  showPopup: boolean = false;
  checkbox1: boolean = true;
  checkbox2: boolean = true;
  checkbox3: boolean = true;
  checkbox4: boolean = true;
  checkbox5: boolean = true;
  checkbox6: boolean = true;
  checkbox7: boolean = true;
  checkbox8: boolean = true;
  checkbox9: boolean = true;
  checkbox10: boolean = true;
  checkbox11: boolean = true;
  checkbox12: boolean = true;

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  toggleColumn(columnNumber: number): void {
    if (columnNumber === 1) {
      this.checkbox1 = !this.checkbox1;
      console.log(this.checkbox1)
    }
    if (columnNumber === 2) {
      this.checkbox2 = !this.checkbox2;
    }
    if (columnNumber === 3) {
      this.checkbox3 = !this.checkbox3;
    }
    if (columnNumber === 4) {
      this.checkbox4 = !this.checkbox4;
    }
    if (columnNumber === 5) {
      this.checkbox5 = !this.checkbox5;
    }
    if (columnNumber === 6) {
      this.checkbox6 = !this.checkbox6;
    }
    if (columnNumber === 7) {
      this.checkbox7 = !this.checkbox7;
    }
    if (columnNumber === 8) {
      this.checkbox8 = !this.checkbox8;
    }
    if (columnNumber === 9) {
      this.checkbox9 = !this.checkbox9;
    }
    if (columnNumber === 10) {
      this.checkbox10 = !this.checkbox10;
    }
    if (columnNumber === 11) {
      this.checkbox11 = !this.checkbox11;
    }
    if (columnNumber === 12) {
      this.checkbox12 = !this.checkbox12;
    }
  }
  hiddenPopup(): void {
    this.showPopup = false;
  }
}
