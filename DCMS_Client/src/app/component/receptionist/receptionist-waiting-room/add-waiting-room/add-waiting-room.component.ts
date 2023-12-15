import { Component, OnInit, Renderer2, EventEmitter, Output, Input } from '@angular/core';
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
import { WebsocketService } from 'src/app/service/Chat/websocket.service';
import { DataService } from 'src/app/component/shared/services/DataService.service';
import { SendMessageSocket } from 'src/app/component/shared/services/SendMessageSocket.service';

import { Normalize } from 'src/app/service/Lib/Normalize';
import { NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormatNgbDate } from 'src/app/component/utils/libs/formatNgbDate';

@Component({
  selector: 'app-add-waiting-room',
  templateUrl: './add-waiting-room.component.html',
  styleUrls: ['./add-waiting-room.component.css']
})
export class AddWaitingRoomComponent implements OnInit {

  //@Input() filteredWaitingRoomData:any;
  @Output() newWaitingRoom = new EventEmitter<any>();
  @Output() newAppointmentAdded = new EventEmitter<any>();
  dobNgb!: NgbDateStruct
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
  currentPatientCreated: boolean = false;
  isAddOld: boolean = false;
  constructor(
    private WaitingRoomService: ReceptionistWaitingRoomService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router, private webSocketService: WebsocketService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService,
    private config: NgbDatepickerConfig,
    private dataService: DataService,
    private sendMessageSocket: SendMessageSocket
  ) {

    const currentYear = new Date().getFullYear();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: currentYear, month: 12, day: 31 };

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

  analyses = {
    total_appointment: 0,
    total_waiting_room: 0,
    total_patient: 0
  }

  listGroupService: any[] = [];
  isSubmitted: boolean = false;
  ngOnInit(): void {
    this.getListGroupService();
    this.getWaitingRoomData();
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
  }

  waitingRoomData:any[] = [];
  CheckRealTimeWaiting:any[] = [];
  filteredWaitingRoomData:any[] = [];
  getWaitingRoomData() {
    this.WaitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        this.waitingRoomData.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        this.waitingRoomData.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE;
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
        //this.listPatientId = this.waitingRoomData.map((item: any) => item.patient_id);
        //localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.filteredWaitingRoomData = [...this.waitingRoomData];
        console.log("Check realtime waiting: ", this.CheckRealTimeWaiting)
        //this.waitingRoomService.updateData(this.CheckRealTimeWaiting);
        this.dataService.UpdateWaitingRoomTotal(3, this.CheckRealTimeWaiting.length);
        localStorage.setItem("ListPatientWaiting", JSON.stringify(this.CheckRealTimeWaiting));
      },
      (error) => {
        //this.loading = false;
        //ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
  }

  onProcedureChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
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

    if (this.currentPatientCreated == true) {
      this.POST_WAITTINGROOM.patient_created_date = '1';
      this.currentPatientCreated = false;
    } else {
      const storeLi = localStorage.getItem('listSearchPatient');
      var ListPatientStore = [];
      if (storeLi != null) {
        ListPatientStore = JSON.parse(storeLi);
      }
      if (ListPatientStore.length != 0) {
        ListPatientStore.forEach((item: any) => {
          if (item.patientId == this.POST_WAITTINGROOM.patient_id) {
            if (item.patientDescription != null && item.patientDescription.includes('@@isnew##')) {
              this.POST_WAITTINGROOM.patient_created_date = '1';
            } else {
              this.POST_WAITTINGROOM.patient_created_date = '2';
            }
          }
        })
      }
    }
    const postInfo = this.POST_WAITTINGROOM.epoch + ' - ' + this.POST_WAITTINGROOM.produce_id + ' - ' + this.POST_WAITTINGROOM.produce_name + ' - '
      + this.POST_WAITTINGROOM.patient_id + ' - ' + this.POST_WAITTINGROOM.patient_name + ' - ' + this.POST_WAITTINGROOM.reason + ' - '
      + this.POST_WAITTINGROOM.status + ' - ' + this.POST_WAITTINGROOM.appointment_id + ' - ' + this.POST_WAITTINGROOM.appointment_epoch + ' - ' + this.POST_WAITTINGROOM.patient_created_date;
    localStorage.setItem("ob", JSON.stringify(postInfo));
      this.WaitingRoomService.postWaitingRoom(this.POST_WAITTINGROOM)
      .subscribe((data) => {
        //this.updateWaitingRoomList();
        this.showSuccessToast("Thêm phòng chờ thành công!!");
        let ref = document.getElementById('cancel-add-waiting');
        ref?.click();
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
          console.log(this.messageBody);
          this.webSocketService.sendMessage(JSON.stringify(this.messageBody));
        }
        console.log("Here nha");
        const wt = {
          type: 'w',
          epoch: this.POST_WAITTINGROOM.epoch,
          produce_id: this.POST_WAITTINGROOM.produce_id,
          produce_name: this.POST_WAITTINGROOM.produce_name, patient_id: this.POST_WAITTINGROOM.patient_id, patient_name: this.POST_WAITTINGROOM.patient_name, patient_created_date: this.POST_WAITTINGROOM.patient_created_date, reason: "", status: "1", appointment_id: "", appointment_epoch: "" }
        console.log("check wt: ", this.filteredWaitingRoomData);
        this.filteredWaitingRoomData.push(wt);

        //Nếu dùng Behavior Subject

        //C1:
        // this.WaitingRoomService.updateData(this.filteredWaitingRoomData);

        //C2: Ok nhất nhưng phải call api, mà thôi kệ đi
        this.updateWaitingRoomList();

        //Còn không
        this.newWaitingRoom.emit(this.filteredWaitingRoomData);
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
        this.patientInfor = '';
      },
        (err) => {
          this.showErrorToast('Lỗi khi thêm phòng chờ');
        }
      );
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
      },
      error => {
        console.error('Failed to get waiting room data:', error);
      }
    );
  }

  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  isSearching: boolean = false;
  notFoundMessage: string = 'Không tìm thấy bệnh nhân';
  searchTimeout: any;
  onsearchPatientInWaitingRoom(event: any) {
    clearTimeout(this.searchTimeout);
    this.isSearching = true;
    const searchTermWithDiacritics = Normalize.normalizeDiacritics(event.target.value);
    if (this.isSearching) {
      this.notFoundMessage = 'Đang tìm kiếm...';
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
      if (this.patientList.length == 0) {
        this.notFoundMessage = 'Không tìm thấy bệnh nhân';
      }
      this.isSearching = false;
    } else {
      this.notFoundMessage = 'Không tìm thấy bệnh nhân';
      this.isSearching = false;
    }
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
