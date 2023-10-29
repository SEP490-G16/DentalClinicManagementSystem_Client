import { IEditAppointmentBody, ISelectedAppointment } from './../../../../model/IAppointment';
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

@Component({
  selector: 'app-popup-edit-appointment',
  templateUrl: './popup-edit-appointment.component.html',
  styleUrls: ['./popup-edit-appointment.component.css']
})

export class PopupEditAppointmentComponent implements OnInit, OnChanges {
  @Input() selectedAppointment: any;
  @Input() dateString: any;
  @Input() timeString: any;

  EDIT_APPOINTMENT_BODY: IEditAppointmentBody

  isPatientInfoEditable: boolean = false;

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
  ];

  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService, private PATIENT_SERVICE: PatientService) {
    this.EDIT_APPOINTMENT_BODY = {
      epoch: 0,    //x
      new_epoch: 0,
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure: 1,  //x
        doctor: '', //x
        time: 0  //x
      }
    } as IEditAppointmentBody;

  }

  ngOnInit(): void {
  }

  oldDate: string = ''
  oldTime: string = ''
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedAppointment']) {
      this.EDIT_APPOINTMENT_BODY = {
        epoch: 0,
        new_epoch: 0,
        appointment: {
          patient_id: this.selectedAppointment.patient_id,
          patient_name: this.selectedAppointment.patient_name,
          procedure: this.selectedAppointment.procedure,
          phone_number: this.selectedAppointment.phone_number,
          doctor: this.selectedAppointment.doctor,
          time: this.selectedAppointment.time
        }
      } as IEditAppointmentBody;

      this.selectedDoctor = this.selectedAppointment.doctor;
    }
    if (changes['dateString']) {
      this.oldDate = this.dateString;
      this.dateString = this.oldDate;
    }
    if (changes['timeString']) {
      this.oldTime = this.timeString;
      this.timeString = this.oldTime;
    }
  }

  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name)
    this.EDIT_APPOINTMENT_BODY.appointment.doctor = doctor.name;
  }

  onPutAppointment() {
    this.EDIT_APPOINTMENT_BODY.epoch = this.convertStringToTimestamp(this.oldDate, this.oldTime).dateTimestamp;
    //console.log(this.oldDate, this.oldTime);
    this.EDIT_APPOINTMENT_BODY.new_epoch = this.convertStringToTimestamp(this.dateString, this.timeString).dateTimestamp;
    //console.log(this.dateString, this.timeString);
    this.EDIT_APPOINTMENT_BODY.appointment.time = this.convertStringToTimestamp(this.dateString, this.timeString).combinedDateTime;

    console.log(this.EDIT_APPOINTMENT_BODY);
    // console.log("AppointmentId",this.selectedAppointment.appointment_id);
    this.APPOINTMENT_SERVICE.putAppointment(this.EDIT_APPOINTMENT_BODY, this.selectedAppointment.appointment_id).subscribe(response => {
      alert("Cập nhật thành công");
    }, error => {
      alert("Lỗi khi cập nhật");
    });
  }


  convertStringToTimestamp(date: string, time: string) {
    // Chuyển đổi ngày cố định sang timestamp
    const fixedDate = new Date(date);
    const dateTimestamp = fixedDate.getTime() / 1000; // Chuyển đổi sang timestamp (giây)

    // Lấy giá trị thời gian từ biến time và chuyển đổi thành timestamp
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Khởi tạo một đối tượng Date với ngày cố định
    const combinedDateTime = new Date(fixedDate);

    // Đặt giờ và phút cho combinedDateTime
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Chuyển đổi thành timestamp
    const combinedTimestamp = combinedDateTime.getTime() / 1000;

    return {
      dateTimestamp: dateTimestamp,
      combinedDateTime: combinedTimestamp
    };
  }
}