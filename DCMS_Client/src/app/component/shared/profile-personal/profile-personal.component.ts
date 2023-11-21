import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ICognitoUser } from 'src/app/model/ICognitoUser';
import { IStaff } from 'src/app/model/Staff';
import { CognitoService } from 'src/app/service/cognito.service';
import imageCompression from 'browser-image-compression';
@Component({
  selector: 'app-profile-personal',
  templateUrl: './profile-personal.component.html',
  styleUrls: ['./profile-personal.component.css']
})
export class ProfilePersonalComponent implements OnInit {

  staff: IStaff; // Biến để lưu thông tin người dùng
  cognitoUser: ICognitoUser;

  imageURL: string | ArrayBuffer = '';
  showPassword: boolean = true;
  showPasswordRepeat: boolean = true;
  oldPassword: string = '';
  newPassword: string = '';
  passwordRepeat: string = '';
  constructor(
    private cognitoService: CognitoService,
    private toastr: ToastrService
  ) {
    this.staff = {} as IStaff;
    this.cognitoUser = {} as ICognitoUser
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

  private loadUserAttributes(): void {
    this.cognitoService.getUserAttributes().then(attributes => {
      this.staff = attributes;
      const cognitoAttributes: any = attributes;
      this.staff.role = cognitoAttributes['custom:role'] || '';
      this.staff.DOB = cognitoAttributes['custom:DOB'] || '';
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
        this.toastr.success('User attributes updated successfully');
      })
      .catch(error => {
        console.error('Error updating user attributes: ', error);
        this.toastr.error('Failed to update user attributes');
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


  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      // Config
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      imageCompression(file, options)
        .then(compressedFile => {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target && typeof e.target.result === 'string') {
              this.imageURL = e.target.result;
              this.staff.image = this.imageURL;
            }
          };
          reader.readAsDataURL(compressedFile);
        })
        .catch(error => {
          console.error('Error during image compression', error);
        });
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

}
