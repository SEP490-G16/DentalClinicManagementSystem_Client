import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutsComponent } from "./component/shared/layouts/layouts.component";
import { ChatComponent } from './component/chat/chat.component';
import { RegisterWorkScheduleComponent } from './component/shared/register-work-schedule/register-work-schedule.component';
import { ProfilePersonalComponent } from './component/shared/profile-personal/profile-personal.component';
import { ConfirmAppointmentComponent } from "./component/confirm-appointment/confirm-appointment.component";
import { LayoutsAdminComponent } from "./component/shared/layouts-admin/layouts-admin.component";
import { AuthGuard } from './service/auth-guard.service';


const routes: Routes = [

  {
    path: 'dangnhap',
    loadChildren: () => import('./component/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: '', component: LayoutsComponent,
    children: [

      {
        path: 'bacsi',
        loadChildren: () => import('./component/doctor/doctor.module').then(m => m.DoctorModule),
        // canActivate: [AuthGuard], // Áp dụng AuthGuard ở đây
        // data: {
        //   allowedGroups: ['dev-dcms-doctor'] // Cung cấp thông tin về nhóm nếu cần thiết
        // }
      },

      {
        path: 'yta',
        loadChildren: () => import('./component/nurse/nurse.module').then(m => m.NurseModule),
        // canActivate: [AuthGuard],
        // data: {
        //   allowedGroups: ['dev-dcms-nurse']
        // }
      },
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
        //   allowedGroups: ['dev-dcms-doctor', 'dev-dcms-nurse', 'dev-dcms-receptionist']
        // }
      },
      {
        path: "suahoso",
        component: ProfilePersonalComponent,
        data: {
          allowedGroups: ['dev-dcms-doctor', 'dev-dcms-nurse', 'dev-dcms-receptionist', 'dev-dcms-patient']
        }
      },
      {
        path: 'dangkilichlamviec',
        component: RegisterWorkScheduleComponent,
        data: {
          allowedGroups: ['dev-dcms-doctor', 'dev-dcms-nurse', 'dev-dcms-receptionist']
        }
      },
    ]
  },

  {
    path: '', component: LayoutsAdminComponent, children: [
      {
        path: '',
        loadChildren: () => import('./component/admin/admin.module').then(m => m.AdminModule),
        // canActivate: [AuthGuard],
        // data: {
        //   allowedGroups: ['admin']
        // }
      },
    ]
  },

  {
    path: 'benhnhan-zalo',
    loadChildren: () => import('./component/patient/benhnhan.module').then(m => m.BenhnhanModule)
  },

  {
    path: 'chat',
    component: ChatComponent
  },

  { path: 'xac-nhan-lich-hen', component: ConfirmAppointmentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
