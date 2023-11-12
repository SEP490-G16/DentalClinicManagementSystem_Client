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
import { PopupAddPatientComponent } from './patient-records/popup-add-patient/popup-add-patient.component';
import { PatientProfileTabComponent } from './patient-records/patient-profile-tab/patient-profile-tab.component';
import { PatientTreatmentCourseTabComponent } from './patient-records/patient-treatment-course-tab/patient-treatment-course-tab.component';
import { PatientAppointmentTabComponent } from './patient-records/patient-appointment-tab/patient-appointment-tab.component';
import { PatientPaymentTabComponent } from './patient-records/patient-payment-tab/patient-payment-tab.component';

import { PopupDeletePatientComponent } from './patient-records/popup-delete-patient/popup-delete-patient.component';
import { PatientLichtrinhdieutriComponent } from './patient-records/patient-lichtrinhdieutri/patient-lichtrinhdieutri.component';
import { VNDateTimeFormatPipe } from '../shared/pipe/datetimeformat.pipe';
import { PopupAddTreatmentcourseComponent } from './patient-records/patient-lichtrinhdieutri/popup-add-treatmentcourse/popup-add-treatmentcourse.component';
import { PopupEditTreatmentcourseComponent } from './patient-records/patient-lichtrinhdieutri/popup-edit-treatmentcourse/popup-edit-treatmentcourse.component';
import { PopupAddExaminationComponent } from './patient-records/patient-lichtrinhdieutri/popup-add-examination/popup-add-examination.component';
import { PopupEditExaminationComponent } from './patient-records/patient-lichtrinhdieutri/popup-edit-examination/popup-edit-examination.component';
import { PopupDatlichtaikhamComponent } from './patient-records/patient-appointment-tab/popup-datlichtaikham/popup-datlichtaikham.component';
import { PopupSualichtaikhamComponent } from './patient-records/patient-appointment-tab/popup-sualichtaikham/popup-sualichtaikham.component';
@NgModule({
  declarations: [
      PatientManagementComponent,
      PatientRecordsComponent,
      PopupAddPatientComponent,
      PatientProfileTabComponent,
      PatientTreatmentCourseTabComponent,
      PatientAppointmentTabComponent,
      PatientPaymentTabComponent,
      PopupDeletePatientComponent,
      PatientLichtrinhdieutriComponent,
      VNDateTimeFormatPipe,
      PopupAddTreatmentcourseComponent,
      PopupEditTreatmentcourseComponent,
      PopupAddExaminationComponent,
      PopupEditExaminationComponent,
      PopupDatlichtaikhamComponent,
      PopupSualichtaikhamComponent
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
  ],
  exports: [
    PopupAddPatientComponent,
    VNDateTimeFormatPipe
  ],

  providers: [DatePipe]
})
export class PatientModule { }
