import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutsComponent } from "./component/shared/layouts/layouts.component";
import { LayoutsAdminComponent } from "./component/shared/layouts-admin/layouts-admin.component";
import { ChatComponent } from './component/chat/chat.component';
import { RegisterWorkScheduleComponent } from './component/shared/register-work-schedule/register-work-schedule.component';
import { ProfilePersonalComponent } from './component/shared/profile-personal/profile-personal.component';
import { ConfirmAppointmentComponent } from "./component/confirm-appointment/confirm-appointment.component";
import { AuthGuard } from './service/auth-guard.service';
import { CancelSuccessComponent } from './component/patient/change-appointment/cancel-success/cancel-success.component';
import { IsLoginGuard } from './service/IsLogin-guard.service';

const routes: Routes = [

  {
    path: '', component: LayoutsComponent,
    children: [
      {
        path: 'letan',
        loadChildren: () => import('./component/receptionist/receptionist.module').then(m => m.ReceptionistModule),
        // canActivate: [AuthGuard],
        // data: {
        //   allowedGroups: ['dev-dcms-receptionist']
        // }
      },
      {
        path: 'benhnhan',
        loadChildren: () => import('./component/patient/patient.module').then(m => m.PatientModule),
        // canActivate: [AuthGuard],
        // data: {
        //   allowedGroups: ['dev-dcms-doctor', 'dev-dcms-nurse', 'dev-dcms-receptionist', 'dev-dcms-admin']
        // }
      },
      {
        path: "suahoso",
        component: ProfilePersonalComponent,
        data: {
          // allowedGroups: ['dev-dcms-doctor', 'dev-dcms-nurse', 'dev-dcms-receptionist', 'dev-dcms-patient']
        }
      },
      {
        path: 'chat',
        component: ChatComponent
      },
      {
        path: '',
        loadChildren: () => import('./component/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AuthGuard],
        data: {
          allowedGroups: ['1', '2', '3', '4', '5']
        }
      },
    ]
  },

  {
    path: 'dangnhap',
    loadChildren: () => import('./component/auth/auth.module').then(m => m.AuthModule),
    canActivate: [IsLoginGuard]
  },

  {
    path: 'benhnhan-zalo',
    loadChildren: () => import('./component/patient/benhnhan.module').then(m => m.BenhnhanModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
