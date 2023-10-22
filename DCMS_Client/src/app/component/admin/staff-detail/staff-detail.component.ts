import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-staff-detail',
  templateUrl: './staff-detail.component.html',
  styleUrls: ['./staff-detail.component.css']
})
export class StaffDetailComponent implements OnInit {
  showPassword: boolean = true;
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
  matkhau:string='123456';

  toggleEditing() {
    this.isEditing = !this.isEditing;
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
