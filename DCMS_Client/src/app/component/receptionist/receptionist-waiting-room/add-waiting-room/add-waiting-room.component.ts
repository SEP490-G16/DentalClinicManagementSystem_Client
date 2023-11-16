import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { PatientService } from 'src/app/service/PatientService/patient.service';

import * as moment from 'moment-timezone';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
@Component({
  selector: 'app-add-waiting-room',
  templateUrl: './add-waiting-room.component.html',
  styleUrls: ['./add-waiting-room.component.css']
})
export class AddWaitingRoomComponent implements OnInit {

  POST_WAITTINGROOM: IPostWaitingRoom;
  phone_suggest: string = '';
  name_suggest: string = '';
  phone_number: string = '';
  constructor(
    private WaitingRoomService: ReceptionistWaitingRoomService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router,
    private medicaoProcedureGroupService: MedicalProcedureGroupService
  ) {

    this.POST_WAITTINGROOM = {
      epoch: 0,
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 1
    } as IPostWaitingRoom

  }
  validateWatingRoom = {
    phone: '',
    procedure: '',
    status: '',
    reason: ''
  }
  listGroupService: any[] = [];
  isSubmitted: boolean = false;
  ngOnInit(): void {
    const patientData = localStorage.getItem("patient");
    if (patientData === null) {
      console.log("Dữ liệu không tồn tại trong Local Storage.");
    } else {
      const dataOfLocale = JSON.parse(patientData);
      this.phone_suggest = dataOfLocale.phone_number;
      this.name_suggest = dataOfLocale.patient_name;
    }
    this.getListGroupService();
  }


  onPhoneInput() {
    if (this.phone_number.length !== 10) {
      return;
    }

    this.resetValidate();
    if (!this.phone_number) {
      this.validateWatingRoom.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.phone_number)) {
      this.validateWatingRoom.phone = "Số điện thoại không hợp lệ";
    }
    else {
      this.PATIENT_SERVICE.getPatientPhoneNumber(this.phone_number).subscribe((data) => {
        this.POST_WAITTINGROOM.patient_id = data[0].patient_id;
        this.POST_WAITTINGROOM.patient_name = data[0].patient_name;
      },
        (err) => {
          this.showErrorToast("Không tìm thấy số điện thoại");
        }
      );
    }
  }
  onProcedureChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    // Logic to get the name from the selected ID
    const selectedProcedure = this.listGroupService.find(
      (procedure) => procedure.medical_procedure_group_id === selectedValue
    );

    if (selectedProcedure) {
      this.POST_WAITTINGROOM.produce_id = selectedProcedure.medical_procedure_group_id;
      this.POST_WAITTINGROOM.produce_name = selectedProcedure.name;
    }
  }

  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.listGroupService = res.data;

      if (this.listGroupService.length > 0) {
        this.POST_WAITTINGROOM.produce_id = this.listGroupService[0].medical_procedure_group_id;
        this.POST_WAITTINGROOM.produce_name = this.listGroupService[0].name; // Thêm dòng này
      }
    });
  }
  onPostWaitingRoom() {
    const storedPatientIdsString = localStorage.getItem('listPatientId');
    let storedPatientIds = [];

    if (storedPatientIdsString) {
      storedPatientIds = JSON.parse(storedPatientIdsString);
    }
    const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    this.POST_WAITTINGROOM.epoch = Math.floor(currentDateTimeGMT7.valueOf() / 1000);
    this.resetValidate();
    if (!this.phone_number) {
      this.validateWatingRoom.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.phone_number)) {
      this.validateWatingRoom.phone = "Số điện thoại không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.POST_WAITTINGROOM.produce_id) {
      this.validateWatingRoom.procedure = "Vui lòng chọn loại điều trị!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    if (storedPatientIds.includes(this.POST_WAITTINGROOM.patient_id)) {
      this.showErrorToast('Bệnh nhân đã tồn tại trong phòng chờ!');
      return;
    }
    console.log("Hehe: ", this.POST_WAITTINGROOM);
    this.WaitingRoomService.postWaitingRoom(this.POST_WAITTINGROOM)
      .subscribe((data) => {
        this.showSuccessToast("Thêm phòng chờ thành công!!");

        this.phone_number = '';
        this.POST_WAITTINGROOM = {
          epoch: 0,
          produce_id: '',
          produce_name: '',
          patient_id: '',
          patient_name: '',
          reason: '',
          status: 1
        } as IPostWaitingRoom
        window.location.reload();
      },
        (err) => {
          this.showErrorToast('Lỗi khi thêm phòng chờ');
        }
      );

  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  close() {
    this.POST_WAITTINGROOM = {
      epoch: 0,
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 0
    } as IPostWaitingRoom
  }
  private resetValidate() {
    this.validateWatingRoom = {
      phone: '',
      procedure: '',
      status: '',
      reason: ''
    }
    this.isSubmitted = false;
  }
  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
}