import { LaboService } from './../../../../service/LaboService/Labo.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IPostLabo } from 'src/app/model/ILabo';

@Component({
  selector: 'app-popup-add-labo',
  templateUrl: './popup-add-labo.component.html',
  styleUrls: ['./popup-add-labo.component.css']
})
export class PopupAddLaboComponent implements OnInit {

  Labo: IPostLabo;

  LaboErrors: {
    labo_name: string,
    address: string,
    phone_number: string,
    email: string
  } = {
      labo_name: '',
      address: '',
      phone_number: '',
      email: ''
    };

  constructor(
    private PostLaboService: LaboService,
    private toastr: ToastrService
  ) {
    this.Labo = {
      labo_name: "",
      address: "",
      phone_number: "",
      email: ""
    }
  }

  ngOnInit(): void {

  }

  PostLabo() {
    console.log(this.Labo);
    this.resetErrors();
    if (!this.Labo.labo_name) {
      this.LaboErrors.labo_name = 'Tên labo không được để trống';
    }
    if (!this.Labo.address) {
      this.LaboErrors.address = 'Địa chỉ không được để trống';
    }
    if (!this.Labo.phone_number) {
      this.LaboErrors.phone_number = 'Số điện thoại không được để trống';
    }
    if (!this.Labo.email) {
      this.LaboErrors.email = 'Email không được để trống';
    } else if (!this.isValidEmail(this.Labo.email)) {
      this.LaboErrors.email = 'Địa chỉ email không hợp lệ';
    }

    // Kiểm tra xem có lỗi nào không
    if (this.hasErrors()) {
      this.showErrorToast("Vui lòng kiểm tra và điền đầy đủ thông tin cần thiết.");
    } else {
      // Tiến hành gửi dữ liệu nếu không có lỗi
      this.PostLaboService.postLabo(this.Labo)
        .subscribe(
          (data) => {
            this.showSuccessToast("Thêm mới Labo thành công");
            this.Labo = {
              labo_name: "",
              address: "",
              phone_number: "",
              email: ""
            };
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          },
          (err) => {
            this.showErrorToast("Lỗi khi thêm Labo");
          }
        );
    }
  }

  private resetErrors() {
    this.LaboErrors = {
      labo_name: '',
      address: '',
      phone_number: '',
      email: ''
    };
  }

  private hasErrors() {
    return Object.values(this.LaboErrors).some((error) => error !== '');
  }

  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }

  close() {
    this.Labo = {
      labo_name: "",
      address: "",
      phone_number: "",
      email: ""
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
}
