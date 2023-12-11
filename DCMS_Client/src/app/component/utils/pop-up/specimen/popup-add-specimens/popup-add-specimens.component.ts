import { Component, Input, OnInit } from '@angular/core';
import { MedicalSupplyService } from "../../../../../service/MedicalSupplyService/medical-supply.service";
import { ToastrService } from "ngx-toastr";
import { PatientService } from "../../../../../service/PatientService/patient.service";
import { LaboService } from "../../../../../service/LaboService/Labo.service";
import * as moment from 'moment-timezone';
import { IsThisSecondPipe } from 'ngx-date-fns';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ActivatedRoute } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormatNgbDate } from '../../../libs/formatNgbDateToString';

@Component({
  selector: 'app-popup-add-specimens',
  templateUrl: './popup-add-specimens.component.html',
  styleUrls: ['./popup-add-specimens.component.css']
})
export class PopupAddSpecimensComponent implements OnInit {
  @Input() approveSpecimensList: any;
  @Input() Patient_Id: any;
  orderDateNgbModal!: NgbDateStruct;
  receiverDateNgbModal!: NgbDateStruct;
  usedDateNgbModal!: NgbDateStruct;
  validateSpecimens = {
    name: '',
    type: '',
    receiverDate: '',
    orderer: '',
    usedDate: '',
    quantity: '',
    price: '',
    orderDate: '',
    receiver: '',
    labo: ''
  }
  specimen = {
    name: '',
    type: '',
    receiverDate: '',
    orderer: '',
    usedDate: '',
    quantity: '',
    price: '',
    totalPrice: '',
    orderDate: '',
    receiver: '',
    total: '',
    labo: '',
    treatment_course_id: ''
  }
  specimenBody = {
    name: '',
    type: '',
    received_date: 0,
    orderer: '',
    used_date: 0,
    quantity: '',
    unit_price: '',
    order_date: 0,
    patient_id: '',
    facility_id: '',
    labo_id: '',
    receiver: '',
    // treatment_course_id: ''
  }
  specimensRes = {
    medical_supply_id: '',
    ms_name: '',
    ms_type: '',
    p_patient_name: '',
    ms_quantity: '',
    ms_unit_price: '',
    ms_used_date: '',
    ms_status: 0
  }
  labos: any;
  patients: any[] = [];
  patientIdSelected: any;
  isSubmitted: boolean = false;
  loading: boolean = false;
  patientFind: any;
  constructor(private medicalSupplyService: MedicalSupplyService,
    private toastr: ToastrService,
    private patientSerivce: PatientService,
    private treatmentCourseService: TreatmentCourseService,
    private laboService: LaboService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.Patient_Id != null) {
      this.getPatient(this.Patient_Id);
    }

    this.getAllLabo();
    this.specimen.quantity = '1';
    this.specimen.orderer = sessionStorage.getItem('username') + '';
    const currentDate = new Date();
    // this.specimen.orderDate = currentDate.getFullYear().toString() + "-" + (currentDate.getMonth() + 1).toString() + "-" + currentDate.getDate().toString();
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh');

