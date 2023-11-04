import { Component, OnInit } from '@angular/core';
import { CognitoService } from 'src/app/service/cognito.service';
import { ToastrService } from 'ngx-toastr';
import { IStaff } from 'src/app/model/Staff';

@Component({
  selector: 'app-popup-edit-staff',
  templateUrl: './popup-edit-staff.component.html',
  styleUrls: ['./popup-edit-staff.component.css']
})
export class PopupEditStaffComponent implements OnInit {
  staff: IStaff; // Biến để lưu thông tin người dùng

  role:string = "1";
  status:string = "1";
  imageURL: string | ArrayBuffer = '';
  showPassword: boolean = true;
  showPasswordRepeat: boolean = true;
  password: string = '';
  passwordRepeat: string = '';
  constructor(
    private cognitoService: CognitoService,
    private toastr: ToastrService
  ) {
    this.staff = {
      username: "hehe ",
      email: "dsa@gmail.com",
      name: "phamthanhlong",
      phone: "+84968654321",
      address: "asdsdsadsadsa",
      description: "dâs",
      DOB: "2023-11-04",
      status: 1,
      image: "abc"
    } as IStaff;
  }
  vailidateStaff = {
    name:'',
    dob:'',
    address:'',
    phone:'',
    gender:'',
    email:''
  }
  isSubmitted:boolean = false;
  staff_id_temp = "1695557d-3f50-4382-83dd-97c46a0a3f65"

  ngOnInit(): void {

  }

  saveEditedStaff() {
    this.resetValidate();
    if(!this.staff.name){
      this.vailidateStaff.name = "Vui lòng nhập tên nhân viên!";
      this.isSubmitted = true;
    }
    if (!this.staff.DOB){
      this.vailidateStaff.dob = "Vui lòng nhập ngày sinh!";
      this.isSubmitted = true;
    }
    if (!this.staff.address){
      this.vailidateStaff.address = "Vui lòng nhập địa chỉ!";
      this.isSubmitted = true;
    }
    if (!this.staff.phone){
      this.vailidateStaff.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.staff.phone)){
      this.vailidateStaff.phone = "Số điện thoại không hợp lệ!";
      this.isSubmitted = true;
    }
    if (this.staff.email && !this.isValidEmail(this.staff.email)){
      this.vailidateStaff.email = "Email không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.staff.gender){
      this.vailidateStaff.gender = "Vui lòng chọn giới tính!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.staff.status = parseInt(this.status);
    this.cognitoService.updateUserAttributes(this.staff_id_temp, this.staff)
      .then((response) => {
        this.showSuccessToast('Cập nhật thông tin thành công');
      })
      .catch((error) => {
        this.showErrorToast('Cập nhật thông tin thất bại');
      });
  }

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
  private isVietnamesePhoneNumber(number:string):boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }
  private resetValidate(){
    this.vailidateStaff = {
      name:'',
      dob:'',
      address:'',
      phone:'',
      gender:'',
      email:''
    }
    this.isSubmitted = false;
  }
}
