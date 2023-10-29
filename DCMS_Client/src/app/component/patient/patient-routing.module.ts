import { PatientTreatmentCourseTabComponent } from './patient-records/patient-treatment-course-tab/patient-treatment-course-tab.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PatientRecordsComponent } from './patient-records/patient-records.component';
import {ChangeAppointmentComponent} from "./change-appointment/change-appointment.component";
import { PatientProfileTabComponent } from './patient-records/patient-profile-tab/patient-profile-tab.component';
import { PatientAppointmentTabComponent } from './patient-records/patient-appointment-tab/patient-appointment-tab.component';
import { PatientPaymentTabComponent } from './patient-records/patient-payment-tab/patient-payment-tab.component';

const authRoutes: Routes = [
  {
    path: 'list',
    component: PatientManagementComponent
  },
  {
    path: 'records',
    component: PatientRecordsComponent
  },
  {
    path:'change-appointment', component:ChangeAppointmentComponent
  },
  {
    path: 'tab/profile',
    component: PatientProfileTabComponent
  },
  {
    path: 'tab/treatment-course',
    component: PatientTreatmentCourseTabComponent
  },
  {
    path: 'tab/appointment',
    component: PatientAppointmentTabComponent
  },
  {
    path: 'tab/payment',
    component: PatientPaymentTabComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
