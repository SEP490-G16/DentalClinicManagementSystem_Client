import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangeAppointmentComponent } from './change-appointment/change-appointment.component';
import { BenhnhanRoutingModule } from './benhnhan-routing.module';
import { CancelAppointmentComponent } from './change-appointment/cancel-appointment/cancel-appointment.component';

@NgModule({
  declarations: [
      ChangeAppointmentComponent,
      CancelAppointmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    BenhnhanRoutingModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    NgbModule,
  ],

  providers: [DatePipe]
})
export class BenhnhanModule { }
