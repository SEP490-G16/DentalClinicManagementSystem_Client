import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEditAppointmentBody, RootObject } from 'src/app/model/IAppointment';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

@Component({
  selector: 'app-confirm-appointment',
  templateUrl: './confirm-appointment.component.html',
  styleUrls: ['./confirm-appointment.component.css']
})
export class ConfirmAppointmentComponent implements OnInit {
  epoch_PathParam: number = 0;  // Lưu giá trị của epoch
  appointmentId_Pathparam: string = '';  // Lưu giá trị của appointmentId
  Confirm_Appointment_Body: IEditAppointmentBody = {} as IEditAppointmentBody
  appointment: any;
  isMigrated: boolean = true;
  isCheck: boolean = false;
  data: any = '';
  STATUS: boolean = true;
  constructor(private route: ActivatedRoute,
    private appointmentService: ReceptionistAppointmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchAPI();
  }
  async fetchAPI() {
    if (this.appointmentId_Pathparam === '' && this.epoch_PathParam === 0) {
      this.route.params.subscribe(params => {
        this.epoch_PathParam = params['epoch'];
        var check = this.epoch_PathParam.toString();
        if (check.includes('%40')) {
          this.isCheck = true;
          var a = check.split('%40');
          this.epoch_PathParam = parseInt(a[0]);
        }
        this.appointmentId_Pathparam = params['appointmentId'];
      });
    }

    if (this.isCheck == false) {
      this.data = await this.appointmentService.getAppointmentByPatient(this.epoch_PathParam, this.epoch_PathParam);
    }
    

    // Kiểm tra xem data có giá trị không
    const AppointmentParent = ConvertJson.processApiResponse(this.data);
    console.log("appointmentParent: ", AppointmentParent);
    const appointmentChild = this.findAppointmentById(this.data);
    console.log("appointmentChild: ", appointmentChild);


    this.Confirm_Appointment_Body = {
      epoch: Number(this.epoch_PathParam),    //x
      new_epoch: Number(this.epoch_PathParam),
      appointment: {
        patient_id: appointmentChild.patient_id,  //x
        patient_name: appointmentChild.patient_name, //x
        phone_number: appointmentChild.phone_number, //x
        procedure_id: appointmentChild.procedure_id,  //x
        procedure_name: appointmentChild.procedure_name,
        reason: appointmentChild.reason,
        doctor: appointmentChild.doctor, //x
        time: appointmentChild.time,
        status: 4,
        patient_created_date: appointmentChild.patient_created_date
      }
    }
    console.log("Confirm_Appointment_Body: ", this.Confirm_Appointment_Body)
    const status = 0;
    this.appointmentService.putAppointment(this.Confirm_Appointment_Body, this.appointmentId_Pathparam)
      .subscribe(
        (res) => {
          this.STATUS = true;
        },
        (err) => {
          this.STATUS = false;
        }
      );

    this.isMigrated = false;
    console.log(this.isMigrated);


  }

  findAppointmentById(appointments: any) {
    console.log("Appointment find by Id: ", appointments);
    const filteredAppointments = ConvertJson.processApiResponse(appointments);
    console.log(filteredAppointments);
    const rawData = filteredAppointments as RootObject[];
    let result: any;
    if (rawData && rawData.length > 0) {
      for (const appointmentBlock of rawData) {
        for (const detail of appointmentBlock.appointments.flatMap(a => a.details)) {
          if (detail.appointment_id === this.appointmentId_Pathparam) {
            result = detail;
            break;
          }
        }
        if (result) break;
      }
    }
    return result;
  }
}
