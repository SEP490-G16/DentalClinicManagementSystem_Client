import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HeaderComponent } from './shared/layouts/header/header.component';
import { SidebarComponent } from './shared/layouts/sidebar/sidebar.component';
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
    ComponentsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
