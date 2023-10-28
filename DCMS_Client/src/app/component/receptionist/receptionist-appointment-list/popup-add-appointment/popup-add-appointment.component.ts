import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { IAddAppointment } from 'src/app/model/IAppointment';

@Component({
  selector: 'app-popup-add-appointment',
  templateUrl: './popup-add-appointment.component.html',
  styleUrls: ['./popup-add-appointment.component.css']
})
export class PopupAddAppointmentComponent implements OnInit {

  AppointmentBody: IAddAppointment;

  procedure: string = "";
  appointmentTime = "";

  isPatientInfoEditable: boolean = false;

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
  ];

  constructor(private appointmentService: ReceptionistAppointmentService) {
    this.AppointmentBody = {
      epoch: 0,    //x
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure: 1,  //x
        doctor: '', //x
        time: 0  //x
      }
    } as IAddAppointment;
  }

  ngOnInit(): void {
  }

  onPhoneInput() {
    this.appointmentService.getPatientByPhone(this.AppointmentBody.appointment.phone_number).subscribe((data) => {
      this.AppointmentBody.appointment.patient_id = data[0].patient_id;
      this.AppointmentBody.appointment.patient_name = data[0].patient_name;
    },
    )
  }

  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.AppointmentBody.appointment.doctor = doctor.name)
    this.AppointmentBody.appointment.doctor = doctor.name;
  }

  isTimeValid: boolean = true;
  onPostAppointment() {
    const time = this.convertTimeToTimestamp(this.appointmentTime);

    if (time === 0) {
      this.isTimeValid = false;
    } else {
      this.isTimeValid = true;
    }

    const myDate = new Date('2023-10-28');
    const epoch = this.convertDateToTimestamp(myDate);

    this.AppointmentBody.epoch = epoch;
    this.AppointmentBody.appointment.time = time;

    // Gọi API POST
    this.appointmentService.postAppointment(this.AppointmentBody).subscribe(
      (response) => {
        console.log('Lịch hẹn đã được tạo:', response);
        alert('Lịch hẹn đã được tạo thành công!');
      },
      (error) => {
        console.error('Lỗi khi tạo lịch hẹn:', error);
        alert('Lỗi khi tạo lịch hẹn!');
      }
    );
  }

  convertDateToTimestamp(date: Date): number {
    const dateWithZeroTime = new Date(date);
    dateWithZeroTime.setHours(0, 0, 0, 0);

    // Lấy timestamp từ đối tượng Date với giờ, phút và giây mặc định là 0
    const timestamp = dateWithZeroTime.getTime() / 1000; // Chia cho 1000 để chuyển đổi sang giây

    return timestamp;
  }

  convertTimeToTimestamp(time: string): number {
    const timestamp = Date.parse(time);
    if (!isNaN(timestamp)) {
      return timestamp;
    }
    return 0;
  }

}
