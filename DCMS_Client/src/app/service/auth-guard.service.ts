// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CognitoService } from './cognito.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private cognitoService:CognitoService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const allowedGroups = (next.data as { allowedGroups?: string[] })['allowedGroups'] || [];
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    const userGroupsString = localStorage.getItem('role');
    // const userGroupsString = sessionStorage.getItem('role');
    // if (userGroupsString) {

    //     if (allowedGroups.some(group => group === userGroupsString)) {
    //     console.log("aaaaa", allowedGroups.some(group => group === userGroupsString))
    //     return true;
    //   }
    // }
    if (userGroupsString && lastLoginTime) {
      const currentTime = new Date();
      const lastLoginDate = new Date(lastLoginTime);
      const daysSinceLastLogin = (currentTime.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24);

      if (daysSinceLastLogin <= 15) {
        if (allowedGroups.some(group => group === userGroupsString)) {
          const User = localStorage.getItem("cognitoUser");
          // this.cognitoService.signIn()
          return true;
        }
      } else {
        // Quá 15 ngày, yêu cầu đăng nhập lại
        localStorage.clear();
        this.router.navigate(['/dangnhap']);
        return false;
      }
    }
    console.log("bbbbb");
    //unauthorized
    this.router.navigate(['/dangnhap']);
    return false;
  }
}
