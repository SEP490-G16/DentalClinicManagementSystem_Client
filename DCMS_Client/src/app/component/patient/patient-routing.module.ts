import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PatientRecordsComponent } from './patient-records/patient-records.component';
import { PatientProfileTabComponent } from './patient-records/patient-profile-tab/patient-profile-tab.component';
import { PatientAppointmentTabComponent } from './patient-records/patient-appointment-tab/patient-appointment-tab.component';
import { PatientPaymentTabComponent } from './patient-records/patient-payment-tab/patient-payment-tab.component';
import { PatientLichtrinhdieutriComponent } from './patient-records/patient-lichtrinhdieutri/patient-lichtrinhdieutri.component';
import { PopupAddExaminationComponent } from '../utils/pop-up/patient/popup-add-examination/popup-add-examination.component';
import { PopupEditExaminationComponent } from '../utils/pop-up/patient/popup-edit-examination/popup-edit-examination.component';

const authRoutes: Routes = [
  {
    path: 'list',
    component: PatientManagementComponent
  },
  {
    path: 'danhsach', children:[
      {
      path:'', component:PatientRecordsComponent,
      },
      {
        path: 'tab/lichtrinhdieutri/:id', children: [
          {path: '',  component:PatientLichtrinhdieutriComponent},
          {path: 'themlankham/:tcId', component:PopupAddExaminationComponent},
          {path: 'sualankham/:tcId/:examinationId', component:PopupEditExaminationComponent}
        ]
      },
      {
        path: 'tab/lichhen/:id',
        component: PatientAppointmentTabComponent
      },
      {
        path: 'tab/thanhtoan/:id',
        component: PatientPaymentTabComponent
      },
      // {path:'tab/profile/:id', component:PatientProfileTabComponent}
      {path:'tab/hosobenhnhan/:id', component:PatientProfileTabComponent}

      ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
