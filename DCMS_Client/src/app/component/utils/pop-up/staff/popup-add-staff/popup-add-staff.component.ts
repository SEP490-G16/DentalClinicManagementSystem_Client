import { IStaff } from '../../../../../model/Staff';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import { FacilityService } from 'src/app/service/FacilityService/facility.service';
import {
  MedicalProcedureGroupService
} from "../../../../../service/MedicalProcedureService/medical-procedure-group.service";

@Component({
  selector: 'app-popup-add-staff',
  templateUrl: './popup-add-staff.component.html',
  styleUrls: ['./popup-add-staff.component.css']
})
export class PopupAddStaffComponent implements OnInit {
  imageURL: string | ArrayBuffer = 'https://icon-library.com/images/staff-icon/staff-icon-15.jpg';
  roleUserSignIn: string = '';
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
  gender: string = "male";
  role:string = "0";
  facility:string = "0";
  staff:IStaff;
  listFacility: any[] = [];

  constructor(
    private cognitoService:CognitoService,
    private facilityService: FacilityService,
    private toastr:ToastrService,
    private router:Router,
    private serviceGroup: MedicalProcedureGroupService
  ) {
    this.staff = {} as IStaff
   }

  ngOnInit(): void {
    this.getListFacility();
  }

  getListFacility() {
    this.facilityService.getFacilityList().subscribe((res) => {
      console.log("Danh sach cơ sơ",res);
      this.listFacility = res.data;
    },
      (err) => {
        this.showErrorToast('Lỗi khi lấy dữ liệu cho Labo')
      }
    )
  }

  addSTAFF() {
    //console.log("skdjb", this.imageURL);
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
    if (!this.staff.email && !this.isValidEmail(this.staff.email)){
      this.vailidateStaff.email = "Email không hợp lệ!";
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

    if (this.staff.password.length < 8) {
      this.vailidateStaff.password = "Mật khẩu phải dài hơn 8 ký tự !";
      this.isSubmitted = true;
    }

    if (!this.isCheckPassword(this.staff.password)) {
      this.vailidateStaff.password = "Mật khẩu phải có ký tự đặc biệt, ký tự hoa, thường và chứa số!";
      this.isSubmitted = true;
    }


    if (!this.passwordRepeat){
      this.vailidateStaff.passwordRepate = "Nhập lại mật khẩu!";
      this.isSubmitted = true;
    }
    else if (this.passwordRepeat!==this.staff.password){
      this.vailidateStaff.passwordRepate = "Mật khẩu không khớp!";
    }
    this.staff.role = this.role;
    this.staff.gender = this.gender;
    this.staff.image = this.imageURL;

    this.staff.DOB = this.dateToTimestamp(this.staff.DOB).toString();
    this.staff.locale = this.facility;
    this.staff.status = "1";
    if (this.isSubmitted){
      return;
    }
    this.cognitoService.addStaff(this.staff)
      .then((response) => {
        window.location.reload();
        this.showSuccessToast('Thêm nhân viên thành công')
      })
      .catch((error) => {
        // Xử lý khi có lỗi đăng ký
        this.showSuccessToast('Thêm nhân viên thất bại')
      });
  }

  // onFileSelected(event: any) {
  //   const fileInput = event.target;
  //   if (fileInput.files && fileInput.files[0]) {
  //     const file = fileInput.files[0];
  //     const reader = new FileReader();

  //     reader.onload = (e: any) => {
  //       this.imageURL = e.target.result;
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // }

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const base64Data = e.target.result;
        alert("đã vô nha")
        this.resizeImage(base64Data, 150, 200)
          .then(resizedBase64 => {
            this.imageURL = resizedBase64;
            alert(this.imageURL);
          })
          .catch(error => {
            console.error('Error resizing image:', error);
          });
      };
      reader.readAsDataURL(file);
    }
  }

  resizeImage(base64Data: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        let newWidth, newHeight;
        if (width > height) {
          newWidth = maxWidth;
          newHeight = Math.round(height * (maxWidth / width));
        } else {
          newHeight = maxHeight;
          newWidth = Math.round(width * (maxHeight / height));
        }

        if (newWidth * newHeight > 2048) {
          reject(new Error('The output image size exceeds 2048 characters.'));
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Cannot get 2D context.'));
          return;
        }

        context.drawImage(img, 0, 0, newWidth, newHeight);

        const resizedBase64 = canvas.toDataURL();
        resolve(resizedBase64);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = base64Data;
    });
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
    return /^(\+84|84)?[1-9]\d{8}$/
      .test(number);
  }

  private isCheckPassword(password:string):boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(password);
  }
  private isValidEmail(email: string): boolean {
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

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
  serviceGroups:any[]=[];
  services:any[]=[];
  selectServiceGroup:string='';
  selectService:string='';
  onChangeRole(role:any){
    if (role == 2){
      this.serviceGroup.getMedicalProcedureGroupList().subscribe(data=>{
        this.serviceGroups = data.data;
      })
    }
    else {
      this.serviceGroups =[];
      this.services=[];
    }
  }

  onChangeServiceGroup(selectServiceGroup:any){
    console.log(selectServiceGroup)
    this.serviceGroup.getMedicalProcedureGroupWithDetailList().subscribe(data=>{
      console.log("data",data.data);
      this.services = data.data.filter((item:any)=>item.mg_id === selectServiceGroup);
      console.log(this.services)
    })
  }
}
