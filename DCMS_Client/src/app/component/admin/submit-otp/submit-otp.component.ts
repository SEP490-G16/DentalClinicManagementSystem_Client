import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-submit-otp',
  templateUrl: './submit-otp.component.html',
  styleUrls: ['./submit-otp.component.css']
})
export class SubmitOtpComponent implements OnInit {
  showPassword: boolean = true;
  showPasswordConfirm:boolean = true;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  togglePasswordConfirm() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }
  backToRevenue(){
    this.router.navigate(['/doanh-thu'])
  }
}
