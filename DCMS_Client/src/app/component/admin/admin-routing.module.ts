import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from "@angular/router";
import { FacilityComponent } from "./facility/facility.component";
import { LaboComponent } from "./labo/labo.component";
import { MaterialComponent } from "./material/material.component";
import { ServiceComponent } from "./service/service.component";
import { SpecimensComponent } from "./specimens/specimens.component";
import { StaffComponent } from "./staff/staff.component";
import { StaffDetailComponent } from "./staff-detail/staff-detail.component";
import { PendingSpecimensComponent } from "./pending-specimens/pending-specimens.component";
import {
  WarehouseImportMaterialManagementComponent
} from "./warehouse-import-material-management/warehouse-import-material-management.component";
import {
  WarehouseExportMaterialManagementComponent
} from "./warehouse-export-material-management/warehouse-export-material-management.component";
import { FollowingTimekeepingComponent } from "./following-timekeeping/following-timekeeping.component";
import { RevenueChartComponent } from "./revenue-chart/revenue-chart.component";
import {
  ReportHighIncomeAndExpenditureComponent
} from "./report-high-income-and-expenditure/report-high-income-and-expenditure.component";
import { ReportExpenditureComponent } from "./report-expenditure/report-expenditure.component";
import { ReceptionistAppointmentListComponent } from '../receptionist/receptionist-appointment-list/receptionist-appointment-list.component';
import { ReceptionistWaitingRoomComponent } from '../receptionist/receptionist-waiting-room/receptionist-waiting-room.component';
import { ReceptionistTimekeepingComponent } from '../receptionist/receptionist-timekeeping/receptionist-timekeeping.component';
import { RegisterWorkScheduleComponent } from '../shared/register-work-schedule/register-work-schedule.component';
import { MaterialManagementComponent } from './material-management/material-management.component';
import { SecurityRevenueComponent } from "./security-revenue/security-revenue.component";
import { SubmitOtpComponent } from "./submit-otp/submit-otp.component";
import { PatientExaminationManagementComponent } from '../patient/patient-examination-management/patient-examination-management.component';

const adminRoutes: Routes = [
  { path: '', redirectTo: 'phong-cho', pathMatch: 'full' },
  { path: 'co-so', component: FacilityComponent },
  { path: 'labo', component: LaboComponent },
  { path: 'doanh-thu', component: RevenueChartComponent },
  { path: 'bao-cao-thu', component: ReportHighIncomeAndExpenditureComponent },
  { path: 'bao-cao-chi', component: ReportExpenditureComponent },
  { path: 'lich-hen', component: ReceptionistAppointmentListComponent },
  { path: 'phong-cho', component: ReceptionistWaitingRoomComponent },
  { path: 'benh-nhan-dang-kham', component: PatientExaminationManagementComponent },
  { path: 'bao-mat', component: SecurityRevenueComponent },
  { path: 'gui-otp', component: SubmitOtpComponent },
  {
    path: '', children: [
      { path: 'kho', component: MaterialComponent },
      { path: 'vat-lieu', component: MaterialManagementComponent },
      { path: 'quan-ly-nhap', component: WarehouseImportMaterialManagementComponent },
      { path: 'quan-ly-xuat', component: WarehouseExportMaterialManagementComponent }
    ]
  },
  { path: 'thu-thuat', component: ServiceComponent },
  {
    path: '', children: [
      { path: 'mau', component: SpecimensComponent },
      { path: 'mau-dang-cho', component: PendingSpecimensComponent }
    ]
  },
  {
    path: 'nhan-vien', children: [
      { path: '', component: StaffComponent },
      { path: 'chi-tiet-nhan-vien', component: StaffDetailComponent }
    ]
  },
  { path: 'dang-ky-lich-lam-viec', component: RegisterWorkScheduleComponent },
  { path: 'cham-cong', component: ReceptionistTimekeepingComponent },
  { path: 'theo-doi-cham-cong', component: FollowingTimekeepingComponent },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes)
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
