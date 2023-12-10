import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { window } from 'rxjs';
import { SecurityService } from 'src/app/service/Security/Security.service';

@Component({
  selector: 'app-security-revenue',
  templateUrl: './security-revenue.component.html',
  styleUrls: ['./security-revenue.component.css']
})
export class SecurityRevenueComponent implements OnInit {

  password:any;
  accessToken: any;
  constructor(
    private securityService: SecurityService,
    private router: Router,
  ) { }

  ngOnInit(): void {

  }

  GetAccessToken() {
    this.securityService.getAccessToken(this.password).subscribe((data) => {
      const now = new Date();
      const res = JSON.parse(data);
      localStorage.setItem("securityAccess", res.data+`/${now.getMinutes()}/${now.getMinutes() + 50}`);
      const a = localStorage.getItem('securityAccess');
      if (a != null) {
        console.log("check access: ", a);
      }
      this.router.navigate(["/doanh-thu"]);
    }, (error) => {
      this.router.navigate(["/bao-mat"]);
    })
  }

  SendOTPByMail(id:any) {
    this.securityService.getOTPWhenForgetPassword(id).subscribe((data) => {
      console.log(data);
    })
  }
}
