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


const adminRoutes: Routes = [
  {path: 'facility', component: FacilityComponent},
  {path: 'labo', component: LaboComponent},
  {path: 'material', component: MaterialComponent},
  {path: 'medicine', component: MedicineComponent},
  {path: 'service', component: ServiceComponent},
  {path: 'specimens', component: SpecimensComponent},
  {
    path: 'staff',children: [
      {path: '', component: StaffComponent},
      {path: 'detail-staff', component: StaffDetailComponent}
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
