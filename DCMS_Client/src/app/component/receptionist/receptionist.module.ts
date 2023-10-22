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



@NgModule({
  declarations: [
   ReceptionistAppointmentListComponent,
   ReceptionistTimekeepingComponent,
   ReceptionistWaitingRoomComponent,
   ReceptionistComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
export class ReceptionistModule { }
