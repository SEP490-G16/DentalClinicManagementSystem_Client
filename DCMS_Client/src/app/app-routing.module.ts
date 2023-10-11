import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutsComponent} from "./shared/layouts/layouts/layouts.component";
import { ReceptionistComponent } from './pages/receptionist/receptionist.component';

const routes: Routes = [
  {path: "", component: LayoutsComponent},
  {path: "r", component: ReceptionistComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
