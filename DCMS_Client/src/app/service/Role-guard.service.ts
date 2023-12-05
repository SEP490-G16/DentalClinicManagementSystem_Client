import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private cognitoService: CognitoService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const userGroups = ['1', '2', '3', '4', '5'];
      const allowedGroups = route.data['allowedGroups'] as string[];

      if (userGroups.some((userGroup:any) => allowedGroups.includes(userGroup))) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
