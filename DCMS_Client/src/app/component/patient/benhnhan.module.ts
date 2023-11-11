import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';


import { ChangeAppointmentComponent } from './change-appointment/change-appointment.component';

import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
      ChangeAppointmentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
  ],

  providers: [DatePipe]
})
export class BenhnhanModule { }
