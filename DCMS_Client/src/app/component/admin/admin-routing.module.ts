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


const adminRoutes: Routes = [
  {path: 'facility', component: FacilityComponent},
  {path: 'labo', component: LaboComponent},
  {path: 'material',children:[
      {path: '', component: MaterialComponent},
      {path: 'approve-material', component: PendingMaterialComponent},
      {path: 'import-material', component: WarehouseImportMaterialManagementComponent},
      {path: 'export-material', component: WarehouseExportMaterialManagementComponent}
    ]},
  {path: 'medicine', component: MedicineComponent},
  {path: 'service', component: ServiceComponent},
  {path: 'specimens', children:[
      {path: '',component: SpecimensComponent},
      {path: 'approve-specimens',component: PendingSpecimensComponent}
    ]},
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
