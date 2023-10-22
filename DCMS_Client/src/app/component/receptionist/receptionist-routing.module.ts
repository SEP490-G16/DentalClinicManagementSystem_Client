import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceptionistWaitingRoomComponent } from './receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistTimekeepingComponent } from './receptionist-timekeeping/receptionist-timekeeping.component';
import { ReceptionistAppointmentListComponent } from './receptionist-appointment-list/receptionist-appointment-list.component';

const authRoutes: Routes = [
  {
    path: 'waitingroom',
    component: ReceptionistWaitingRoomComponent
  },

  {
    path: 'timekeeping',
    component: ReceptionistTimekeepingComponent
  },

  {
    path: 'appointment',
    component: ReceptionistAppointmentListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class ReceptionistRoutingModule { }
