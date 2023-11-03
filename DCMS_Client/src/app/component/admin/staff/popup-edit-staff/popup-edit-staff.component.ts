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

  staff_id_temp = "1695557d-3f50-4382-83dd-97c46a0a3f65"

  ngOnInit(): void {

  }

  saveEditedStaff() {
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
}
