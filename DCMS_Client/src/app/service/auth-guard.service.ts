import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CognitoService } from './cognito.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  constructor(private cognitService:CognitoService) { }

  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      return this.cognitService.getRole().then((role) => {
        return role?true:false;
      })
  }
}
