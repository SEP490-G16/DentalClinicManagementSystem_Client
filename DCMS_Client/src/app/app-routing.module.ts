import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutsComponent } from "./component/shared/layouts/layouts.component";
import { ChatComponent } from './component/chat/chat.component';
import { RegisterWorkScheduleComponent } from './component/shared/register-work-schedule/register-work-schedule.component';
import { ProfilePersonalComponent } from './component/shared/profile-personal/profile-personal.component';
import {ConfirmAppointmentComponent} from "./component/confirm-appointment/confirm-appointment.component";
import {LayoutsAdminComponent} from "./component/shared/layouts-admin/layouts-admin.component";
import { AuthGuard } from './service/auth-guard.service';


const routes: Routes = [
  {

    path: '', component: LayoutsComponent,
    // canActivate: [AuthGuard],
    children: [

      {
        path: 'bacsi',
        loadChildren: () => import('./component/doctor/doctor.module').then(m => m.DoctorModule),
        // data: { allowedGroups: ['dev-dcms-doctor'] }
      },

      {
        path: 'yta',
        loadChildren: () => import('./component/nurse/nurse.module').then(m => m.NurseModule),
        // data: { allowedGroups: ['dev-dcms-nurse'] }
      },
      {
        path: 'letan',
        loadChildren: () => import('./component/receptionist/receptionist.module').then(m => m.ReceptionistModule),
        // data: { allowedGroups: ['dev-dcms-receptionist'] }
      },
      {
        path: 'benhnhan',
        loadChildren: () => import('./component/patient/patient.module').then(m => m.PatientModule),
        // data: { allowedGroups: ['dev-dcms-patient'] }
      },
    ]
  },
  {path:'admin',component:LayoutsAdminComponent,children:[
      {
        path: '',
        loadChildren: () => import('./component/admin/admin.module').then(m => m.AdminModule)
      },
    ]},


  {
    path: 'benhnhan-zalo', component: LayoutsComponent, children: [
      {
        path: 'thay',
        loadChildren: () => import('./component/patient/benhnhan.module').then(m => m.BenhnhanModule)
      }
    ]
  },
  {
    path: "suahoso",
    component: ProfilePersonalComponent
  },
  {
    path: 'dangkilichlamviec',
    component: RegisterWorkScheduleComponent
  },
  {
    path: 'chat',
    component: ChatComponent
  },

  {
    path: 'dangnhap',
    loadChildren: () => import('./component/auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'xac-nhan-lich-hen', component: ConfirmAppointmentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
