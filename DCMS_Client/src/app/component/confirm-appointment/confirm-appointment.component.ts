import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEditAppointmentBody, IEditAppointmentBodyNew, RootObject } from 'src/app/model/IAppointment';
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
  Confirm_Appointment_Body: IEditAppointmentBodyNew = {} as IEditAppointmentBodyNew
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
      this.data = await this.appointmentService.getAppointmentByPatientNew(this.appointmentId_Pathparam);
    }

    const result = JSON.parse(this.data);
    this.appointment = result;
    this.Confirm_Appointment_Body = {
      epoch: Number(this.epoch_PathParam),    //x
      new_epoch: Number(this.epoch_PathParam),
      appointment: {
        patient_id: this.appointment.Item.patient_attr.M.id.S,  
        patient_name: this.appointment.Item.patient_attr.M.name.S, 
        phone_number: this.appointment.Item.patient_attr.M.phone_number.S,
        procedure_id: this.appointment.Item.procedure_attr.M.id.S,  
        doctor_attr: this.appointment.Item.doctor_attr.S,
        procedure_name: this.appointment.Item.procedure_attr.M.name.S,
        reason: this.appointment.Item.reason_attr.S,
        time_attr: parseInt(this.appointment.Item.time_attr.N),
        status_attr: 2,
        is_new: this.appointment.Item.patient_attr.M.is_new.BOOL,
      }
    }
    console.log("Confirm_Appointment_Body: ", this.Confirm_Appointment_Body)
    const status = 0;
    this.appointmentService.putAppointmentNew(this.Confirm_Appointment_Body, this.appointmentId_Pathparam)
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
}
