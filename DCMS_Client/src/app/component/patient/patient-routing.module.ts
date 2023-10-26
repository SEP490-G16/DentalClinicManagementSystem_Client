import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PatientRecordsComponent } from './patient-records/patient-records.component';
import {ChangeAppointmentComponent} from "./change-appointment/change-appointment.component";

const authRoutes: Routes = [
  {
    path: 'list',
    component: PatientManagementComponent
  },
  {
    path:'change-appointment', component:ChangeAppointmentComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
