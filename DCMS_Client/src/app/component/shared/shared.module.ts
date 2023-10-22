import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SidebarComponent} from "./sidebar/sidebar.component";
import {HeaderComponent} from "./header/header.component";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import { LayoutsComponent } from './layouts/layouts.component';
import { ProfilePersonalComponent } from './profile-personal/profile-personal.component';



@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    LayoutsComponent,
    ProfilePersonalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ]
})
export class SharedModule { }
