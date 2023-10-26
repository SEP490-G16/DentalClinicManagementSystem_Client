import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from 'src/app/model/IUser';
import { CognitoService } from 'src/app/service/cognito.service';
// import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isEnterEmail:boolean = false;
  isForgotPassword: boolean = false;

  User: IUser;
  loading: boolean;
  newPassword: string = '';

  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, private cognitoService: CognitoService) {
    this.User = {} as IUser;
    this.loading = false;

    // config OAuthService
    this.configureOAuth();
  }


  ngOnInit(): void {
  }

  configureOAuth() {
    // this.oauthService.configure({
    //   clientId: 'GOOGLE_CLIENT_ID',
    //   redirectUri: window.location.origin,
    //   responseType: 'token',
    //   scope: 'openid profile email',
    // });

    // this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    // this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  loginWithGoogle() {
    // this.oauthService.initCodeFlow();
  }

  login(): void {
    this.loading = true;
    if (this.User && this.User.userCredential && this.User.password) {
      this.cognitoService.signIn(this.User).then(() => {
        this.router.navigate(['/receptionist/appointment'])
        this.loading = false;
      })
        .catch((err) => {
          this.loading = false;
          alert(err);
        })
    } else {
      this.loading = false;
      alert("Username/email or password is required.");
    }
  }


  forgotPassword() {
    this.loading = true;
    if (this.User && this.User.userCredential) {
      console.log(this.User.userCredential);
      this.cognitoService.forgotPassword(this.User).then(() => {
        this.isForgotPassword=true;
        this.loading = false;
      })
        .catch((err) => {
          this.loading = false;
          alert(err)
        })
    } else {
      this.loading = false;
      alert('Please enter Email')
    }
  }

  forgotPasswordSubmit() {
    this.loading = true;
    if (this.User.code && this.newPassword.trim().length != 0) {
      this.cognitoService.forgotPasswordSubmit(this.User, this.newPassword.trim())
        .then(() => {
          alert('Password change successfully!')
          this.isEnterEmail=false
          this.isForgotPassword = false;
          this.loading = false;
          this.router.navigate([''])
        }).catch((err) => {
          this.loading = false;
          alert(err);
        });
    } else {
      this.loading = false;
      alert('Code or Password is required. !!')
    }
  }



  toggleView(isForgot: boolean) {
    const container = this.el.nativeElement.querySelector('#container');
    if (isForgot) {
      this.renderer.addClass(container, 'active');
    } else {
      this.renderer.removeClass(container, 'active');
    }
  }


}
