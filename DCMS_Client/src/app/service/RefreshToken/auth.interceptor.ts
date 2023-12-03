// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError, switchMap, catchError, from } from 'rxjs';
// import { CognitoService } from '../cognito.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   constructor(private cognitoService: CognitoService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError(error => {
//         if (error instanceof HttpErrorResponse && error.status === 401) {
//           // Token hết hạn, cần làm mới
//           return this.handle401Error(req, next);
//         } else {
//           // Các lỗi khác
//           return throwError(() => new Error(error));
//         }
//       })
//     );
//   }

//   private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return from(this.cognitoService.refreshToken()).pipe(
//       switchMap((newToken: string) => {
//         // Cập nhật token mới vào yêu cầu
//         const updatedRequest = request.clone({
//           headers: request.headers.set('Authorization', newToken)
//         });
//         return next.handle(updatedRequest);
//       }),
//       catchError((err) => {
//         console.error('Error in refresh token', err);
//         return throwError(() => new Error(err));
//       })
//     );
//   }
// }
