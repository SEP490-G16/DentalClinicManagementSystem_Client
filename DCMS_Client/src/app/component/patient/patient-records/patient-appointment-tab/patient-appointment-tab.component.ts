import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { RootObject } from 'src/app/model/IAppointment';
@Component({
  selector: 'app-patient-appointment-tab',
  templateUrl: './patient-appointment-tab.component.html',
  styleUrls: ['./patient-appointment-tab.component.css']
})
export class PatientAppointmentTabComponent implements OnInit {
  id: string = "";

  startDate: any;
  endDate: string = "2023-12-31";
  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  appointmentList: RootObject[] = [];

  patientAppointments: any;

  constructor(
    private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService) {

    // Set date time hiện tại
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.getAppointment();
  }

  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate(['nhanvien' + href + this.id]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate(['nhanvien' + href + this.id]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate(['nhanvien' + href + this.id]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate(['admin' + href + this.id]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }

  getAppointment() {
    this.APPOINTMENT_SERVICE.getAppointmentList(1696925134, this.endDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      console.log("Appointment List: ", this.appointmentList);

      this.patientAppointments = this.appointmentList.filter(appointment =>
        appointment.appointments.some(app =>
          app.details.some(detail =>
            detail.patient_id === this.id
          )
        )
      );
      this.patientAppointments.sort((a:any, b:any) => b.date - a.date);
    });
  }

  EditAppointmentPatient: any
  dateString: string = "";
  timeString: string = "";
  editAppointment(detail: any, dateTimestamp: any) {
    this.EditAppointmentPatient = detail;
    this.dateString = this.convertTimestampToDateString(dateTimestamp);
    console.log("DateString: ", this.dateString);
    this.timeString = this.timestampToGMT7String(detail.time);
    console.log("TimeString: ", this.timeString);
  }

  deleteAppointment(detail:any,  dateTimestamp:any) {

  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    // Kiểm tra xem timestamp có đơn vị giây hay mili giây
    const timestampInMilliseconds = timestamp * (timestamp > 1e12 ? 1 : 1000);

    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestampInMilliseconds, 'Asia/Ho_Chi_Minh').format('HH:mm');

    return dateTimeString;
  }

  convertTimestampToDateString(timestamp: number): string {
    return moment(timestamp).format('YYYY-MM-DD');
  }

  convertTimestampToVNDateString(timestamp: number): string {
    return moment(timestamp).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
  }

  timestampToGMT7StringWithDate(timestamp: number): string {
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
    return dateTimeString;
  }

}
