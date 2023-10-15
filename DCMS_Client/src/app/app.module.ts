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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
