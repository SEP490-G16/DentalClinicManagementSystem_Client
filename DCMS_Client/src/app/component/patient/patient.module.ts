import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule, NgbModalModule, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';


import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PatientRecordsComponent } from './patient-records/patient-records.component';
import { SharedModule } from '../shared/shared.module';
import { PatientRoutingModule } from './patient-routing.module';
import { ChangeAppointmentComponent } from './change-appointment/change-appointment.component';
import { PopupAddPatientComponent } from './patient-records/popup-add-patient/popup-add-patient.component';
import { PatientProfileTabComponent } from './patient-records/patient-profile-tab/patient-profile-tab.component';
import { PatientTreatmentCourseTabComponent } from './patient-records/patient-treatment-course-tab/patient-treatment-course-tab.component';
import { PatientAppointmentTabComponent } from './patient-records/patient-appointment-tab/patient-appointment-tab.component';
import { PatientPaymentTabComponent } from './patient-records/patient-payment-tab/patient-payment-tab.component';


import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PopupDeletePatientComponent } from './patient-records/popup-delete-patient/popup-delete-patient.component';
import { PatientLichtrinhdieutriComponent } from './patient-records/patient-lichtrinhdieutri/patient-lichtrinhdieutri.component';
import { VNDateTimeFormatPipe } from '../shared/pipe/datetimeformat.pipe';
@NgModule({
  declarations: [
      PatientManagementComponent,
      PatientRecordsComponent,
      ChangeAppointmentComponent,
      PopupAddPatientComponent,
      PatientProfileTabComponent,
      PatientTreatmentCourseTabComponent,
      PatientAppointmentTabComponent,
      PatientPaymentTabComponent,
      PopupDeletePatientComponent,
      PatientLichtrinhdieutriComponent,
      VNDateTimeFormatPipe
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
    MatMomentDateModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  providers: [DatePipe]
})
export class PatientModule { }
