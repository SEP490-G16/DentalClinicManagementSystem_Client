import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError, from, tap } from 'rxjs';
import { CognitoService } from '../cognito.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private cognitoService: CognitoService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Token hết hạn, cần làm mới
          return this.handle401Error(req, next);
        } else {
          // Các lỗi khác
          return throwError(() => error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.cognitoService.refreshToken()).pipe(
      switchMap((newToken: string) => {
        if (!newToken) {
          // Nếu không lấy được token mới
          return throwError(() => new Error('Token refresh failed'));
        }

        console.log("Token updated");
        // Cập nhật token mới vào yêu cầu
        // const updatedRequest = request.clone({
        //   headers: request.headers.set('Authorization', `${newToken}`)
        // });

        const updatedRequest = request.clone({
          setHeaders: {
            'Authorization': `${newToken}`,
            'Accept': 'application/json',
          }
        });

        return next.handle(updatedRequest);
      }),
      catchError((err) => {
        console.error('Error in refresh token', err);
        // Phát ra sự kiện chuyển hướng
        return throwError(() => new Error(err));
      }),
      tap({
        error: () => {
          // Chuyển hướng nếu cần
          this.router.navigate(['dangnhap']);
        }
      })
    );
  }
}
