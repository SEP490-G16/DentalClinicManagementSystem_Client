import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import { NurseComponent } from './nurse.component';
import { SharedModule } from '../shared/shared.module';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
      NurseComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ]
})
export class NurseModule { }
