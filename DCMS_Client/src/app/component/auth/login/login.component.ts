import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from 'src/app/model/IUser';
import { CognitoService } from 'src/app/service/cognito.service';
// import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isEnterEmail: boolean = false;
  isForgotPassword: boolean = false;

  User: IUser;
  loading: boolean;
  newPassword: string = '';
  validateLogin = {
    validateUserName: '',
    validatePassword: '',
  }

  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, private route: ActivatedRoute, private cognitoService: CognitoService) {
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
        this.loading = false;
        this.router.navigate(['']);
        //const userGroupsString = sessionStorage.getItem('userGroups');
        // console.log("User groups: ", userGroupsString);
        // if (userGroupsString) {
        //   const userGroups = JSON.parse(userGroupsString) as string[];
        //   if (userGroups.includes('dev-dcms-doctor')) {
        //     this.router.navigate(['bacsi']);
        //   } else if (userGroups.includes('dev-dcms-nurse')) {
        //     this.router.navigate(['yta']);
        //   } else if (userGroups.includes('dev-dcms-receptionist')) {
        //     this.router.navigate(['letan']);
        //   } else if (userGroups.includes('dev-dcms-admin')) {
        //     this.router.navigate(['admin']);
        //   }
        //   console.log("User groups: ", userGroupsString);

        // } else {
        //   console.error('Không có thông tin về nhóm người dùng.');
        //   this.router.navigate(['/default-route']);
        // }
      })
        .catch((err) => {
          this.loading = false;
          alert(err);
        })
    } else {
      this.loading = false;
      // alert("Tài khoản/email hoặc Password không được để trống.");
    }
  }


  forgotPassword() {
    this.loading = true;
    if (this.User && this.User.userCredential) {
      console.log(this.User.userCredential);
      this.cognitoService.forgotPassword(this.User).then(() => {
        this.isForgotPassword = true;
        this.loading = false;
      })
        .catch((err) => {
          this.loading = false;
          alert(err)
        })
    } else {
      this.loading = false;
      alert('Vui lòng nhập Email')
    }
  }

  forgotPasswordSubmit() {
    this.loading = true;
    if (this.User.code && this.newPassword.trim().length != 0) {
      this.cognitoService.forgotPasswordSubmit(this.User, this.newPassword.trim())
        .then(() => {
          alert('Đổi mật khẩu thành công!')
          this.isEnterEmail = false
          this.isForgotPassword = false;
          this.loading = false;
          this.router.navigate([''])
        }).catch((err) => {
          this.loading = false;
          alert(err);
        });
    } else {
      this.loading = false;
      alert('Mã xác nhận hoặc Mật khẩu không được để trống. !!')
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

  users: any[] = [];

  // async getUsers() {
  //   try {
  //     const { Users } = await Auth.listUsers();
  //     this.users = Users;
  //     console.log('List of users:', this.users);
  //   } catch (error) {
  //     console.log('Error:', error);
  //   }
  // }


}
