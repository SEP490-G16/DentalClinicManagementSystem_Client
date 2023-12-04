import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CognitoService } from './cognito.service';

@Injectable({
  providedIn: 'root'
})
export class IsLoginGuard implements CanActivate {
  constructor(private cognitoService: CognitoService, private router: Router) {}

  // async canActivate(): Promise<boolean> {
  //   const isAuthenticated = await this.cognitoService.isAuthenticated();
   canActivate():boolean {
    const isAuthenticated = sessionStorage.getItem('role');
    if (isAuthenticated) {
      const lastRoute = sessionStorage.getItem('lastRoute') || '';
      this.router.navigate([lastRoute]);
      return false;
    }
    return true;
  }
}
