import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { ReceptionistAppointmentListComponent } from './receptionist-appointment-list/receptionist-appointment-list.component';
import { ReceptionistTimekeepingComponent } from './receptionist-timekeeping/receptionist-timekeeping.component';
import { ReceptionistWaitingRoomComponent } from './receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistComponent } from './receptionist.component';
import { SharedModule } from '../shared/shared.module';
import { ReceptionistRoutingModule } from './receptionist-routing.module';
import { PopupAddAppointmentComponent } from 'src/app/component/receptionist/receptionist-appointment-list/popup-add-appointment/popup-add-appointment.component';
import { PopupEditAppointmentComponent } from 'src/app/component/receptionist/receptionist-appointment-list/popup-edit-appointment/popup-edit-appointment.component';
import { PatientModule } from '../patient/patient.module';
import { PopupAddPatientComponent } from '../patient/patient-records/popup-add-patient/popup-add-patient.component';

import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';


import { AddWaitingRoomComponent } from './receptionist-waiting-room/add-waiting-room/add-waiting-room.component';
@NgModule({
  declarations: [
   ReceptionistAppointmentListComponent,
   ReceptionistTimekeepingComponent,
   ReceptionistWaitingRoomComponent,
   ReceptionistComponent,
   PopupAddAppointmentComponent,
   PopupEditAppointmentComponent,
   AddWaitingRoomComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule,
    PatientModule,
    ReceptionistRoutingModule,
    NgbModule,
    HttpClientModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    MatMomentDateModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule
  ]
})
export class ReceptionistModule { }
