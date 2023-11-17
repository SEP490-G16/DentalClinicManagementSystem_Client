import { IStaff } from '../../../../../model/Staff';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-popup-add-staff',
  templateUrl: './popup-add-staff.component.html',
  styleUrls: ['./popup-add-staff.component.css']
})
export class PopupAddStaffComponent implements OnInit {
  imageURL: string | ArrayBuffer = 'https://icon-library.com/images/staff-icon/staff-icon-15.jpg';
  showPassword: boolean = true;
  showPasswordRepeat:boolean = true;
  password: string = '';
  passwordRepeat:string = '';
  vailidateStaff = {
    name:'',
    dob:'',
    address:'',
    phone:'',
    role:'',
    gender:'',
    email:'',
    username:'',
    password:'',
    passwordRepate:''
  }
  isSubmitted:boolean = false;

  role:string = "1"
  staff:IStaff;
  constructor(
    private cognitoService:CognitoService,

    private toastr:ToastrService,
    private router:Router
  ) {
    this.staff = {} as IStaff

   }

  ngOnInit(): void {

  }

  addSTAFF() {
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
    if (!this.staff.role){
      this.vailidateStaff.role = "Vui lòng chọn vai trò!";
      this.isSubmitted = true;
    }
    if (!this.staff.gender){
      this.vailidateStaff.gender = "Vui lòng chọn giới tính!";
      this.isSubmitted = true;
    }
    if (!this.staff.username){
      this.vailidateStaff.username = "Vui lòng nhập tên dăng nhập!";
      this.isSubmitted = true;
    }
    if (!this.staff.password){
      this.vailidateStaff.password = "Vui lòng nhập mật khẩu!";
      this.isSubmitted = true;
    }
    if (!this.passwordRepeat){
      this.vailidateStaff.passwordRepate = "Nhập lại mật khẩu!";
      this.isSubmitted = true;
    }
    else if (this.passwordRepeat!==this.staff.password){
      this.vailidateStaff.passwordRepate = "Mật khẩu không khớp!";
    }
    if (this.isSubmitted){
      return;
    }
    console.log(this.staff);
    this.cognitoService.addStaff(this.staff)
      .then((response) => {
        this.showSuccessToast('Thêm nhân viên thành công')
      })
      .catch((error) => {
        // Xử lý khi có lỗi đăng ký
        this.showSuccessToast('Thêm nhân viên thất bại')
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
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
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
      role:'',
      gender:'',
      email:'',
      username:'',
      password:'',
      passwordRepate:''
    }
    this.isSubmitted = false;
  }

}
