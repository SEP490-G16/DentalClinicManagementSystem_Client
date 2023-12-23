import { Component, OnInit, Renderer2 } from '@angular/core';
import { IPostWaitingRoom, IPostWaitingRoomNew } from "../../../../model/IWaitingRoom";
import { ReceptionistWaitingRoomService } from "../../../../service/ReceptionistService/receptionist-waitingroom.service";
import { PatientService } from "../../../../service/PatientService/patient.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { WebsocketService } from "../../../../service/Chat/websocket.service";
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import { DataService } from "../../../shared/services/DataService.service";
import { SendMessageSocket } from "../../../shared/services/SendMessageSocket.service";
import * as moment from "moment-timezone";
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import { Normalize } from "../../../../service/Lib/Normalize";
import { NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormatNgbDate } from 'src/app/component/utils/libs/formatNgbDate';
import { TimestampFormat } from 'src/app/component/utils/libs/timestampFormat';

@Component({
  selector: 'app-popup-add-waitingroom-new-patient',
  templateUrl: './popup-add-waitingroom-new-patient.component.html',
  styleUrls: ['./popup-add-waitingroom-new-patient.component.css']
})
export class PopupAddWaitingroomNewPatientComponent implements OnInit {
  dobNgb!: NgbDateStruct
  patientList: any[] = [];
  patientInfor: any;
  isAdd: boolean = false;
  POST_WAITTINGROOM: IPostWaitingRoomNew;
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
    email: '',
    zalo: ''
  }
  currentPatientCreated: boolean = false;
  isAddOld: boolean = false;
  constructor(
    private WaitingRoomService: ReceptionistWaitingRoomService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router, private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private dataService: DataService,
    private sendMessageSocket: SendMessageSocket,
    private config: NgbDatepickerConfig,
  ) {

    const currentYear = new Date().getFullYear();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: currentYear, month: 12, day: 31 };

    this.POST_WAITTINGROOM = {
      epoch: '',
      time_attr: '',
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      is_new: true,
      reason: '',
      status_attr: '',
      foreign_sk: '',
    } as IPostWaitingRoomNew

  }
  validateWatingRoom = {
    patientName: '',
    phone: '',
    procedure: '',
    status: '',
    reason: ''
  }

  analyses = {
    total_appointment: 0,
    total_waiting_room: 0,
    total_patient: 0
  }

  listGroupService: any[] = [];
  isSubmitted: boolean = false;
  filteredWaitingRoomData: any[] = [];
  ngOnInit(): void {

    this.getListGroupService();
    const patientData = localStorage.getItem("patient");
    if (patientData === null) {
      return;
    } else {
      const dataOfLocale = JSON.parse(patientData);
      this.name_suggest = dataOfLocale.patient_name;
    }

    this.dataService.dataAn$.subscribe((data) => {
      this.analyses = data;
    })

    this.WaitingRoomService.data$.subscribe((dataList) => {
      this.filteredWaitingRoomData = dataList;
    })
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
    this.isAdd = false;
    this.resetValidate()
  }
  getListGroupService() {
    const storeList = localStorage.getItem('ListGroupProcedure');
    if (storeList != null) {
      this.listGroupService = JSON.parse(storeList);
    }
    // if (this.listGroupService.length > 0) {
    //   this.POST_WAITTINGROOM.produce_id = this.listGroupService[0].medical_procedure_group_id;
    //   this.POST_WAITTINGROOM.produce_name = this.listGroupService[0].name;
    // }
  }

  addPatient() {
    this.resetValidate();
    this.resetValidate1();
    //console.log("check date: ", TimestampFormat.dateToTimestamp(FormatNgbDate.formatNgbDateToString(this.dobNgb)));
    //return;
    if (!this.patient1.patientName) {
      this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
      this.isSubmitted = true;
    }
    var regex = /[0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\\-/]/;
    if (regex.test(this.patient1.patientName) == true) {
      this.validatePatient.name = "Tên không hợp lệ!";
      this.isSubmitted = true;
    }
    if (!this.patient1.phone_Number) {
      this.validatePatient.zalo = "Vui lòng nhập số zalo!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.patient1.phone_Number)) {
      this.validatePatient.zalo = "Số zalo không hợp lệ!";
      this.isSubmitted = true;
    }
    // if (!this.isVietnamesePhoneNumber(this.patient1.phone_Number) && this.patient1.phone_Number) {
    //   this.validatePatient.phone = "Số điện thoại không hợp lệ!";
    //   this.isSubmitted = true;
    // }
    if (!this.dobNgb || !this.dobNgb.year || !this.dobNgb.month || !this.dobNgb.day) {
      this.validatePatient.dob = "Vui lòng nhập ngày sinh!";
      this.isSubmitted = true;
    }
    else if (!this.isDob(FormatNgbDate.formatNgbDateToVNString(this.dobNgb))) {
      this.validatePatient.dob = "Vui lòng nhập ngày sinh đúng định dạng dd/MM/yyyy !";
      this.isSubmitted = true;
    }
    if (!this.patient1.Address) {
      this.validatePatient.address = "Vui lòng nhập địa chỉ!";
      this.isSubmitted = true;
    }

    const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    this.POST_WAITTINGROOM.epoch = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
    if (!this.POST_WAITTINGROOM.produce_id) {
      // this.validateWatingRoom.procedure = "Vui lòng chọn loại điều trị!";
      // this.isSubmitted = true;
      this.POST_WAITTINGROOM.produce_id = '';
      this.POST_WAITTINGROOM.produce_name = ''
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
      date_of_birth: TimestampFormat.dateToTimestamp(FormatNgbDate.formatNgbDateToString(this.dobNgb)),
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
        date_of_birth: TimestampFormat.dateToTimestamp(FormatNgbDate.formatNgbDateToString(this.dobNgb)),
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
        date_of_birth: TimestampFormat.dateToTimestamp(FormatNgbDate.formatNgbDateToString(this.dobNgb)),
      }
    }

    this.PATIENT_SERVICE.addPatient(this.patientBody).subscribe((data: any) => {
      this.toastr.success('Thêm mới bệnh nhân thành công!');
      this.currentPatientCreated = true;
      this.patient1 = [];
      this.POST_WAITTINGROOM.patient_id = data.data.patient_id;
      this.POST_WAITTINGROOM.patient_name = this.patientBody.patient_name;
      this.POST_WAITTINGROOM.status_attr = "1";
      //this.POST_WAITTINGROOM.appointment_id = "";
      //this.POST_WAITTINGROOM.appointment_epoch = "";
      if (this.currentPatientCreated == true) {
        this.POST_WAITTINGROOM.is_new = true;
        this.currentPatientCreated = false;
      }
      const currentDateTimeGMT7 = moment().tz('Asia/Ho_Chi_Minh');
      this.POST_WAITTINGROOM.time_attr = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
      this.POST_WAITTINGROOM.epoch = Math.floor(currentDateTimeGMT7.valueOf() / 1000).toString();
      this.POST_WAITTINGROOM.foreign_sk = this.POST_WAITTINGROOM.epoch + "::" + this.POST_WAITTINGROOM.patient_id;
      const postInfo = this.POST_WAITTINGROOM.epoch + ' - ' + this.POST_WAITTINGROOM.produce_id + ' - ' + this.POST_WAITTINGROOM.produce_name + ' - '
        + this.POST_WAITTINGROOM.patient_id + ' - ' + this.POST_WAITTINGROOM.patient_name + ' - ' + this.POST_WAITTINGROOM.reason + ' - '
        + this.POST_WAITTINGROOM.status_attr + ' - ' + '' + ' - ' + '' + ' - ' + (this.POST_WAITTINGROOM.is_new == true ? '1' : '2');
      this.WaitingRoomService.postWaitingRoomNew(this.POST_WAITTINGROOM)
        .subscribe((data) => {
          this.showSuccessToast("Thêm phòng chờ thành công!!");
          let ref = document.getElementById('cancel-add-waiting-new');
          ref?.click();
          localStorage.setItem("ob", `CheckRealTimeWaitingRoom@@@,${postInfo},${Number('1')}`);
          this.messageContent = `CheckRealTimeWaitingRoom@@@,${postInfo},${Number('1')}`;
          this.messageBody = {
            action: '',
            message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
          }
          if (this.messageContent.trim() !== '' && sessionStorage.getItem('sub-id') != null && sessionStorage.getItem('username') != null) {
            this.messageBody = {
              action: "sendMessage",
              message: `{"sub-id": "${sessionStorage.getItem('sub-id')}", "sender": "${sessionStorage.getItem('username')}", "avt": "", "content": "${this.messageContent}"}`
            };
            this.webSocketService.sendMessage(JSON.stringify(this.messageBody));

          }

          this.POST_WAITTINGROOM = {
            epoch: '',
            time_attr: '',
            produce_id: '',
            produce_name: '',
            patient_id: '',
            patient_name: '',
            is_new: true,
            reason: '',
            status_attr:'',
            foreign_sk: '',
          } as IPostWaitingRoomNew
          this.patientInfor = '';
        },
          (err) => {
            this.showErrorToast('Lỗi khi thêm phòng chờ');
          }
        );
    }, error => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.PATIENT_SERVICE.test + "/patient", error);
    })
  }

  updateWaitingRoomList() {
    this.WaitingRoomService.getWaitingRooms().subscribe(
      data => {
        console.log('Got new waiting room data:', data);
        let waitingRoomData = data;
        waitingRoomData.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        waitingRoomData.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
        this.WaitingRoomService.updateData(waitingRoomData);

        //Cache
        // var listPatientId = waitingRoomData.map((item: any) => item.patient_id);
        // localStorage.setItem('listPatientId', JSON.stringify(listPatientId));
        // localStorage.setItem("ListPatientWaiting", JSON.stringify(waitingRoomData));

        //Realtime thống kê navbar
        var patientExamination = [...waitingRoomData];
        patientExamination = patientExamination.filter((item) => item.status == '2');

        console.log("Check patient examination: ", patientExamination);
        this.dataService.UpdateWaitingRoomTotal(3, patientExamination.length);
      },
      error => {
        console.error('Failed to get waiting room data:', error);
      }
    );
  }

  searchTimeout: any;
  onsearchPatientInWaitingRoom(event: any) {
    clearTimeout(this.searchTimeout);

    const searchTermWithDiacritics = Normalize.normalizeDiacritics(event.target.value);

    this.searchTimeout = setTimeout(() => {
      this.PATIENT_SERVICE.getPatientByName(searchTermWithDiacritics, 1).subscribe(data => {
        const transformedMaterialList = data.data.map((item: any) => {
          return {
            patientId: item.patient_id,
            patientName: item.patient_name,
            patientInfor: item.patient_id + " - " + item.patient_name + " - " + item.phone_number,
            patientDescription: item.description
          };
        });
        this.patientList = transformedMaterialList;
        localStorage.setItem("listSearchPatient", JSON.stringify(this.patientList));
      });
    }, 500);
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
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
      epoch: '',
      time_attr: '',
      produce_id: '',
      produce_name: '',
      patient_id: '',
      patient_name: '',
      is_new: true,
      reason: '',
      status_attr:'',
      foreign_sk: '',
    } as IPostWaitingRoomNew
    this.isAddOld = false;
    this.isAdd = false;
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
  private resetValidate1() {
    this.validatePatient = {
      name: '',
      gender: '',
      phone: '',
      address: '',
      dob: '',
      email: '',
      zalo: ''
    }
    this.isSubmitted = false;
  }
  private isVietnamesePhoneNumber(number: string): boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(email);
  }
  private isDob(dob: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dob);
  }
  convertDateToISOFormat(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`; // Chuyển đổi sang định dạng yyyy-MM-dd
    } else {
      return null; // hoặc bạn có thể handle lỗi tùy theo logic của ứng dụng
    }
  }
  toggleAdd() {
    this.isAdd = true;
    this.isAddOld = true;
  }
  toggleAddOld() {
    this.isAddOld = true;
    this.isAdd = false;
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

  messageContent: string = ``;
  messageBody = {
    action: '',
    message: `{"sub-id":"", "sender":"", "avt": "", "content":""}`
  }

}
