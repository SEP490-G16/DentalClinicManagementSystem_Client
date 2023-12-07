import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChangeAppointmentComponent} from "./change-appointment/change-appointment.component";
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { CancelSuccessComponent } from './change-appointment/cancel-success/cancel-success.component';
import { PopupConfirmAppointmentComponent } from '../utils/pop-up/appointment/popup-confirm-appointment/popup-confirm-appointment.component';

const benhnhanRoutes: Routes = [
  {
    path:'doilichhen/:epoch/:appointmentId', component:ChangeAppointmentComponent
  },
  {
    path: 'xac-nhan-lich-hen/:epoch/:appointmentId',
    component: ConfirmAppointmentComponent
  },
  {
    path: 'sua-lich-hen-thanh-cong/:epoch/:appointmentId',
    component: PopupConfirmAppointmentComponent
  },
  {
    path: 'huy-lich-hen/:epoch/:appointmentId',
    component: CancelSuccessComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(benhnhanRoutes)],
  exports: [RouterModule]
})
export class BenhnhanRoutingModule { }
