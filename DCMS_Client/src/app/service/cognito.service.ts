import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { CookieService } from 'ngx-cookie-service';
import { IUser } from '../model/IUser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  private authenticationSubject: BehaviorSubject<any>;

  constructor(private cookieService:CookieService) {
    const configString = this.cookieService.get('config');
    if (configString) {
      Amplify.configure({
        Auth: JSON.parse(configString)
      });
    }
    this.authenticationSubject = new BehaviorSubject<boolean>(false);
  }

  configureCognito(config: any) {
    this.cookieService.set('cognitoConfig', JSON.stringify(config));

    Amplify.configure({
      Auth: config
    });
  }

  signup(User: IUser): Promise<any> {
    return Auth.signUp({
      username: User.userCredential,
      password: User.password
    })
  }

  signIn(User: IUser): Promise<any> {
    return Auth.signIn(User.userCredential, User.password).then(() => {
      this.authenticationSubject.next(true);
    });
  }

  signOut(): Promise<any> {
    return Auth.signOut().then(() => {
      this.authenticationSubject.next(false);
    });;
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

  forgotPassword(User:IUser): Promise<any> {
      return Auth.forgotPassword(User.userCredential);
  }

  forgotPasswordSubmit(User:IUser, new_password:string): Promise<any> {
    return Auth.forgotPasswordSubmit(User.userCredential, User.code, new_password);
  }

}
