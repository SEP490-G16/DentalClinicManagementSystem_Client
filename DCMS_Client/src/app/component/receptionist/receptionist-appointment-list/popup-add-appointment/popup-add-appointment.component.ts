import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import { IAddAppointment } from 'src/app/model/IAppointment';
import { PatientService } from 'src/app/service/PatientService/patient.service';

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

  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService, private PATIENT_SERVICE:PatientService) {
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
    this.PATIENT_SERVICE.getPatientByPhone(this.AppointmentBody.appointment.phone_number).subscribe((data) => {
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

  appointmentDate:string = '';
  onPostAppointment() {
    // Chuyển đổi ngày cố định sang timestamp
    const fixedDate = new Date(this.appointmentDate);
    const dateTimestamp = fixedDate.getTime() / 1000; // Chuyển đổi sang timestamp (giây)

    // Lấy giá trị thời gian từ biến appointmentTime và chuyển đổi thành timestamp
    const timeParts = this.appointmentTime.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Khởi tạo một đối tượng Date với ngày cố định
    const combinedDateTime = new Date(fixedDate);

    // Đặt giờ và phút cho combinedDateTime
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Chuyển đổi thành timestamp
    const combinedTimestamp = combinedDateTime.getTime() / 1000; // Chuyển đổi sang timestamp (giây)

    this.AppointmentBody.epoch = dateTimestamp; // Chứa giá trị ngày (date)
    this.AppointmentBody.appointment.time = combinedTimestamp; // Chứa giá trị giờ trong ngày

    console.log(this.AppointmentBody);
    // Gọi API POST
    this.APPOINTMENT_SERVICE.postAppointment(this.AppointmentBody).subscribe(
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


}
