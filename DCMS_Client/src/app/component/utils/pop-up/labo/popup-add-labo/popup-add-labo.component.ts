import { LaboService } from '../../../../../service/LaboService/Labo.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IPostLabo } from 'src/app/model/ILabo';
import {ResponseHandler} from "../../../libs/ResponseHandler";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup-add-labo',
  templateUrl: './popup-add-labo.component.html',
  styleUrls: ['./popup-add-labo.component.css']
})
export class PopupAddLaboComponent implements OnInit {

  Labo: IPostLabo;
  disable:boolean = false;
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
  isSubmitted:boolean=false;
  constructor(
    private PostLaboService: LaboService,
    private toastr: ToastrService
  ) {
    this.Labo = {
      name:'',
      address:'',
      phone_number:'',
      email:'',
      description:'',
      active: 1
    }
  }
  loading: boolean = false;
  ngOnInit(): void {

  }

  PostLabo() {
    this.resetErrors();
    if (!this.Labo.name){
      this.LaboErrors.labo_name = "Vui lòng nhập tên labo!";
      this.isSubmitted = true;
    }
    if (!this.Labo.address){
      this.LaboErrors.address = "Vui lòng nhập địa chỉ!";
      this.isSubmitted =true;
    }
    if (!this.Labo.phone_number){
      this.LaboErrors.phone_number = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.Labo.phone_number)){
      this.LaboErrors.phone_number = "Số điện thoại không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.Labo.email){
      this.LaboErrors.email = "Vui lòng nhập email!";
      this.isSubmitted = true;
    }
    else if (!this.isValidEmail(this.Labo.email)){
      this.LaboErrors.email = "Email không hợp lệ!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    if (this.Labo.phone_number && this.Labo.phone_number.length === 9){
      this.Labo.phone_number = '+84' + this.Labo.phone_number;
    }

    // Tiến hành gửi dữ liệu nếu không có lỗi
    //this.loading = true;
    this.disable = true;
    this.PostLaboService.postLabo(this.Labo)
      .subscribe(
        (data) => {
          this.showSuccessToast("Thêm mới Labo thành công");
          this.Labo = {
            name: "",
            address: "",
            phone_number: "",
            email: "",
            description: "",
            active: 1
          };
          //this.loading = false;
          this.disable = false;
          let ref = document.getElementById('cancel-add-labo');
          ref?.click();
          window.location.reload();
         /* setTimeout(() => {
            window.location.reload();
          }, 3000);*/
        },
        (error) => {
          this.loading = false;
          this.disable = false;
          this.showErrorToast("Lỗi khi thêm Labo");
          ResponseHandler.HANDLE_HTTP_STATUS(this.PostLaboService.apiUrl+"/labo", error);
        }
      );

  }

   resetErrors() {
    this.LaboErrors = {
      labo_name: '',
      address: '',
      phone_number: '',
      email: ''
    };
    this.isSubmitted = false;
  }
  private isVietnamesePhoneNumber(number:string):boolean {
    return /^(\+84|0)?[1-9]\d{8}$/
      .test(number);
  }

  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }

  close() {
    this.Labo = {
      name: "",
      address: "",
      phone_number: "",
      email: "",
      description: "",
      active: 1
    };
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
