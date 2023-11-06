import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceptionistWaitingRoomComponent } from './receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistTimekeepingComponent } from './receptionist-timekeeping/receptionist-timekeeping.component';
import { ReceptionistAppointmentListComponent } from './receptionist-appointment-list/receptionist-appointment-list.component';
import { ReceptionistComponent } from './receptionist.component';

const authRoutes: Routes = [
  {
    path: '',
    component: ReceptionistComponent
  },

  {
    path: 'phong-cho',
    component: ReceptionistWaitingRoomComponent
  },

  {
    path: 'cham-cong',
    component: ReceptionistTimekeepingComponent
  },

  {
    path: 'lich-hen',
    component: ReceptionistAppointmentListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class ReceptionistRoutingModule { }
