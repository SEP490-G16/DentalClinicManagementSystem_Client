import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin.component';
import { FacilityComponent } from './facility/facility.component';
import { LaboComponent } from './labo/labo.component';
import { MaterialComponent } from './material/material.component';
import { MedicineComponent } from './medicine/medicine.component';
import { PendingMaterialComponent } from './pending-material/pending-material.component';
import { PendingSpecimensComponent } from './pending-specimens/pending-specimens.component';
import { ServiceComponent } from './service/service.component';
import { SpecimensComponent } from './specimens/specimens.component';
import { StaffComponent } from './staff/staff.component';
import { StaffDetailComponent } from './staff-detail/staff-detail.component';
import { WarehouseExportMaterialManagementComponent } from './warehouse-export-material-management/warehouse-export-material-management.component';
import { WarehouseImportMaterialManagementComponent } from './warehouse-import-material-management/warehouse-import-material-management.component';
import { PopupAddApproveSpecimensComponent } from '../utils/pop-up/pending-specimen/popup-add-approve-specimens/popup-add-approve-specimens.component';
import { PopupDeleteFacilityComponent } from '../utils/pop-up/Facility/popup-delete-facility/popup-delete-facility.component';
import { PopupAddBillExportMaterialComponent } from './warehouse-export-material-management/popup-add-bill-export-material/popup-add-bill-export-material.component';
import { PopupAddFacilityComponent } from '../utils/pop-up/Facility/popup-add-facility/popup-add-facility.component';
import { PopupAddBillImportMaterialComponent } from '../utils/pop-up/import-bill-material/popup-add-bill-import-material/popup-add-bill-import-material.component';
import { PopupDeleteBillExportMaterialComponent } from './warehouse-export-material-management/popup-delete-bill-export-material/popup-delete-bill-export-material.component';
import { PopupDeleteBillImportMaterialComponent } from '../utils/pop-up/import-bill-material/popup-delete-bill-import-material/popup-delete-bill-import-material.component';
import { PopupDetailBillExportMaterialComponent } from './warehouse-export-material-management/popup-detail-bill-export-material/popup-detail-bill-export-material.component';
import { PopupDetailBillImportMaterialComponent } from '../utils/pop-up/import-bill-material/popup-detail-bill-import-material/popup-detail-bill-import-material.component';
import { PopupAddStaffComponent } from '../utils/pop-up/staff/popup-add-staff/popup-add-staff.component';
import { PopupDeleteStaffComponent } from '../utils/pop-up/staff/popup-delete-staff/popup-delete-staff.component';
import { PopupDeleteSpecimensComponent } from '../utils/pop-up/specimen/popup-delete-specimens/popup-delete-specimens.component';
import { PopupDeleteServiceComponent } from '../utils/pop-up/service/popup-delete-service/popup-delete-service.component';
import { PopupAddServiceComponent } from '../utils/pop-up/service/popup-add-service/popup-add-service.component';
import { PopupDeleteGroupServiceComponent } from '../utils/pop-up/service/popup-delete-group-service/popup-delete-group-service.component';
import { PopupAddGroupServiceComponent } from '../utils/pop-up/service/popup-add-group-service/popup-add-group-service.component';
import { PopupAddSpecimensComponent } from '../utils/pop-up/specimen/popup-add-specimens/popup-add-specimens.component';
import { PopupDeleteMedicineComponent } from './medicine/popup-delete-medicine/popup-delete-medicine.component';
import { PopupAddMedicineComponent } from './medicine/popup-add-medicine/popup-add-medicine.component';
import { PopupDeleteMaterialComponent } from '../utils/pop-up/material/popup-delete-material/popup-delete-material.component';
import { PopupAddMaterialComponent } from '../utils/pop-up/material/popup-add-material/popup-add-material.component';
import { PopupAddLaboComponent } from '../utils/pop-up/labo/popup-add-labo/popup-add-labo.component';
import { PopupDeleteLaboComponent } from '../utils/pop-up/labo/popup-delete-labo/popup-delete-labo.component';
import { ProfilePersonalComponent } from '../shared/profile-personal/profile-personal.component';
import {AdminRoutingModule} from "./admin-routing.module";
import { PopupEditGroupServiceComponent } from '../utils/pop-up/service/popup-edit-group-service/popup-edit-group-service.component';
import { PopupEditLaboComponent } from '../utils/pop-up/labo/popup-edit-labo/popup-edit-labo.component';
import { PopupEditSpecimensComponent } from '../utils/pop-up/specimen/popup-edit-specimens/popup-edit-specimens.component';
import { PopupEditServiceComponent } from '../utils/pop-up/service/popup-edit-service/popup-edit-service.component';
import { PopupEditApproveSpecimensComponent } from '../utils/pop-up/pending-specimen/popup-edit-approve-specimens/popup-edit-approve-specimens.component';
import { PopupEditFacilityComponent } from '../utils/pop-up/Facility/popup-edit-facility/popup-edit-facility.component';
import { PopupEditStaffComponent } from '../utils/pop-up/staff/popup-edit-staff/popup-edit-staff.component';
import { PopupEditMaterialComponent } from '../utils/pop-up/material/popup-edit-material/popup-edit-material.component';
import { PopupEditMedicineComponent } from './medicine/popup-edit-medicine/popup-edit-medicine.component';

