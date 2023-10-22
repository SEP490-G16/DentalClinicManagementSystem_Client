import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./component/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'admin',
    loadChildren: () => import('./component/admin/admin.module').then(m => m.AdminModule)
  },

  {
    path: 'receptionist',
    loadChildren: () => import('./component/receptionist/receptionist.module').then(m => m.ReceptionistModule)
  },

  {
    path: 'doctor',
    loadChildren: () => import('./component/doctor/doctor.module').then(m => m.DoctorModule)
  },

  {
    path: 'patient',
    loadChildren: () => import('./component/patient/patient.module').then(m => m.PatientModule)
  },

  {
    path: 'nurse',
    loadChildren: () => import('./component/nurse/nurse.module').then(m => m.NurseModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
