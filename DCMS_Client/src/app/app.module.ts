import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { PipePipe } from './shared/pipe/pipe.pipe';
import { AdminComponent } from './pages/admin/admin.component';
import { ReceptionistComponent } from './pages/receptionist/receptionist.component';
import { DoctorComponent } from './pages/doctor/doctor.component';
import { NurseComponent } from './pages/nurse/nurse.component';
import { PatientComponent } from './pages/patient/patient.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ReceptionistAppointmentListComponent } from './pages/receptionist/receptionist-appointment-list/receptionist-appointment-list.component';
import { LayoutsComponent } from './shared/layouts/layouts/layouts.component';
import {ComponentsModule} from "./shared/layouts/components/components.module";
import {StaffComponent} from "./pages/admin/staff/staff.component";
import { LaboComponent } from './pages/admin/labo/labo.component';
import { ReceptionistWaitingRoomComponent } from './pages/receptionist/receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistTimekeepingComponent } from './pages/receptionist/receptionist-timekeeping/receptionist-timekeeping.component';
import { SpecimensComponent } from './pages/admin/specimens/specimens.component';
import { PatientManagementComponent } from './pages/common/patient-management/patient-management.component';
import { PendingSpecimensComponent } from './pages/admin/pending-specimens/pending-specimens.component';
import { MaterialComponent } from './pages/admin/material/material.component';
import { PendingMaterialComponent } from './pages/admin/pending-material/pending-material.component';
import { PatientRecordsComponent } from './pages/common/patient-records/patient-records.component';

import {
  WarehouseExportMaterialManagementComponent
} from "./pages/admin/warehouse-export-material-management/warehouse-export-material-management.component";
import {
  WarehouseImportMaterialManagementComponent
} from "./pages/admin/warehouse-import-material-management/warehouse-import-material-management.component";
import { ServiceComponent } from './pages/admin/service/service.component';
import { MedicineComponent } from './pages/admin/medicine/medicine.component';
import { FacilityComponent } from './pages/admin/facility/facility.component';
import { StaffDetailComponent } from './pages/admin/staff-detail/staff-detail.component';
import { ProfilePersonalComponent } from './pages/profile-personal/profile-personal.component';
import { PopupAddStaffComponent } from './pages/admin/staff/popup-add-staff/popup-add-staff.component';
import { PopupDeleteStaffComponent } from './pages/admin/staff/popup-delete-staff/popup-delete-staff.component';
import { PopupAddLaboComponent } from './pages/admin/labo/popup-add-labo/popup-add-labo.component';
import {PopupDeleteLaboComponent} from "./pages/admin/labo/popup-delete-labo/popup-delete-labo.component";
import { PopupAddSpecimensComponent } from './pages/admin/specimens/popup-add-specimens/popup-add-specimens.component';
import { PopupDeleteSpecimensComponent } from './pages/admin/specimens/popup-delete-specimens/popup-delete-specimens.component';
import { PopupAddApproveSpecimensComponent } from './pages/admin/pending-specimens/popup-add-approve-specimens/popup-add-approve-specimens.component';
import { PopupAddMaterialComponent } from './pages/admin/material/popup-add-material/popup-add-material.component';
import { PopupDeleteMaterialComponent } from './pages/admin/material/popup-delete-material/popup-delete-material.component';
import { PopupAddGroupServiceComponent } from './pages/admin/service/popup-add-group-service/popup-add-group-service.component';
import { PopupDeleteGroupServiceComponent } from './pages/admin/service/popup-delete-group-service/popup-delete-group-service.component';
import { PopupAddServiceComponent } from './pages/admin/service/popup-add-service/popup-add-service.component';
import { PopupDeleteServiceComponent } from './pages/admin/service/popup-delete-service/popup-delete-service.component';
import { PopupAddMedicineComponent } from './pages/admin/medicine/popup-add-medicine/popup-add-medicine.component';
import { PopupDeleteMedicineComponent } from './pages/admin/medicine/popup-delete-medicine/popup-delete-medicine.component';
import { PopupAddFacilityComponent } from './pages/admin/facility/popup-add-facility/popup-add-facility.component';
import { PopupDeleteFacilityComponent } from './pages/admin/facility/popup-delete-facility/popup-delete-facility.component';
import { PopupAddBillImportMaterialComponent } from './pages/admin/warehouse-import-material-management/popup-add-bill-import-material/popup-add-bill-import-material.component';
import { PopupAddBillExportMaterialComponent } from './pages/admin/warehouse-export-material-management/popup-add-bill-export-material/popup-add-bill-export-material.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopupDetailBillImportMaterialComponent } from './pages/admin/warehouse-import-material-management/popup-detail-bill-import-material/popup-detail-bill-import-material.component';
import { PopupDetailBillExportMaterialComponent } from './pages/admin/warehouse-export-material-management/popup-detail-bill-export-material/popup-detail-bill-export-material.component';
@NgModule({
  declarations: [
    AppComponent,
    PipePipe,
    AdminComponent,
    ReceptionistComponent,
    DoctorComponent,
    NurseComponent,
    PatientComponent,
    AuthComponent,
    ReceptionistAppointmentListComponent,
    LayoutsComponent,
    StaffComponent,
    LaboComponent,
    ReceptionistWaitingRoomComponent,
    ReceptionistTimekeepingComponent,
    SpecimensComponent,
    PatientManagementComponent,
    PendingSpecimensComponent,
    MaterialComponent,
    PendingMaterialComponent,
    WarehouseImportMaterialManagementComponent,
    PatientRecordsComponent,
    WarehouseExportMaterialManagementComponent,
    ServiceComponent,
    MedicineComponent,
    FacilityComponent,
    StaffDetailComponent,
    ProfilePersonalComponent,
    PopupAddStaffComponent,
    PopupDeleteStaffComponent,
    PopupAddLaboComponent,
    PopupDeleteLaboComponent,
    PopupAddSpecimensComponent,
    PopupDeleteSpecimensComponent,
    PopupAddApproveSpecimensComponent,
    PopupAddMaterialComponent,
    PopupDeleteMaterialComponent,
    PopupAddGroupServiceComponent,
    PopupDeleteGroupServiceComponent,
    PopupAddServiceComponent,
    PopupDeleteServiceComponent,
    PopupAddMedicineComponent,
    PopupDeleteMedicineComponent,
    PopupAddFacilityComponent,
    PopupDeleteFacilityComponent,
    PopupAddBillImportMaterialComponent,
    PopupAddBillExportMaterialComponent,
    PopupDetailBillImportMaterialComponent,
    PopupDetailBillExportMaterialComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    ComponentsModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
