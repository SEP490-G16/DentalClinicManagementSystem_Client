import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule, NgbModalModule  } from '@ng-bootstrap/ng-bootstrap';


import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PatientRecordsComponent } from './patient-records/patient-records.component';
import { SharedModule } from '../shared/shared.module';
import { PatientRoutingModule } from './patient-routing.module';
import { ChangeAppointmentComponent } from './change-appointment/change-appointment.component';


@NgModule({
  declarations: [
      PatientManagementComponent,
      PatientRecordsComponent,
      ChangeAppointmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule,
    PatientRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    NgbModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ]
})
export class PatientModule { }