import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {NgSelectModule} from "@ng-select/ng-select";
import { PopupEditBillImportMaterialComponent } from '../utils/pop-up/import-bill-material/popup-edit-bill-import-material/popup-edit-bill-import-material.component';
import { FollowingTimekeepingComponent } from './following-timekeeping/following-timekeeping.component';
import { vnDateTimeFormatPipe } from '../shared/pipe/VNdateformat.pipe';

@NgModule({
  declarations: [
      AdminComponent,
      FacilityComponent,
      LaboComponent,
      MaterialComponent,
      MedicineComponent,
      PendingMaterialComponent,
      PendingSpecimensComponent,
      ServiceComponent,
      SpecimensComponent,
      StaffComponent,
      StaffDetailComponent,
      WarehouseExportMaterialManagementComponent,
      WarehouseImportMaterialManagementComponent,
      PopupAddStaffComponent,
      PopupDeleteStaffComponent,
      PopupAddSpecimensComponent,
      PopupDeleteSpecimensComponent,
      PopupAddServiceComponent,
      PopupDeleteServiceComponent,
      PopupAddGroupServiceComponent,
      PopupDeleteGroupServiceComponent,
      PopupDeleteMedicineComponent,
      PopupAddMedicineComponent,
      PopupAddMaterialComponent,
      PopupDeleteMaterialComponent,
      PopupAddLaboComponent,
      PopupEditLaboComponent,
      PopupDeleteLaboComponent,
      PopupAddBillExportMaterialComponent,
      PopupAddBillImportMaterialComponent,
      PopupAddFacilityComponent,
      PopupAddApproveSpecimensComponent,
      PopupDetailBillImportMaterialComponent,
      PopupDetailBillExportMaterialComponent,
      PopupDeleteBillExportMaterialComponent,
      PopupDeleteBillImportMaterialComponent,
      PopupDeleteFacilityComponent,
      PopupEditGroupServiceComponent,
      PopupEditSpecimensComponent,
      PopupEditServiceComponent,
      PopupEditApproveSpecimensComponent,
      PopupEditFacilityComponent,
      PopupEditStaffComponent,
      PopupEditMaterialComponent,
      PopupEditMedicineComponent,
      PopupEditBillImportMaterialComponent,
      FollowingTimekeepingComponent,
      vnDateTimeFormatPipe
  ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        SharedModule,
        NgbModule,
        HttpClientModule,
        ToastrModule.forRoot({
            preventDuplicates: true,
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
        }),
        NgbModule,
        AdminRoutingModule,
        NgbModalModule,
        FlatpickrModule.forRoot(),
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        }),
        NgSelectModule,
    ],
    exports: [
      PopupAddApproveSpecimensComponent,
      PopupAddSpecimensComponent,
      PopupAddSpecimensComponent,
      PopupEditSpecimensComponent
    ],
    providers: [DatePipe]
})
export class AdminModule { }
