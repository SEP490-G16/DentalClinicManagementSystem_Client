import { ICognitoUser } from './../model/ICognitoUser';
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

  cognitoUser:ICognitoUser ;

  constructor(private cookieService:CookieService) {
    this.cognitoUser = {} as ICognitoUser;

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
    return Auth.signIn(User.userCredential, User.password).then((userResult) => {
      console.log(userResult);
      this.cognitoUser.Username = userResult.username;
      this.cognitoUser.Email = userResult.attributes.email;
      this.cognitoUser.ClientId = userResult.pool.clientId;
      this.cognitoUser.idToken = userResult.signInUserSession.idToken.jwtToken;
      this.cognitoUser.refreshToken = userResult.signInUserSession.refreshToken.token;
      console.log(this.cognitoUser);

      sessionStorage.setItem('id_Token', this.cognitoUser.idToken);
      this.authenticationSubject.next(true);
    });
  }

  signOut(): Promise<any> {
    return Auth.signOut().then(() => {
      this.authenticationSubject.next(false);
    });;
  }

  refreshToken(): Promise<string> {
    if(!this.cognitoUser){
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

  forgotPassword(User:IUser): Promise<any> {
      return Auth.forgotPassword(User.userCredential);
  }

  forgotPasswordSubmit(User:IUser, new_password:string): Promise<any> {
    return Auth.forgotPasswordSubmit(User.userCredential, User.code, new_password);
  }

}
