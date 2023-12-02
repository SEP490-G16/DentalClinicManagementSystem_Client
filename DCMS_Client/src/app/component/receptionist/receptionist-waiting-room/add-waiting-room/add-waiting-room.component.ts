import { Component, OnInit, Renderer2, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { PopupAddPatientComponent } from 'src/app/component/utils/pop-up/patient/popup-add-patient/popup-add-patient.component';
import * as moment from 'moment-timezone';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { add } from 'date-fns';
import { ResponseHandler } from 'src/app/component/utils/libs/ResponseHandler';
@Component({
  selector: 'app-add-waiting-room',
  templateUrl: './add-waiting-room.component.html',
  styleUrls: ['./add-waiting-room.component.css']
})
export class AddWaitingRoomComponent implements OnInit {
  patientList: any[] = [];
  patientInfor: any;
  isAdd: boolean = false;
  POST_WAITTINGROOM: IPostWaitingRoom;
  name_suggest: string = '';
  patient1: any = {
    patientName: '',
    Email: '',
    Gender: 1,
    phone_Number: '',
    Address: '',
    full_medical_History: '',
    dental_medical_History: '',
    dob: ''
  }
  patientBody: any = {
    patient_name: '',
    email: '',
    gender: '',
    phone_number: '',
    address: '',
    full_medical_history: '',
    dental_medical_history: '',
    date_of_birth: '',
    description: ''
  }
  validatePatient = {
    name: '',
    gender: '',
    phone: '',
    address: '',
    dob: '',
    email: ''
  }
  constructor(
    private WaitingRoomService: ReceptionistWaitingRoomService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router,
    private medicaoProcedureGroupService: MedicalProcedureGroupService
  ) {

    this.POST_WAITTINGROOM = {
      epoch: "",
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: "1",
      appointment_id: '',
      appointment_epoch: '',
      patient_created_date: '',
    } as IPostWaitingRoom

  }
  validateWatingRoom = {
    patientName: '',
    phone: '',
    procedure: '',
    status: '',
    reason: ''
  }
  listGroupService: any[] = [];
  isSubmitted: boolean = false;
  ngOnInit(): void {

    this.getListGroupService();
    const patientData = localStorage.getItem("patient");
    if (patientData === null) {
      return;
    } else {
      const dataOfLocale = JSON.parse(patientData);
      this.name_suggest = dataOfLocale.patient_name;
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
  checkCancel() {
    console.log("click")
    this.isAdd = false;
  }
  getListGroupService() {
    const storeList = localStorage.getItem('ListGroupProcedure');
    if (storeList != null) {
      this.listGroupService = JSON.parse(storeList);
    }
    if (this.listGroupService.length > 0) {
      this.POST_WAITTINGROOM.produce_id = this.listGroupService[0].medical_procedure_group_id;
      this.POST_WAITTINGROOM.produce_name = this.listGroupService[0].name;
    }
  }
  onPostWaitingRoom() {
    let patientIn = this.patientInfor.split(' - ');
    this.POST_WAITTINGROOM.patient_id = patientIn[0];
    this.POST_WAITTINGROOM.patient_name = patientIn[1];
    this.POST_WAITTINGROOM.status = "1";
    this.POST_WAITTINGROOM.appointment_id = "";
    this.POST_WAITTINGROOM.appointment_epoch = "";
    const storedPatientIdsString = localStorage.getItem('listPatientId');
    let storedPatientIds = [];
    if (storedPatientIdsString) {
      storedPatientIds = JSON.parse(storedPatientIdsString);
    }
    const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    this.POST_WAITTINGROOM.epoch = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
    this.resetValidate();
    if (this.patientInfor == '' || this.patientInfor == null) {
      this.validateWatingRoom.patientName = "Vui lòng chọn bệnh nhân!";
      this.isSubmitted = true;
      return;
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
    const wrPatientId = sessionStorage.getItem("WaitingRoomPatientId");
    this.POST_WAITTINGROOM.patient_created_date = "new" + 1;
    console.log("POST Waiting room: ", this.POST_WAITTINGROOM);
    this.WaitingRoomService.postWaitingRoom(this.POST_WAITTINGROOM)
      .subscribe((data) => {
        this.showSuccessToast("Thêm phòng chờ thành công!!");
        window.location.reload();
      },
        (err) => {
          this.showErrorToast('Lỗi khi thêm phòng chờ');
        }
      );

  }

  addPatient() {
    console.log(this.patient1.gender);
    this.resetValidate();
    if (!this.patient1.patientName) {
      this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
      this.isSubmitted = true;
    }
    if (this.patient1.Email && !this.isValidEmail(this.patient1.Email)) {
      this.validatePatient.email = "Email không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.Gender) {
      this.validatePatient.gender = "Vui lòng chọn giới tính!";
      this.isSubmitted = true;
    }
    if (!this.patient1.phone_Number) {
      this.validatePatient.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.patient1.phone_Number)) {
      this.validatePatient.phone = "Số điện thoại không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.dob) {
      this.validatePatient.dob = "Vui lòng nhập ngày sinh!";
      this.isSubmitted = true;
    }
    if (!this.patient1.Address) {
      this.validatePatient.address = "Vui lòng nhập địa chỉ!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted) {
      return;
    }
    this.patientBody = {
      patient_id: null,
      patient_name: this.patient1.patientName,
      email: this.patient1.Email,
      gender: this.patient1.Gender,
      phone_number: this.patient1.phone_Number,
      address: this.patient1.Address,
      full_medical_history: this.patient1.full_medical_History,
      dental_medical_history: this.patient1.dental_medical_History,
      date_of_birth: this.patient1.dob,
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 9) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: this.patient1.Gender,
        phone_number: '+84' + this.patient1.phone_Number,
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: this.patient1.dob,
      }
    }
    if (this.patient1.phone_Number && this.patient1.phone_Number.length === 10) {
      this.patientBody = {
        patient_id: null,
        patient_name: this.patient1.patientName,
        email: this.patient1.Email,
        gender: this.patient1.Gender,
        phone_number: '+84' + this.patient1.phone_Number.substring(1),
        address: this.patient1.Address,
        full_medical_history: this.patient1.full_medical_History,
        dental_medical_history: this.patient1.dental_medical_History,
        date_of_birth: this.patient1.dob,
      }
    }
    console.log("Patient body: ", this.patientBody);
    this.PATIENT_SERVICE.addPatient(this.patientBody).subscribe((data: any) => {
      this.toastr.success('Thêm mới bệnh nhân thành công!');
      let ref = document.getElementById('cancel-patient');
      ref?.click();
      this.patient1 = [];
      this.patientInfor = data.data.patient_id + " - " + this.patientBody.patient_name + " - " + this.normalizePhoneNumber(this.patientBody.phone_number);
      // sessionStorage.setItem("WaitingRoomPatientId", data.data.patient_id);
    }, error => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.PATIENT_SERVICE.test + "/patient", error);
    })
  }

  searchTimeout: any;
  onsearchPatientInWaitingRoom(event: any) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.PATIENT_SERVICE.getPatientByName(event.target.value, 1).subscribe(data => {
        const transformedMaterialList = data.data.map((item: any) => {
          return {
            patientId: item.patient_id,
            patientName: item.patient_name,
            patientInfor: item.patient_id + " - " + item.patient_name + " - " + item.phone_number,
          };
        });
        this.patientList = transformedMaterialList;
      })
    }, 2000);
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
      epoch: "0",
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: "0"
    } as IPostWaitingRoom
  }
  private resetValidate() {
    this.validateWatingRoom = {
      patientName: '',
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
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }
  toggleAdd() {
    this.isAdd = true;
  }
  toggleCancel() {
    this.isAdd = false;
  }
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
  }
}
