import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceptionistWaitingRoomComponent } from './receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistTimekeepingComponent } from './receptionist-timekeeping/receptionist-timekeeping.component';
import { ReceptionistAppointmentListComponent } from './receptionist-appointment-list/receptionist-appointment-list.component';
import { ReceptionistComponent } from './receptionist.component';
import { FollowingTimekeepingComponent } from "../admin/following-timekeeping/following-timekeeping.component";
import { RegisterWorkScheduleComponent } from '../shared/register-work-schedule/register-work-schedule.component';

const authRoutes: Routes = [
  { path: '', redirectTo: 'lich-hen', pathMatch: 'full' },

  {
    path: 'phong-cho',
    component: ReceptionistWaitingRoomComponent
  },

  {
    path: 'cham-cong',
    component: ReceptionistTimekeepingComponent
  },

  {
    path: 'dang-ky-lich-lam-viec',
    component: RegisterWorkScheduleComponent
  },

  {
    path: 'lich-hen',
    component: ReceptionistAppointmentListComponent
  },
  { path: 'theo-doi-cham-cong', component: FollowingTimekeepingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class ReceptionistRoutingModule { }
