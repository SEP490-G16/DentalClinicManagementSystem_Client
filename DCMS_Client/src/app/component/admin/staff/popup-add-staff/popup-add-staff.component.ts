import { IStaff } from './../../../../model/Staff';
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
  imageURL: string | ArrayBuffer = '';
  showPassword: boolean = true;
  showPasswordRepeat:boolean = true;
  password: string = '';
  passwordRepeat:string = '';


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


}