    this.orderDateNgbModal = {
      year: currentDateGMT7.year(),
      month: currentDateGMT7.month() + 1,
      day: currentDateGMT7.date()
    };
    this.specimen.orderDate = `${this.orderDateNgbModal.year}-${FormatNgbDate.pad(this.orderDateNgbModal.month)}-${FormatNgbDate.pad(this.orderDateNgbModal.day)}`;
    //alert(this.specimen.orderDate)
  }

  patient: any;
  patientListShow: any[] = [];
  getPatient(id: any) {
    if (id !== null) {
      this.patientSerivce.getPatientById(id).subscribe((data: any) => {
        const transformedMaterial = {
          patientId: data.patient_id,
          patientName: data.patient_name,
          patientInfor: data.patient_name + " - " + this.normalizePhoneNumber(data.phone_number),
        };
        if (!this.patientListShow.some(p => p.patientId === transformedMaterial.patientId)) {
          this.patientListShow.push(transformedMaterial);
        }
        this.patientList = this.patientListShow;
        this.patientIdSelected = transformedMaterial.patientId;
      })
    }
  }
  calculateTotal() {
    const total = parseInt(this.specimen.quantity) * parseInt(this.specimen.price);
    this.specimen.total = total.toString();
  }
  convertTimestampToDateString(timestamp: any): string {
    const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0'); // Lấy giờ và đảm bảo có 2 chữ số
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Lấy phút và đảm bảo có 2 chữ số
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  padZero(value: number): string {
    if (value < 10) {
      return `0${value}`;
    }
    return value.toString();
  }
  updateSpecimensRes() {
    let usedDate = this.convertTimestampToDateString(this.specimenBody.used_date);
    this.specimensRes = {
      medical_supply_id: '',
      ms_name: this.specimenBody.name,
      ms_type: this.specimenBody.type,
      p_patient_name: this.specimen.receiver,
      ms_quantity: this.specimenBody.quantity,
      ms_unit_price: this.specimenBody.unit_price,
      ms_used_date: usedDate,
      ms_status: 1
    }

  }
  addMedicalSupply() {

    const orderDate = FormatNgbDate.formatNgbDateToString(this.orderDateNgbModal);
    const receivedDate = FormatNgbDate.formatNgbDateToString(this.receiverDateNgbModal);
    const usedDate = FormatNgbDate.formatNgbDateToString(this.usedDateNgbModal);
    this.resetValidate();
    if (!this.specimen.name) {
      this.validateSpecimens.name = 'Vui lòng nhập tên mẫu!';
      this.isSubmitted = true;
    }
    if (!orderDate || !this.formatDate(orderDate)) {
      this.validateSpecimens.orderDate = 'Vui lòng nhập nhập ngày đặt!';
      this.isSubmitted = true;
    }
    // if (receivedDate && !this.formatDate(receivedDate)) {
    //   this.validateSpecimens.receiverDate = 'Vui lòng nhập lại ngày nhận!';
    //   this.isSubmitted = true;
    // }
    // else if (receivedDate < orderDate && this.formatDate(receivedDate)){
    //   this.validateSpecimens.receiverDate = 'Vui lòng chọn ngày nhận lớn hơn ngày đặt!';
    //   this.isSubmitted = true;
    // }
    // else if (receivedDate > usedDate && this.formatDate(receivedDate)) {
    //   this.validateSpecimens.receiverDate = 'Vui lòng chọn ngày nhận nhỏ hơn ngày lắp!';
    //   this.isSubmitted = true;
    // }

    // if (usedDate && !this.formatDate(usedDate)) {
    //   this.validateSpecimens.usedDate = 'Vui lòng nhập lại ngày lắp!';
    //   this.isSubmitted = true;
    // }
    // else if (usedDate < orderDate && this.formatDate(usedDate)){
    //   this.validateSpecimens.usedDate = 'Vui lòng chọn ngày lắp lớn hơn ngày đặt!';
    //   this.isSubmitted = true;
    // }
    // else if (usedDate < receivedDate && this.formatDate(usedDate)) {
    //   this.validateSpecimens.usedDate = 'Vui lòng chọn ngày lắp lớn hơn ngày nhận!';
    //   this.isSubmitted = true;
    // }

    if (!this.specimen.labo) {
      this.validateSpecimens.labo = 'Vui lòng chọn labo!';
      this.isSubmitted = true;
    }

    if (this.specimen.quantity && !this.checkNumber(this.specimen.quantity)) {
      this.validateSpecimens.quantity = 'Vui lòng nhập lại số lượng!';
      this.isSubmitted = true;
    }
    // if (this.specimen.price && !this.checkNumber(this.specimen.price)) {
    //   this.validateSpecimens.price = 'Vui lòng nhập lại đơn giá!';
    //   this.isSubmitted = true;
    // }
    // if (!this.patientIdSelected) {
    //   this.validateSpecimens.receiver = 'Vui lòng nhập tên bệnh nhân!';
    //   this.isSubmitted = true;
    // }

    if (this.isSubmitted) {
      return;
    }

    let orderDateTimestamp = this.dateToTimestamp(orderDate);
    let receivedDateTimestamp = receivedDate != "" ? this.dateToTimestamp(receivedDate) : 0;
    let userDateTimestamp = usedDate != '' ? this.dateToTimestamp(usedDate) : 0;

    const pa = this.patientIdSelected.split(" - ");
    this.specimenBody = {
      name: this.specimen.name,
      type: this.specimen.type,
      received_date: receivedDateTimestamp,
      orderer: this.specimen.orderer,
      used_date: userDateTimestamp,
      quantity: this.specimen.quantity,
      unit_price: this.specimen.price,
      order_date: orderDateTimestamp,
      patient_id: this.patientIdSelected,
      facility_id: 'F-01',
      labo_id: this.specimen.labo,
      // treatment_course_id: this.specimen.treatment_course_id,
      receiver: this.specimen.orderer,

    }
    this.loading = true;
    this.medicalSupplyService.addMedicalSupply(this.specimenBody).subscribe(data => {
      this.toastr.success('Thêm mới mẫu thành công !');
      let ref = document.getElementById('cancel-specimen');
      ref?.click();
      window.location.reload();
    },
      error => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalSupplyService.url + "/medical-supply", error);
      })
  }

  //test nha
  patientList: any[] = [];
  searchTimeout: any;
  onsearch(event: any) {
    this.searchTimeout = setTimeout(() => {
      this.specimen.receiver = event.target.value;
      this.patientSerivce.getPatientByName(this.specimen.receiver, 1).subscribe(data => {
        const transformedMaterialList = data.data.map((item: any) => {
          return {
            patientId: item.patient_id,
            patientName: item.patient_name,
            patientInfor: item.patient_id + " - " + item.patient_name + " - " + item.phone_number,
          };
        });
        this.patientList = transformedMaterialList;
      },
        error => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.patientSerivce.test + "/patient/name/" + this.specimen.receiver + "/" + 1, error);
        }
      )
    }, 2000);
  }

  listTreatment: any[] = []
  clickPatient(patient: any) {
    var pa = patient.split(' - ');
    this.treatmentCourseService.getTreatmentCourse(pa[0]).subscribe((data) => {
      this.listTreatment = data
      this.loading = false;
    })
  }

  private resetValidate() {
    this.validateSpecimens = {
      name: '',
      type: '',
      receiverDate: '',
      orderer: '',
      usedDate: '',
      quantity: '',
      price: '',
      orderDate: '',
      receiver: '',
      labo: ''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
  private formatDate(dateString: any): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }
  getAllLabo() {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
    })
  }

  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
}
