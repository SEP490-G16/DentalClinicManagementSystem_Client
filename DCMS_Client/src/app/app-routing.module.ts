import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutsComponent } from "./component/shared/layouts/layouts.component";
import { ChatComponent } from './component/chat/chat.component';
import { RegisterWorkScheduleComponent } from './component/shared/register-work-schedule/register-work-schedule.component';
import { ProfilePersonalComponent } from './component/shared/profile-personal/profile-personal.component';

const routes: Routes = [
  {

    path: '', component: LayoutsComponent, children: [

      {
        path: 'bacsi',
        loadChildren: () => import('./component/doctor/doctor.module').then(m => m.DoctorModule)
      },

      {
        path: 'yta',
        loadChildren: () => import('./component/nurse/nurse.module').then(m => m.NurseModule)
      },
      {
        path: 'letan',
        loadChildren: () => import('./component/receptionist/receptionist.module').then(m => m.ReceptionistModule)
      }
    ]
  },
  {
    path:"suahoso",
    component: ProfilePersonalComponent
  },
  {
    path: 'dangkilichlamviec',
    component: RegisterWorkScheduleComponent
  },
  {
    path:'chat',
    component: ChatComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('./component/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'benhnhan',
    loadChildren: () => import('./component/patient/patient.module').then(m => m.PatientModule)
  },
  {
    path: 'dangnhap',
    loadChildren: () => import('./component/auth/auth.module').then(m => m.AuthModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
