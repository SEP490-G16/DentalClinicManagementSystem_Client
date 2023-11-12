import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {FacilityComponent} from "./facility/facility.component";
import {LaboComponent} from "./labo/labo.component";
import {MaterialComponent} from "./material/material.component";
import {MedicineComponent} from "./medicine/medicine.component";
import {ServiceComponent} from "./service/service.component";
import {SpecimensComponent} from "./specimens/specimens.component";
import {StaffComponent} from "./staff/staff.component";
import {StaffDetailComponent} from "./staff-detail/staff-detail.component";
import {PendingSpecimensComponent} from "./pending-specimens/pending-specimens.component";
import {PendingMaterialComponent} from "./pending-material/pending-material.component";
import {
  WarehouseImportMaterialManagementComponent
} from "./warehouse-import-material-management/warehouse-import-material-management.component";
import {
  WarehouseExportMaterialManagementComponent
} from "./warehouse-export-material-management/warehouse-export-material-management.component";
import {FollowingTimekeepingComponent} from "./following-timekeeping/following-timekeeping.component";
import { PatientRecordsComponent } from '../patient/patient-records/patient-records.component';
import { PatientLichtrinhdieutriComponent } from '../patient/patient-records/patient-lichtrinhdieutri/patient-lichtrinhdieutri.component';
import { PopupAddExaminationComponent } from '../patient/patient-records/patient-lichtrinhdieutri/popup-add-examination/popup-add-examination.component';
import { PopupEditExaminationComponent } from '../patient/patient-records/patient-lichtrinhdieutri/popup-edit-examination/popup-edit-examination.component';
import { PatientTreatmentCourseTabComponent } from '../patient/patient-records/patient-treatment-course-tab/patient-treatment-course-tab.component';
import { PatientAppointmentTabComponent } from '../patient/patient-records/patient-appointment-tab/patient-appointment-tab.component';
import { PatientPaymentTabComponent } from '../patient/patient-records/patient-payment-tab/patient-payment-tab.component';
import { PatientProfileTabComponent } from '../patient/patient-records/patient-profile-tab/patient-profile-tab.component';


const adminRoutes: Routes = [
  { path: '',   redirectTo: '/admin/co-so', pathMatch: 'full' },
  {path: 'co-so', component: FacilityComponent},
  {path: 'labo', component: LaboComponent},
  {path: '',children:[
      {path: 'vat-lieu', component: MaterialComponent},
      {path: 'quan-ly-nhap', component: WarehouseImportMaterialManagementComponent},
      {path: 'quan-ly-xuat', component: WarehouseExportMaterialManagementComponent}
    ]},
  {path: 'thuoc', component: MedicineComponent},
  {path: 'thu-thuat', component: ServiceComponent},
  {path: '', children:[
      {path: 'mau',component: SpecimensComponent},
      {path: 'mau-dang-cho',component: PendingSpecimensComponent}
    ]},
  {
    path: 'nhan-vien',children: [
      {path: '', component: StaffComponent},
      {path: 'chi-tiet-nhan-vien', component: StaffDetailComponent}
    ]
  },
  {path:'theo-doi-cham-cong',component:FollowingTimekeepingComponent},
  {
    path: 'danhsach', children:[
      {
      path:'', component:PatientRecordsComponent,
      },
      {
        path: 'tab/lichtrinhdieutri/:id', children: [
          {path: '',  component:PatientLichtrinhdieutriComponent},
          {path: 'themlankham/:tcId', component:PopupAddExaminationComponent},
          {path: 'sualankham/:tcId/:examinationId', component:PopupEditExaminationComponent},
          {path: 'chitiet/:examinationId', component: PatientTreatmentCourseTabComponent}
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
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes)
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
