import { ICognitoUser } from './../model/ICognitoUser';
import { Injectable, EventEmitter } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { IUser } from '../model/IUser';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as AWS from 'aws-sdk';
import { IStaff } from '../model/Staff';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  private authenticationSubject: BehaviorSubject<any>;

  cognitoUser: ICognitoUser;

  constructor(private router:Router) {
    this.cognitoUser = {} as ICognitoUser;

    Amplify.configure({
      Auth: environment.cognito
    });

    AWS.config.region = 'ap-southeast-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'ap-southeast-1:54518664-3eb5-47fd-bc15-5b48ec109d8a',
    });

    this.authenticationSubject = new BehaviorSubject<boolean>(false);

  }

  handlePostLoginRedirect(currentRoute: string): void {
    const userGroupsString = sessionStorage.getItem('userGroups');
    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate(['/bacsi']);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate(['/yta']);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate(['/letan']);
      } else {
        this.router.navigate(['/default-route']);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }


  getUserBySub(sub: string): Promise<any> {
    const params = {
      UserPoolId: environment.cognito.userPoolId,
      Username: sub
    };
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminGetUser(params, (err, data) => {
        if (err) {
          console.error('Lỗi:', err);
          reject(err);
        } else {
          console.log('Thông tin người dùng:', data);
          resolve(data);
        }
      });
    });
  }



  listUsers() {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

    const params = {
      UserPoolId: environment.cognito.userPoolId,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.listUsers(params, (err, data) => {
        if (err) {
          console.error('Lỗi:', err);
          reject(err);
        } else {
          console.log('Danh sách người dùng:', data);
          resolve(data);
        }
      });
    });
  }

  addStaff(User: IStaff): Promise<any> {
    const attributes = {
      email: User.email,
      phone_number: User.phone,
      name: User.name,
      gender: User.gender,
      address: User.address,
      'custom:DOB': User.DOB,
      'custom:description': User.description,
      'custom:status': User.status,
      'custom:image': User.image,
      'custom:role': User.role
    };

    return Auth.signUp({
      username: User.username,
      password: User.password,
      attributes, // Các thuộc tính tùy chỉnh và các thuộc tính tiêu chuẩn
    });
  }

  updateUserAttributes(userId: string, userData: any): Promise<any> {

    const attributes = {
      email: userData.email,
      phone_number: userData.phone,
      name: userData.name,
      gender: userData.gender,
      address: userData.address,
      'custom:DOB': userData.DOB,
      'custom:description': userData.description,
      'custom:status': userData.status,
      'custom:image': userData.image,
    };

    return Auth.updateUserAttributes(userId, attributes)
      .then((result) => {
        console.log('Cập nhật thông tin người dùng thành công:', result);
        return result;
      })
      .catch((error) => {
        console.error('Lỗi cập nhật thông tin người dùng:', error);
        throw error;
      });
  }


  signIn(User: IUser): Promise<any> {
    return Auth.signIn(User.userCredential, User.password).then((userResult) => {

      console.log("User result:", userResult);
      this.cognitoUser.Username = userResult.username;
      this.cognitoUser.Email = userResult.attributes.email;
      this.cognitoUser.ClientId = userResult.pool.clientId;
      this.cognitoUser.idToken = userResult.signInUserSession.idToken.jwtToken;
      this.cognitoUser.refreshToken = userResult.signInUserSession.refreshToken.token;
      this.cognitoUser.locale = userResult.attributes.locale;
      this.cognitoUser.sub = userResult.attributes.sub;
      console.log("CognitoUser: ", this.cognitoUser);

      //
      const groups = userResult.signInUserSession.idToken.payload['cognito:groups'];
      console.log('User Groups:', groups);
      sessionStorage.setItem('userGroups', JSON.stringify(groups));


      sessionStorage.setItem('id_Token', this.cognitoUser.idToken);
      sessionStorage.setItem('locale', this.cognitoUser.locale);
      sessionStorage.setItem('sub', this.cognitoUser.sub);
      sessionStorage.setItem('name', this.cognitoUser.name);
      sessionStorage.setItem('sub-id', this.cognitoUser.sub);
      sessionStorage.setItem('username', this.cognitoUser.Username);
    });
  }


  getRole(): Promise<any> {
    return this.getUser().then((user) => {
      return user && user.attributes ? user.attribute['custom:role'] : '';
    })
  }

  // async listUsers() {
  //   const params = {
  //     UserPoolId: environment.cognito.userPoolId // Thay thế bằng ID của User Pool của bạn
  //   };
  //   try {
  //     const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  //     const users = await cognitoidentityserviceprovider.listUsers(params).promise();
  //     // Xử lý danh sách người dùng ở đây
  //     console.log(users);
  //     return users;
  //   } catch (error) {
  //     console.error('Error fetching users', error);
  //     throw error;
  //   }
  // }



  signOut(): Promise<any> {
    return Auth.signOut().then(() => {
      this.authenticationSubject.next(false);
    });;
  }

  refreshToken(): Promise<string> {
    if (!this.cognitoUser) {
      return Promise.reject('User is not authenticated');
    }

    return Auth.currentSession()
      .then((session) => {
        const accessToken = session.getAccessToken();
        const newAccessToken = accessToken.getJwtToken();
        sessionStorage.setItem('id_Token', newAccessToken);
        return newAccessToken;
      })
      .catch((error) => {
        throw error;
      });
  }


  public isAuthenticated(): Promise<boolean> {
    if (this.authenticationSubject.value) {
      return Promise.resolve(true);
    } else {
      return this.getUser()
        .then((user: any) => {
          if (user) {
            return true;
          } else {
            return false;
          }
        }).catch(() => {
          return false;
        });
    }
  }

  public getUser(): Promise<any> {
    return Auth.currentUserInfo();
  }

  public updateUser(user: IUser): Promise<any> {
    return Auth.currentUserPoolUser()
      .then((cognitoUser: any) => {
        return Auth.updateUserAttributes(cognitoUser, user);
      });
  }

  forgotPassword(User: IUser): Promise<any> {
    return Auth.forgotPassword(User.userCredential);
  }

  forgotPasswordSubmit(User: IUser, new_password: string): Promise<any> {
    return Auth.forgotPasswordSubmit(User.userCredential, User.code, new_password);
  }

}
