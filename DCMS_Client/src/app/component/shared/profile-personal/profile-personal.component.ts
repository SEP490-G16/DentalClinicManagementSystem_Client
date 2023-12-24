import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ICognitoUser } from 'src/app/model/ICognitoUser';
import { IStaff } from 'src/app/model/Staff';
import { CognitoService } from 'src/app/service/cognito.service';
import imageCompression from 'browser-image-compression';
import * as moment from "moment-timezone";
import { FormatNgbDate } from '../../utils/libs/formatNgbDate';
import { NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import {TimestampFormat} from "../../utils/libs/timestampFormat";
@Component({
  selector: 'app-profile-personal',
  templateUrl: './profile-personal.component.html',
  styleUrls: ['./profile-personal.component.css']
})
export class ProfilePersonalComponent implements OnInit {

  staff: IStaff; // Biến để lưu thông tin người dùng
  cognitoUser: ICognitoUser;
  model!: NgbDateStruct;
  imageURL: string | ArrayBuffer = '';
  showPassword: boolean = true;
  showPasswordRepeat: boolean = true;
  oldPassword: string = '';
  newPassword: string = '';
  passwordRepeat: string = '';
  constructor(
    private cognitoService: CognitoService,
    private toastr: ToastrService,
    private config: NgbDatepickerConfig,
  ) {
    this.staff = {} as IStaff;
    this.cognitoUser = {} as ICognitoUser
    const currentYear = new Date().getFullYear();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: currentYear, month: 12, day: 31 };
  }
  vailidateStaff = {
    name: '',
    dob: '',
    address: '',
    phone: '',
    gender: '',
    email: ''
  }
  isSubmitted: boolean = false;


  ngOnInit(): void {
    //Op1:
    const cognitoUserString = sessionStorage.getItem('cognitoUser');
    if (cognitoUserString) {
      this.cognitoUser = JSON.parse(cognitoUserString) as ICognitoUser;

    } else {
      console.error('No cognito user found in sessionStorage.');
    }
    //Op2:
    this.loadUserAttributes();
  }

  onDateChange() {
    this.staff.DOB = FormatNgbDate.formatNgbDateToString(this.model);
  }

  private loadUserAttributes(): void {
    this.cognitoService.getUserAttributes().then(attributes => {
      this.staff = attributes;
      const cognitoAttributes: any = attributes;
      this.staff.role = cognitoAttributes['custom:role'] || '';
      console.log(this.staff);
      this.staff.DOB = this.timestampToDate(parseInt(cognitoAttributes['custom:DOB'])) || '';
      console.log("dob:",this.staff.DOB)
      this.model = {
        year: Number(this.staff.DOB.split("-")[0]),
        month: Number(this.staff.DOB.split("-")[1]),
        day: Number(this.staff.DOB.split("-")[2]),
      }
      console.log(this.model);
      this.staff.image = cognitoAttributes['custom:image'] || '';
      this.imageURL = this.staff.image;
      this.staff.phone = cognitoAttributes.phone_number || '';
      this.staff.username = this.cognitoUser.Username;
      console.log("Attributes: ", attributes);
      console.log("Staff: ", this.staff);
    }).catch(error => {
      console.error('Err khi lấy attribute từ cognito: ', error);
      this.toastr.error(error, 'Lỗi khi lấy data');
    });
  }

  saveEditedStaff() {
    if (this.staff.password && this.staff.password !== this.passwordRepeat) {
      this.toastr.error('Mật khẩu mới và Mật khẩu mới nhập lại không khớp');
      return;
    }

    if (this.staff.password && this.staff.password !== "") {
      this.cognitoService.changePassword(this.oldPassword, this.staff.password)
        .then(() => {
          this.toastr.success('Thay đổi mật khẩu thành công!');
        })
        .catch(error => {
          console.error('Lỗi khi đổi mật khẩu: ', error);
          this.toastr.error(error, 'Lỗi khi đổi mật khẩu');
        });
    }

    console.log("Hehe: ", this.staff);

    this.cognitoService.updateUserAttributesOpt2(this.buildUpdateAttributes())
      .then(() => {
        this.toastr.success('Thay đổi thông tin cá nhân thành công');
      })
      .catch(error => {
        this.toastr.error('Lỗi khi cập nhật thông tin cá nhân: ', error);
        // this.toastr.error('Failed to update user attributes');
      });
  }

  private buildUpdateAttributes(): { [key: string]: string } {
    let updateAttributes: { [key: string]: string } = {};

    const isKeyOfIStaff = (key: string): key is keyof IStaff => {
      return key in this.staff;
    }

    const attributeMappings: { [K in keyof IStaff]?: string } = {
      'role': 'custom:role',
      'DOB': 'custom:DOB',
      'image': 'custom:image',
      'status': 'custom:status',
      'email': 'email',
      'phone': 'phone_number',
      'name': 'name',
      'address': 'address',
      'gender': 'gender',
    };

    for (const key in attributeMappings) {
      if (isKeyOfIStaff(key)) {
        console.log("abc",this.staff[key],key)
        if (key == 'DOB'){
          this.staff[key] = TimestampFormat.dateToTimestamp(this.staff[key]).toString();
        }
        const attributeValue = this.staff[key].toString();
        const attributeName = attributeMappings[key];
        if (attributeName) {
          updateAttributes[attributeName] = attributeValue;
        }
      }
    }

    updateAttributes['custom:status'] = '1';

    return updateAttributes;
  }


  async onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];

      const options = {
        maxSizeMB: 0.02,
        maxWidthOrHeight: 100,
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = (e: ProgressEvent<FileReader>) => {
          if (e.target && typeof e.target.result === 'string') {
            const base64Image = e.target.result;
            console.log(`Base64 Image Length: ${base64Image.length}`);

            if (base64Image.length <= 2048) {
              this.imageURL = base64Image;
              this.staff.image = base64Image;
            } else {
              this.toastr.error('Ảnh quá nặng. Kích thước tối đa cho phép là 2 KB.');
            }
          }
        };
        reader.onerror = error => {
          console.error('Error occurred while reading compressed image', error);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error during image compression', error);
      }
    }
  }
  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000,
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000,
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  togglePasswordRepeat() {
    this.showPasswordRepeat = !this.showPasswordRepeat;
  }
  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }
  private resetValidate() {
    this.vailidateStaff = {
      name: '',
      dob: '',
      address: '',
      phone: '',
      gender: '',
      email: ''
    }
    this.isSubmitted = false;
  }
  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }
}
