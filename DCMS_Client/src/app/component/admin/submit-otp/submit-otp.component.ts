import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { SecurityService } from 'src/app/service/Security/Security.service';

@Component({
  selector: 'app-submit-otp',
  templateUrl: './submit-otp.component.html',
  styleUrls: ['./submit-otp.component.css']
})
export class SubmitOtpComponent implements OnInit {
  showPassword: boolean = true;
  showPasswordConfirm:boolean = true;
  otp:any;
  new_access_code:any;
  password:any;
  constructor(private router: Router, private securityService: SecurityService) { }

  ngOnInit(): void {
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  togglePasswordConfirm() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }
  backToRevenue() {
    this.securityService.postPrivateAccess(this.otp, this.password).subscribe((data) => {
      const now = new Date();
      localStorage.setItem("securityAccess", data.data + `/${now.getMinutes()}/${now.getMinutes() + 50}`);
      console.log("chuyển hướng");
      this.router.navigate(["/doanh-thu"]);
    })
  }
}
