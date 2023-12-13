import { Component, OnInit } from '@angular/core';
import { PatientService } from "../../../../service/PatientService/patient.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CognitoService } from 'src/app/service/cognito.service';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import * as moment from "moment-timezone";
import { TimestampFormat } from 'src/app/component/utils/libs/timestampFormat';
import { NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormatNgbDate } from 'src/app/component/utils/libs/formatNgbDateToString';
import * as imageSize from 'image-size';
@Component({
  selector: 'app-patient-profile-tab',
  templateUrl: './patient-profile-tab.component.html',
  styleUrls: ['./patient-profile-tab.component.css']
})
export class PatientProfileTabComponent implements OnInit {
  protected readonly window = window;
  dob!: NgbDateStruct;
  constructor(private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private router: Router,
    private config: NgbDatepickerConfig,
    private commonService: CommonService,
    private toastr: ToastrService) {
    const currentYear = new Date().getFullYear();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: currentYear, month: 12, day: 31 };
  }

  patientDisplay: any;
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

  imageURL: string | ArrayBuffer = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const base64Data = e.target.result;
        this.resizeImage(base64Data, 150, 200)
          .then(resizedBase64 => {
            this.imageURL = resizedBase64;
          })
          .catch(error => {
            console.error('Error resizing image:', error);
          });
      };
      reader.readAsDataURL(file);
    }
  }

  async resizeImage(base64Data: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = base64Data;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const compressedBase64 = reader.result as string;
              resolve(compressedBase64);
            };
            reader.readAsDataURL(blob as Blob);
          }, 'image/jpeg', 0.1);
        } else {
          reject(new Error('Unable to get 2D context for canvas.'));
        }
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  }




  setPatientId() {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri', this.id])
  }

  onDOBChange() {
    this.patientDisplay.date_of_birth = FormatNgbDate.formatNgbDateToString(this.dob);
  }

  clickCount: number = 0;

  toggleEditing() {
    this.clickCount++;
    if (this.clickCount % 2 !== 0) {
      this.isEditing = true;

    } else {
      this.resetValidate();
      if (!this.patientDisplay.patient_name) {
        this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
        this.isSubmitted = true;
      }
      if (!this.patientDisplay.date_of_birth) {
        this.validatePatient.dob = 'Vui lòng nhập ngày sinh!';
        this.isSubmitted = true;
      }
      if (!this.isValidEmail(this.patientDisplay.email)) {
        this.validatePatient.email = "Email không hợp lệ!";
        this.isSubmitted = true;
      }
      if (this.patientDisplay.phone_number === '') {
        this.validatePatient.phone = "Vui lòng nhập số điện thoại!";
        this.isSubmitted = true;
      } else if (!this.isVietnamesePhoneNumber(this.patientDisplay.phone_number)) {
        this.validatePatient.phone = "Số điện thoại không hợp lệ!";
        this.isSubmitted = true;
      }
      if (!this.patientDisplay.address) {
        this.validatePatient.address = "Vui lòng nhập địa chỉ!";
        this.isSubmitted = true;
      }
      if (this.isSubmitted) {
        this.clickCount--;
        return;
      }
      let phone = ''
      if (this.patientDisplay.phone_number && this.patientDisplay.phone_number.length === 9) {
        phone = '+84' + this.patientDisplay.phone_number;
      }
      if (this.patientDisplay.phone_number && this.patientDisplay.phone_number.length === 10) {
        phone = '+84' + this.patientDisplay.phone_number.substring(1);
      }
      this.patientBody = {
        date_of_birth: TimestampFormat.timeAndDateToTimestamp("20:00",this.patientDisplay.date_of_birth),
        patient_name: this.patientDisplay.patient_name,
        gender: this.patientDisplay.gender,
        phone_number: phone,
        email: this.patientDisplay.email,
        address: this.patientDisplay.address,
        dental_medical_history: this.patientDisplay.dental_medical_history || "",
        full_medical_history: this.patientDisplay.full_medical_History || "",
        description: this.patientDisplay.description,
        profile_image: this.imageURL,
        // patient_id: this.id
      }
      this.isEditing = false;
      let status = 0;
      this.patientService.updatePatient(this.patientBody, this.id).subscribe(res => {

      }, (error) => {
        //this.toastr.error(error.error.message,'Cập nhật bệnh nhân thất bại!')
        console.log("res", error);
        ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/" + this.id, error);
      })
      this.toastr.success("", 'Cập nhật bệnh nhân thành công !');
    }
  }

  getPatient(id: string) {
    this.patientService.getPatientById(id).subscribe(data => {
      this.patientDisplay = data;
      const check = this.patientDisplay.description.split('@@isnew##_');
      if (check.length > 1) {
        this.patientDisplay.description = check[1]
      } else {
        this.patientDisplay.description = check[0];
      }
      this.dob = {
        year: parseInt(this.patientDisplay.date_of_birth.split('-')[0]),
        month: parseInt(this.patientDisplay.date_of_birth.split('-')[1]),
        day: parseInt(this.patientDisplay.date_of_birth.split('-')[2])
      };
      console.log("image: ", this.patientDisplay);
      if(this.patientDisplay.profile_image) {
        this.imageURL = this.patientDisplay.profile_image;
      }
      this.patientDisplay.phone_number = this.normalizePhoneNumber(this.patientDisplay.phone_number);
      console.log("Patient temp: ", this.patientDisplay);
      sessionStorage.removeItem('patient');
      sessionStorage.setItem('patient', JSON.stringify(this.patientDisplay))
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
