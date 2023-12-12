import { Component, OnInit } from '@angular/core';
import { PatientService } from "../../../../service/PatientService/patient.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CognitoService } from 'src/app/service/cognito.service';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import * as moment from "moment-timezone";
import { TimestampFormat } from 'src/app/component/utils/libs/timestampFormat';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormatNgbDate } from 'src/app/component/utils/libs/formatNgbDateToString';

@Component({
  selector: 'app-patient-profile-tab',
  templateUrl: './patient-profile-tab.component.html',
  styleUrls: ['./patient-profile-tab.component.css']
})
export class PatientProfileTabComponent implements OnInit {
  protected readonly window = window;
  dob!:NgbDateStruct;
  constructor(private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private router: Router,
    private commonService: CommonService,
    private toastr: ToastrService) {
  }

  patient: any;
  id: any;
  patientBody: any = {
    date_of_birth: '',
    patient_name: '',
    gender: 0,
    phone_number: '',
    email: '',
    address: '',
    dental_medical_history: '',
    full_medical_history: '',
    description: '',
    profile_image: '',
    patient_id: '',
  }
  validatePatient = {
    name: '',
    gender: '',
    phone: '',
    address: '',
    dob: '',
    email: '',
    createDate: ''
  }
  isSubmitted: boolean = false;
  isEditing: boolean = false;
  roleId: string[] = [];

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getPatient(this.id);
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
  }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.id);
  }

  imageURL: string | ArrayBuffer = '';

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  setPatientId() {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri', this.id])
  }

  onDOBChange() {
    this.patient.date_of_birth = FormatNgbDate.formatNgbDateToVNString(this.dob);
  }

  clickCount: number = 0;

  toggleEditing() {
    this.clickCount++;
    if (this.clickCount % 2 !== 0) {
      console.log(this.clickCount)
      console.log(this.isEditing)
      this.isEditing = true;
      this.resetValidate();
      if (!this.patient.patient_name) {
        this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
        this.isSubmitted = true;
      }
      if (this.patient.email && !this.isValidEmail(this.patient.email)) {
        this.validatePatient.email = "Email không hợp lệ!";
        this.isSubmitted = true;
      }
      if (!this.patient.gender) {
        this.validatePatient.gender = "Vui lòng chọn giới tính!";
        this.isSubmitted = true;
      }
      if (!this.patient.date_of_birth) {
        this.validatePatient.dob = 'Vui lòng nhập ngày sinh!';
        this.isSubmitted = true;
      }
      if (this.patient.phone_number === '') {
        this.validatePatient.phone = "Vui lòng nhập số điện thoại!";
        this.isSubmitted = true;
      } else if (!this.isVietnamesePhoneNumber(this.patient.phone_number)) {
        this.validatePatient.phone = "Số điện thoại không hợp lệ!";
        this.isSubmitted = true;
      }
      if (!this.patient.address) {
        this.validatePatient.address = "Vui lòng nhập địa chỉ!";
        this.isSubmitted = true;
      }
      if (this.isSubmitted) {
        return;
      }

    } else {
      let phone = ''
      if (this.patient.phone_number && this.patient.phone_number.length === 9) {
        phone = '+84' + this.patient.phone_number;
      }
      if (this.patient.phone_number && this.patient.phone_number.length === 10) {
        phone = '+84' + this.patient.phone_number.substring(1);
      }
      this.patientBody = {
        date_of_birth: TimestampFormat.dateToTimestamp(this.patient.date_of_birth),
        patient_name: this.patient.patient_name,
        gender: this.patient.gender,
        phone_number: phone,
        email: this.patient.email,
        address: this.patient.address,
        dental_medical_history: this.patient.dental_medical_history || "",
        full_medical_history: this.patient.full_medical_History || "",
        description: this.patient.description,
        profile_image: this.imageURL,
        // patient_id: this.id
      }
      console.log(this.patientBody);
      this.isEditing = false;
      let status = 0;
      this.patientService.updatePatient(this.patientBody, this.id).subscribe(res => {
        this.toastr.success("", 'Cập nhật bệnh nhân thành công !');
        console.log("res", res);
      }, (error) => {
        //this.toastr.error(error.error.message,'Cập nhật bệnh nhân thất bại!')
        console.log("res", error);
        ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/" + this.id, error);
      })
    }

  }

  getPatient(id: string) {
    this.patientService.getPatientById(id).subscribe(data => {
      this.patient = data;
      const check = this.patient.description.split('@@isnew##_');
      if (check.length > 1) {
        this.patient.description = check[1]
      } else {
        this.patient.description = check[0];
      }
      this.dob = {
        year: parseInt(this.patient.date_of_birth.split('-')[0]),
        month: parseInt(this.patient.date_of_birth.split('-')[1]),
        day: parseInt(this.patient.date_of_birth.split('-')[2])
      };
      console.log("DOB: ", this.dob);
      this.patient.phone_number = this.normalizePhoneNumber(this.patient.phone_number);
      console.log("Patient temp: ", this.patient);
      sessionStorage.removeItem('patient');
      sessionStorage.setItem('patient', JSON.stringify(this.patient))
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/" + id, error);
      }
    )
  }


  private resetValidate() {
    this.validatePatient = {
      name: '',
      gender: '',
      phone: '',
      address: '',
      dob: '',
      email: '',
      createDate: ''
    }
    this.isSubmitted = false;
  }

  cancelUpdate() {
    this.isEditing = false;
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

  private formatDate(dateString: any): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
}
