import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-personal',
  templateUrl: './profile-personal.component.html',
  styleUrls: ['./profile-personal.component.css']
})
export class ProfilePersonalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  hoVaTen:string='Nguyễn Văn A';
  ngaySinh:string='20/01/1994';
  gioiTinh:string='Nam';
  sdt:string='0912345678';
  email:string='Anv@gmail.com';
  diaChi:string='Hà Nội';
  chucVu:string='Bác sĩ';
  ghiChu:string='abc';
  coSo:string='1';
  isEditing: boolean = false;
  matkhau:string='1234';

  toggleEditing() {
    this.isEditing = !this.isEditing;
  }
  showPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
