import { Router } from '@angular/router';
import { SpecimensService } from '../../../../../service/SpecimensService/SpecimensService.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PutSpecimen } from 'src/app/model/ISpecimens';
import { CognitoService } from 'src/app/service/cognito.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { PatientService } from "../../../../../service/PatientService/patient.service";
import * as moment from 'moment';
import { FormatNgbDate } from '../../../libs/formatNgbDate';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Normalize } from 'src/app/service/Lib/Normalize';

@Component({
  selector: 'app-popup-edit-specimens',
  templateUrl: './popup-edit-specimens.component.html',
  styleUrls: ['./popup-edit-specimens.component.css']
})
export class PopupEditSpecimensComponent implements OnInit {
  @Input() Patient_Id: any
  @Input() PutSpecimen: any;
  @Input() AllLabos: any;
  isCallApi: boolean = false;
  loading: boolean = false;
  IPutSpecimens: PutSpecimen;
  orderDateNgbModal!: NgbDateStruct;
  receiverDateNgbModal!: NgbDateStruct;
  usedDateNgbModal!: NgbDateStruct;
  warrantyDateNgbModal!: NgbDateStruct;
  Labos: any;
  id: string = "";
  status: string = "0";
  total: number = 0;
  disable:boolean = false;
  constructor(
    private toastr: ToastrService,
    private cognitoService: CognitoService,
    private SpecimensService: SpecimensService,
    private patientService: PatientService,

    private router: Router

  ) {
    this.IPutSpecimens = {
      ms_type: "",
      ms_name: "",
      ms_quantity: 0,
      ms_unit_price: 0,
      ms_order_date: "",
      ms_orderer: "",
      ms_received_date: "",
      ms_receiver: "",
      ms_use_date: "",
      ms_warranty: "",
      ms_description: "",
      ms_status: 0,
      facility_id: "",
      lb_id: null,
      p_patient_id: "",
      p_patient_name: ""
    } as PutSpecimen;
  }
  putSpecimensBody = {
    name: '',
    type: '',
    quantity: 0,
    unit_price: 0,
    order_date: '',
    orderer: '',
    received_date: '',
    receiver: '',
    used_date: '',
    warranty: '',
    description: '',
    status: 2,
    facility_id: '',
    labo_id: '',
    patient_id: ''
  }
  validatePutSpecimens = {
    name: '',
    type: '',
    orderDate: '',
    receivedDate: '',
    useDate: '',
    labo: '',
    quantity: '',
    unitPrice: '',
    order: '',
    patient: ''
  }
  isSubmitted: boolean = false;
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['PutSpecimen'].currentValue) {
      this.IPutSpecimens.ms_name = this.PutSpecimen.ms_name;
      this.IPutSpecimens.ms_type = this.PutSpecimen.ms_type;
      this.IPutSpecimens.ms_unit_price = this.PutSpecimen.ms_unit_price;
      this.IPutSpecimens.ms_quantity = this.PutSpecimen.ms_quantity;
      this.IPutSpecimens.ms_orderer = this.PutSpecimen.ms_orderer;
      this.IPutSpecimens.lb_id = this.PutSpecimen.lb_id;
      let faci = sessionStorage.getItem('locale');
      if (faci != null) {
        this.IPutSpecimens.facility_id = faci;
      }
      // this.IPutSpecimens.facility_id = 'F-08'

      const orderDateParts = this.PutSpecimen.ms_order_date?.split(' ')[0].split('-').map(Number);
      const receivedDateParts = this.PutSpecimen.ms_received_date?.split(' ')[0].split('-').map(Number);
      const usedDateParts = this.PutSpecimen.ms_used_date?.split(' ')[0].split('-').map(Number);
      const warrantyDateParst = this.PutSpecimen.ms_warranty?.split(' ')[0].split('-').map(Number);

      if (orderDateParts && orderDateParts.length === 3) {
        this.orderDateNgbModal = { year: orderDateParts[0], month: orderDateParts[1], day: orderDateParts[2] };
      }

      if (receivedDateParts && receivedDateParts.length === 3) {
        this.receiverDateNgbModal = { year: receivedDateParts[0], month: receivedDateParts[1], day: receivedDateParts[2] };
      }

      if (usedDateParts && usedDateParts.length === 3) {
        this.usedDateNgbModal = { year: usedDateParts[0], month: usedDateParts[1], day: usedDateParts[2] };
      }

      if (warrantyDateParst && warrantyDateParst.length === 3) {
        this.warrantyDateNgbModal = { year: warrantyDateParst[0], month: warrantyDateParst[1], day: warrantyDateParst[2] };
      }
      this.getPatient(this.PutSpecimen.p_patient_id);
      this.IPutSpecimens.ms_status = this.PutSpecimen.ms_status;
      this.id = this.PutSpecimen.ms_id;
      console.log("Ms status: ", this.IPutSpecimens);
      this.calculateTotal(this.IPutSpecimens)
    }
    if (changes['AllLabos']) {
      this.Labos = this.AllLabos;
    }
  }

  calculateTotal(IPutSpecimens: any) {
    this.total = parseInt(IPutSpecimens.ms_quantity) * parseInt(IPutSpecimens.ms_unit_price);
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }
  EditSpecimen() {
    const orderDate = FormatNgbDate.formatNgbDateToString(this.orderDateNgbModal);
    const receivedDate = FormatNgbDate.formatNgbDateToString(this.receiverDateNgbModal);
    const usedDate = FormatNgbDate.formatNgbDateToString(this.usedDateNgbModal);
    const warranty = FormatNgbDate.formatNgbDateToString(this.warrantyDateNgbModal);
    this.resetValidate();
    this.isCallApi = true;
    if (!this.IPutSpecimens.ms_name) {
      this.validatePutSpecimens.name = 'Vui lòng nhập tên mẫu!';
      this.isCallApi = false;
      this.isSubmitted = true;
    }
    if (!orderDate || !this.formatDate(orderDate)) {
      this.validatePutSpecimens.orderDate = 'Vui lòng nhập ngày đặt!';
      this.isCallApi = false;
      this.isSubmitted = true;
    }
    // if (receivedDate && !this.formatDate(receivedDate)) {
    //   this.validatePutSpecimens.receivedDate = 'Vui lòng nhập lại ngày nhận!';
    //   this.isSubmitted = true;
    // }
    // else if (receivedDate < orderDate && this.formatDate(receivedDate)) {
    //   this.validatePutSpecimens.receivedDate = 'Vui lòng chọn ngày nhận lớn hơn ngày đặt!';
    //   this.isSubmitted = true;
    // }
    // else if (receivedDate > usedDate && this.formatDate(receivedDate)) {
    //   this.validatePutSpecimens.receivedDate = 'Vui lòng chọn ngày nhận nhỏ hơn ngày lắp!';
    //   this.isSubmitted = true;
    // }
    // if (usedDate && !this.formatDate(usedDate)) {
    //   this.validatePutSpecimens.useDate = 'Vui lòng nhập lại ngày lắp!';
    //   this.isSubmitted = true;
    // }
    // else if (usedDate < orderDate && this.formatDate(usedDate)) {
    //   this.validatePutSpecimens.useDate = 'Vui lòng chọn ngày lắp lớn hơn ngày đặt!';
    //   this.isSubmitted = true;
    // }
    // else if (usedDate < receivedDate && this.formatDate(usedDate)) {
    //   this.validatePutSpecimens.useDate = 'Vui lòng chọn ngày lắp lớn hơn ngày nhận!';
    //   this.isSubmitted = true;
    // }
    if (!this.IPutSpecimens.lb_id) {
      this.validatePutSpecimens.labo = 'Vui lòng chọn labo!';
      this.isCallApi = false;
      this.isSubmitted = true;
    }
    if (this.IPutSpecimens.ms_quantity && !this.checkNumber(this.IPutSpecimens.ms_quantity)) {
      this.validatePutSpecimens.quantity = 'Vui lòng nhập lại số lượng!';
      this.isCallApi = false;
      this.isSubmitted = true;
    }
    // if (this.IPutSpecimens.ms_unit_price && !this.checkNumber(this.IPutSpecimens.ms_unit_price)) {
    //   this.validatePutSpecimens.unitPrice = 'Vui lòng nhập lại đơn giá!';
    //   this.isSubmitted = true;
    // }
    if (!this.IPutSpecimens.p_patient_id) {
      this.validatePutSpecimens.patient = 'Vui lòng nhập tên bệnh nhân!';
      this.isCallApi = false;
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    let orderDateParse = new Date(orderDate);
    let receivedDateParse = new Date(receivedDate);
    let usedDateParse = new Date(usedDate);
    let orderDateTimestamp = (orderDateParse.getTime() / 1000).toString();
    let receivedDateTimestamp = (receivedDateParse.getTime() / 1000).toString();
    let userDateTimestamp = (usedDateParse.getTime() / 1000).toString();
    let faci = sessionStorage.getItem('locale');
    if (faci != null) {
      this.putSpecimensBody.facility_id = faci;
    }
    this.putSpecimensBody = {
      name: this.IPutSpecimens.ms_name,
      type: this.IPutSpecimens.ms_type,
      quantity: this.IPutSpecimens.ms_quantity,
      unit_price: this.IPutSpecimens.ms_unit_price,
      order_date: orderDateTimestamp,
      orderer: this.IPutSpecimens.ms_orderer,
      received_date: receivedDateTimestamp,
      receiver: this.IPutSpecimens.ms_receiver,
      used_date: userDateTimestamp,
      warranty: warranty,
      description: this.IPutSpecimens.ms_description,
      status: this.IPutSpecimens.ms_status,
      facility_id: this.putSpecimensBody.facility_id,
      labo_id: this.IPutSpecimens.lb_id,
      patient_id: this.IPutSpecimens.p_patient_id
    }
    this.disable = true;
    this.SpecimensService.putSpecimens(this.id, this.putSpecimensBody)
      .subscribe((res) => {
        this.loading = false;
        // const ref = document.getElementById("cancel-edit-specimen");
        // ref?.click();
        this.showSuccessToast('Chỉnh sửa mẫu vật thành công!');
        window.location.reload();
      },
        (error) => {
          this.loading = false;
          this.disable = false;
          this.showErrorToast('Chỉnh sửa mẫu vật thất bại!');
          ResponseHandler.HANDLE_HTTP_STATUS(this.SpecimensService.apiUrl + "/medical-supply/" + this.id, error);
        }
      )
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    },
    );
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }
  patient: any;
  patientListShow: any[] = [];
  getPatient(id: any) {
    if (id !== null) {
      this.patientService.getPatientById(id).subscribe((data: any) => {
        const transformedMaterial = {
          patientId: data.patient_id,
          patientName: data.patient_name,
          patientInfor: data.patient_name + " - " + this.normalizePhoneNumber(data.phone_number),
        };
        if (!this.patientListShow.some(p => p.patientId === transformedMaterial.patientId)) {
          this.patientListShow.push(transformedMaterial);
        }
        this.patientList = this.patientListShow;
        this.IPutSpecimens.p_patient_id = transformedMaterial.patientId;
      })
    }
  }

  searchTimeout: any;
  patientList: any[] = [];
  onsearch(event: any) {
    this.searchTimeout = setTimeout(() => {
      this.IPutSpecimens.p_patient_name = event.target.value;
      let searchTermWithDiacritics = Normalize.normalizeDiacritics(event.target.value);
      searchTermWithDiacritics = searchTermWithDiacritics.toLowerCase().trim();
      searchTermWithDiacritics = searchTermWithDiacritics.replace(/\s+/g, '-');
      this.patientService.getPatientByName(searchTermWithDiacritics, 1).subscribe(data => {
        const transformedMaterialList = data.data.map((item: any) => {
          return {
            patientId: item.patient_id,
            patientName: item.patient_name,
            patientInfor: item.patient_name + " - " + item.phone_number,
          };
        });
        this.patientList = transformedMaterialList;
      })
    }, 2000);
  }

  closePopup() {
    this.IPutSpecimens = {
      ms_type: "",
      ms_name: "",
      ms_quantity: 0,
      ms_unit_price: 0,
      ms_order_date: "",
      ms_orderer: "",
      ms_received_date: "",
      ms_receiver: "",
      ms_use_date: "",
      ms_warranty: "",
      ms_description: "",
      ms_status: 0,
      facility_id: "",
      lb_id: null,
      p_patient_id: "",
      p_patient_name: "",
    } as PutSpecimen;
  }
  resetValidate() {
    this.validatePutSpecimens = {
      name: '',
      type: '',
      orderDate: '',
      receivedDate: '',
      useDate: '',
      labo: '',
      quantity: '',
      unitPrice: '',
      order: '',
      patient: ''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
  private formatDate(dateString: any): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
  }
}
