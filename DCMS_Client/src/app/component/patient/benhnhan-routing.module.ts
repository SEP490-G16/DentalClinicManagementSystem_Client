
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChangeAppointmentComponent} from "./change-appointment/change-appointment.component";

const benhnhanRoutes: Routes = [
  {
    path:'doilichhen/:epoch/:appointmentId', component:ChangeAppointmentComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(benhnhanRoutes)],
  exports: [RouterModule]
})
export class BenhnhanRoutingModule { }
