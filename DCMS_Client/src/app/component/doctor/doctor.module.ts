import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import { DoctorComponent } from './doctor.component';
import { PatientModule } from '../patient/patient.module';
import { ToastrModule } from 'ngx-toastr';
import { DoctorRoutingModule } from './doctor-routing.module';



@NgModule({
  declarations: [
    DoctorComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DoctorRoutingModule,
    PatientModule,
    SharedModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ]
})
export class DoctorModule { }
