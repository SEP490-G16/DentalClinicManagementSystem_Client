import { Component, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { ReceptionistModule } from './component/receptionist/receptionist.module';
import { SharedModule } from "./component/shared/shared.module";
import { AdminModule } from './component/admin/admin.module';
import { DoctorModule } from './component/doctor/doctor.module';
import { NurseModule } from './component/nurse/nurse.module';
import { PatientModule } from './component/patient/patient.module';
import { AuthModule } from './component/auth/auth.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    ReceptionistModule,
    AdminModule,
    DoctorModule,
    NurseModule,
    PatientModule,
    AuthModule,
    CommonModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
