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
import { PopupAddPatientComponent } from '../utils/pop-up/patient/popup-add-patient/popup-add-patient.component';
import { PatientProfileTabComponent } from './patient-records/patient-profile-tab/patient-profile-tab.component';
import { PatientAppointmentTabComponent } from './patient-records/patient-appointment-tab/patient-appointment-tab.component';

import { PopupDeletePatientComponent } from '../utils/pop-up/patient/popup-delete-patient/popup-delete-patient.component';
import { PatientLichtrinhdieutriComponent } from './patient-records/patient-lichtrinhdieutri/patient-lichtrinhdieutri.component';
import { VNDateTimeFormatPipe } from '../shared/pipe/datetimeformat.pipe';
import {PopupPaymentComponent} from './patient-records/patient-payment-tab/pop-up-payment/popup-payment.component'

import { PopupAddTreatmentcourseComponent } from '../utils/pop-up/patient/popup-add-treatmentcourse/popup-add-treatmentcourse.component';
import { PopupEditTreatmentcourseComponent } from '../utils/pop-up/patient/popup-edit-treatmentcourse/popup-edit-treatmentcourse.component';
import { PopupAddExaminationComponent } from '../utils/pop-up/patient/popup-add-examination/popup-add-examination.component';
import { PopupEditExaminationComponent } from '../utils/pop-up/patient/popup-edit-examination/popup-edit-examination.component';
import { PopupDatlichtaikhamComponent } from '../utils/pop-up/patient/popup-datlichtaikham/popup-datlichtaikham.component';
import { PopupSualichtaikhamComponent } from '../utils/pop-up/patient/popup-sualichtaikham/popup-sualichtaikham.component';
import { PatientPaymentTabComponent } from './patient-records/patient-payment-tab/patient-payment-tab.component';
import { PatientSpecimensComponent } from './patient-records/patient-specimens/patient-specimens.component';
@NgModule({
  declarations: [
      PatientManagementComponent,
      PatientRecordsComponent,
      PopupAddPatientComponent,
      PatientProfileTabComponent,
      PatientAppointmentTabComponent,
      PopupDeletePatientComponent,
      PatientLichtrinhdieutriComponent,
      VNDateTimeFormatPipe,
      PopupAddTreatmentcourseComponent,
      PopupEditTreatmentcourseComponent,
      PopupAddExaminationComponent,
      PopupEditExaminationComponent,
      PopupDatlichtaikhamComponent,
      PopupSualichtaikhamComponent,
      PopupPaymentComponent,
      PatientPaymentTabComponent,
      PatientSpecimensComponent
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
