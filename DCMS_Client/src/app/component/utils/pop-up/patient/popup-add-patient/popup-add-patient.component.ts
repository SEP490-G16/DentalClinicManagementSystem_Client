import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PatientService } from "../../../../../service/PatientService/patient.service";
import { ToastrService } from "ngx-toastr";
import { ResponseHandler } from "../../../libs/ResponseHandler";
@Component({
  selector: 'app-popup-add-patient',
  templateUrl: './popup-add-patient.component.html',
  styleUrls: ['./popup-add-patient.component.css']
})
export class PopupAddPatientComponent implements OnInit {
  @Input() searchPatientsList: any;
  patient1: any = {
    patientName: '',
    Email: '',
    Gender: "1",
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
    private toastr: ToastrService) { }
  patientBody: any = {
    patient_name: '',
    email: '',
    gender: 1,
    phone_number: '',
    address: '',
    full_medical_history: '',
    dental_medical_history: '',
    date_of_birth: ''
  }
  ngOnInit(): void {
  }
  addPatient() {
    this.resetValidate();
    if (!this.patient1.patientName) {
      this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
      this.isSubmitted = true;
    }
    if (this.patient1.Email && !this.isValidEmail(this.patient1.Email)) {
      this.validatePatient.email = "Email không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.Gender) {
      this.validatePatient.gender = "Vui lòng chọn giới tính!";
      this.isSubmitted = true;
    }
    if (!this.patient1.phone_Number) {
      this.validatePatient.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.patient1.phone_Number)) {
      this.validatePatient.phone = "Số điện thoại không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.dob) {
      this.validatePatient.dob = "Vui lòng nhập ngày sinh!";
      this.isSubmitted = true;
    }
    if (!this.patient1.Address) {
      this.validatePatient.address = "Vui lòng nhập địa chỉ!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 9) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: Number(this.patient1.Gender),
        phone_number: '+84' + this.patient1.phone_Number,
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: this.patient1.dob
      }
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 10) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: Number(this.patient1.Gender),
        phone_number: '+84' + this.patient1.phone_Number.substring(1),
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: this.patient1.dob
      }
    }

    this.patientService.addPatient(this.patientBody).subscribe((data: any) => {
      this.toastr.success('Thêm mới bệnh nhân thành công!');
      localStorage.setItem("patient", JSON.stringify(this.patientBody))
      let ref = document.getElementById('cancel');
      ref?.click();
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
      window.location.reload();

    }, error => {
      //this.toastr.error('Thêm mới bệnh nhân thất bại!');
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
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
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
