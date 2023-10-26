import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';

const authRoutes: Routes = [

  {
    path: '',
    component: LoginComponent
  },

  {
    path: 'receptionist',
    loadChildren: () => import('../receptionist/receptionist.module').then(m => m.ReceptionistModule)
  },

  {
    path: 'patient',
    loadChildren: () => import('../patient/patient.module').then(m => m.PatientModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }