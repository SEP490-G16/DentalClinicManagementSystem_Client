import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import * as AWS from 'aws-sdk';
import { ReceptionistAppointmentListComponent } from './receptionist-appointment-list/receptionist-appointment-list.component';
import { ReceptionistTimekeepingComponent } from './receptionist-timekeeping/receptionist-timekeeping.component';
import { ReceptionistWaitingRoomComponent } from './receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistComponent } from './receptionist.component';
import { SharedModule } from '../shared/shared.module';
import { ReceptionistRoutingModule } from './receptionist-routing.module';
import { PopupAddAppointmentComponent } from '../utils/pop-up/appointment/popup-add-appointment/popup-add-appointment.component';
import { PopupEditAppointmentComponent } from '../utils/pop-up/appointment/popup-edit-appointment/popup-edit-appointment.component';
import { PatientModule } from '../patient/patient.module';

import { PopupAddPatientComponent } from '../utils/pop-up/patient/popup-add-patient/popup-add-patient.component';

import { AddWaitingRoomComponent } from './receptionist-waiting-room/add-waiting-room/add-waiting-room.component';
import { VNDateTimeFormatPipe } from '../shared/pipe/datetimeformat.pipe';
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
    PatientModule,
    SharedModule,
    ReceptionistRoutingModule,
    NgbModule,
    HttpClientModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ]
})
export class ReceptionistModule{

}
