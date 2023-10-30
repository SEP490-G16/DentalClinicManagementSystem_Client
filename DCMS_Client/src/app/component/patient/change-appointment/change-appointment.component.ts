import { RootObject } from './../../../model/IAppointment';
import { ConvertJson } from './../../../service/Lib/ConvertJson';
import { IPatient } from './../../../model/IPatient';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

@Component({
  selector: 'app-change-appointment',
  templateUrl: './change-appointment.component.html',
  styleUrls: ['./change-appointment.component.css']
})

export class ChangeAppointmentComponent implements OnInit {
  model!: NgbDateStruct;
  date!: { year: number; month: number; };


  epoch_PathParam: string = '';  // Lưu giá trị của epoch
  appointmentId_Pathparam: string = '';  // Lưu giá trị của appointmentId


  appointment: RootObject;
  constructor(private calendar: NgbCalendar,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private appointmentService: ReceptionistAppointmentService
  ) {
    this.appointment = {} as RootObject;
  }
  appointments: any[] = [];
  selectToday() {
    this.model = this.calendar.getToday();
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.epoch_PathParam = params['epoch'];
      this.appointmentId_Pathparam = params['appointmentId'];
    });

    this.appointmentService.getAppointmentList(1697994000, 1697994000)
      .subscribe((data) => {
        const filteredAppointments = ConvertJson.processApiResponse(data);

        const rawData = filteredAppointments as RootObject[];
        if (rawData && rawData.length > 0) {
          const appointments = rawData[0].appointments;

          const appointment = appointments[0].details.find(detail => detail.appointment_id === this.appointmentId_Pathparam);

          if (appointment) {
            console.log("Oki: ", appointment);
          } else {
            console.log('Appointment not found');
          }
        }
      })
  }
}

function processApiResponse(data: any): any {
  throw new Error('Function not implemented.');
}

