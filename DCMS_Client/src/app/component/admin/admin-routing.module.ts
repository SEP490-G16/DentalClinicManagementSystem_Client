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


const adminRoutes: Routes = [
  {path: 'co-so', component: FacilityComponent},
  {path: 'labo', component: LaboComponent},
  {path: 'vat-lieu',children:[
      {path: '', component: MaterialComponent},
      {path: 'quan-ly-nhap', component: WarehouseImportMaterialManagementComponent},
      {path: 'quan-ly-xuat', component: WarehouseExportMaterialManagementComponent}
    ]},
  {path: 'thuoc', component: MedicineComponent},
  {path: 'thu-thuat', component: ServiceComponent},
  {path: 'mau', children:[
      {path: '',component: SpecimensComponent},
      {path: 'mau-dang-cho',component: PendingSpecimensComponent}
    ]},
  {
    path: 'nhan-vien',children: [
      {path: '', component: StaffComponent},
      {path: 'chi-tiet-nhan-vien', component: StaffDetailComponent}
    ]
  },
  {path:'theo-doi-cham-cong',component:FollowingTimekeepingComponent}
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
