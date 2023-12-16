import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { PatientService } from "../../../../../service/PatientService/patient.service";
import { ToastrService } from "ngx-toastr";
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { SendMessageSocket } from 'src/app/component/shared/services/SendMessageSocket.service';
import { NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { FormatNgbDate } from '../../../libs/formatNgbDate';
import { TimestampFormat } from '../../../libs/timestampFormat';
import * as moment from 'moment';
@Component({
  selector: 'app-popup-add-patient',
  templateUrl: './popup-add-patient.component.html',
  styleUrls: ['./popup-add-patient.component.css']
})
export class PopupAddPatientComponent implements OnInit {
  @Input() searchPatientsList: any;
  @Output() newPatientAdded = new EventEmitter<any>();

  dob: string = "";
  model!: NgbDateStruct;
  patient1: any = {
    patientName: '',
    Email: '',
    Gender: 1,
    phone_Number: '',
    Address: '',
    full_medical_History: '',
    dental_medical_History: '',
    dob: ''
  }
  validatePatient = {
    name: '',
    gender: '',
    phone: '',
    address: '',
    dob: '',
    email: ''
  }
  isSubmitted: boolean = false;
  constructor(private patientService: PatientService,
    private toastr: ToastrService,
    private config: NgbDatepickerConfig,
    private datePipe: DatePipe,
    private sendMessageSocket: SendMessageSocket) {

    const currentYear = new Date().getFullYear();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: currentYear, month: 12, day: 31 };

  }

  onDateChange() {
    this.patient1.dob = FormatNgbDate.formatNgbDateToString(this.model);
  }


  patientBody: any = {
    patient_name: '',
    email: '',
    gender: "",
    phone_number: '',
    address: '',
    full_medical_history: '',
    dental_medical_history: '',
    date_of_birth: '',
    description: ''
  }
  ngOnInit(): void {
  }
  // Thêm hàm này vào component để đóng tooltip khi nhấp vào nút đóng (X)
  closeTooltip() {
    this.isSubmitted = false;
  }

  addPatient() {
    var regex = /[0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\\-/]/;
    this.resetValidate();
    if (!this.patient1.patientName) {
      this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
      this.isSubmitted = true;
    }
    if (regex.test(this.patient1.patientName) == true) {
      this.validatePatient.name = "Tên không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.Gender) {
      this.validatePatient.gender = "Vui lòng chọn giới tính!";
      this.isSubmitted = true;
    }
    if (!this.patient1.phone_Number) {
      this.validatePatient.phone = "Vui lòng nhập số zalo!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.patient1.phone_Number)) {
      this.validatePatient.phone = "Số zalo không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.model || !this.model.year || !this.model.month || !this.model.day) {
      this.validatePatient.dob = "Vui lòng nhập ngày sinh!";
      this.isSubmitted = true;
    }
    else if (this.isDob(FormatNgbDate.formatNgbDateToString(this.model))){
      this.validatePatient.dob = "Vui lòng nhập ngày sinh đúng định dạng dd/MM/yyyy !";
      this.isSubmitted = true;
    }
    if (!this.patient1.Address) {
      this.validatePatient.address = "Vui lòng nhập địa chỉ!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    console.log(this.patient1.Gender);
    this.patientBody = {
      patient_id: null,
      patient_name: this.patient1.patientName,
      email: this.patient1.Email,
      gender: this.patient1.Gender.toString(),
      phone_number: this.patient1.phone_Number,
      address: this.patient1.Address,
      full_medical_history: this.patient1.full_medical_History,
      dental_medical_history: this.patient1.dental_medical_History,
      date_of_birth: FormatNgbDate.formatNgbDateToString(this.model)
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 9) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: this.patient1.Gender.toString(),
        phone_number: '+84' + this.patient1.phone_Number,
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: FormatNgbDate.formatNgbDateToString(this.model)
      }
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 10) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: this.patient1.Gender.toString(),
        phone_number: '+84' + this.patient1.phone_Number.substring(1),
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: FormatNgbDate.formatNgbDateToString(this.model)
      }
    }
    this.patientBody.date_of_birth = TimestampFormat.dateToTimestamp(FormatNgbDate.formatNgbDateToString(this.model));
    console.log("Post: ", this.patientBody);

    // return;
    this.patientService.addPatient(this.patientBody).subscribe((data: any) => {
      this.toastr.success('Thêm mới bệnh nhân thành công!');

      let ref = document.getElementById('cancel');
      ref?.click();


      this.patientBody.created_date = TimestampFormat.VNDateTimeStringNow();

      this.newPatientAdded.emit(this.patientBody);

      this.sendMessageSocket.sendMessageSocket('UpdateAnalysesTotal@@@', 'plus', 'pat');
      localStorage.setItem("patient", JSON.stringify(this.patientBody))
      const newPatientId = data.data.patient_id;
      this.patientBody.patient_id = newPatientId;
      this.patientBody.phone_number = this.normalizePhoneNumber(this.patientBody.phone_number)
      this.searchPatientsList.unshift(this.patientBody);
      this.patientBody.isNew = true;
      this.patientBody.isPulsing = true;
      setTimeout(() => {
        this.patientBody.isPulsing = false;
        this.patientBody.isNew = false;
      }, 2000);
      console.log(this.searchPatientsList);

    }, error => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient", error);
    })
  }
  private resetValidate() {
    this.validatePatient = {
      name: '',
      gender: '',
      phone: '',
      address: '',
      dob: '',
      email: ''
    }
    this.isSubmitted = false;
  }
  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private isDob(dob: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dob);
  }
  convertDateToISOFormat(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`; // Chuyển đổi sang định dạng yyyy-MM-dd
    } else {
      return null; // hoặc bạn có thể handle lỗi tùy theo logic của ứng dụng
    }
  }
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(email);
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
