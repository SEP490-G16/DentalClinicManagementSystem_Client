import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ToastrModule } from 'ngx-toastr';
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ReceptionistModule } from '../receptionist/receptionist.module';

@NgModule({
  declarations: [
      LoginComponent
  ],
  imports: [
    // OAuthModule.forRoot({
    //   resourceServer: {
    //     allowedUrls: ['API_ENDPOINT'],
    //     sendAccessToken: true
    //   }
    // }),
    CommonModule,
    RouterModule,
    FormsModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    AuthRoutingModule
  ]
})
export class AuthModule { }
