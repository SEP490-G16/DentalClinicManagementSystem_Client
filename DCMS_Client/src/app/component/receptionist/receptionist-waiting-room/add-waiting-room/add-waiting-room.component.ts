import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { PatientService } from 'src/app/service/PatientService/patient.service';

import * as moment from 'moment-timezone';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
@Component({
  selector: 'app-add-waiting-room',
  templateUrl: './add-waiting-room.component.html',
  styleUrls: ['./add-waiting-room.component.css']
})
export class AddWaitingRoomComponent implements OnInit {

  POST_WAITTINGROOM :IPostWaitingRoom;

  //
  phone_number:string = '';
  constructor(
    private WaitingRoomService: ReceptionistWaitingRoomService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router
  ) {

    this.POST_WAITTINGROOM = {
      epoch: 0,
      produce_id: "1",
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 1
    } as IPostWaitingRoom

   }
    validateWatingRoom = {
      phone:'',
      procedure:'',
      status:'',
      reason:''
    }
    isSubmitted:boolean = false;
  ngOnInit(): void {
  }


  onPhoneInput() {
    // console.log();
    this.resetValidate();
    if (!this.phone_number){
      this.validateWatingRoom.phone = "Vui lòng nhập số điện thoại!";
      this.isSubmitted = true;
    }
    else if (!this.isVietnamesePhoneNumber(this.phone_number)){
      this.validateWatingRoom.phone = "Số điện thoại không hợp lệ"
    }
    else {
      this.PATIENT_SERVICE.getPatientPhoneNumber(this.phone_number).subscribe((data) => {
          this.POST_WAITTINGROOM.patient_id = data[0].patient_id;
          this.POST_WAITTINGROOM.patient_name= data[0].patient_name;
        },
        (err) => {
          this.showErrorToast("Không tìm thấy số điện thoại");
        }
      )
    }

  }

  onPostWaitingRoom() {
      //Convert date to timestamp:
      const date = new Date();
      this.POST_WAITTINGROOM.epoch = this.convertDateToTimestampWithGMT7(date);
      this.resetValidate();
      if (!this.phone_number){
        this.validateWatingRoom.phone = "Vui lòng nhập số điện thoại!";
        this.isSubmitted = true;
      }
      else if (!this.isVietnamesePhoneNumber(this.phone_number)){
        this.validateWatingRoom.phone = "Số điện thoại không hợp lệ!";
        this.isSubmitted = true;
      }
      if (!this.POST_WAITTINGROOM.produce_id){
        this.validateWatingRoom.procedure="Vui lòng chọn loại điều trị!";
        this.isSubmitted = true;
      }
      if (!this.POST_WAITTINGROOM.status){
        this.validateWatingRoom.status = "Vui lòng chọn trạng thái!";
        this.isSubmitted = true;
      }
      if (!this.POST_WAITTINGROOM.reason){
        this.validateWatingRoom.reason = "Vui lòng nhập lý do khám!";
        this.isSubmitted = true;
      }
      if (this.isSubmitted){
        return;
      }
      this.WaitingRoomService.postWaitingRoom(this.POST_WAITTINGROOM)
      .subscribe((data) => {
        this.showSuccessToast("Thêm phòng chờ thành công!!");

        this.phone_number = '';
        this.POST_WAITTINGROOM = {
          epoch: 0,
          produce_id: "1",
          patient_id: '',
          patient_name: '',
          reason: '',
          status: 1
        } as IPostWaitingRoom

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      (err) => {
        this.showErrorToast('Lỗi khi thêm phòng chờ');
      }
      );

  }

  convertDateToTimestampWithGMT7(date: Date): number {
    // Tạo một đối tượng Moment từ ngày và múi giờ gốc (UTC)
    const momentDate = moment(date);

    // Chuyển đổi sang múi giờ GMT+7 (Asia/Ho_Chi_Minh)
    const momentDateGMT7 = momentDate.tz('Asia/Ho_Chi_Minh');

    // Lấy timestamp
    const timestamp = momentDateGMT7.valueOf();

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
      produce_id: "1",
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 0
    } as IPostWaitingRoom
  }
  private resetValidate(){
    this.validateWatingRoom = {
      phone:'',
      procedure:'',
      status:'',
      reason:''
    }
    this.isSubmitted = false;
  }
  private isVietnamesePhoneNumber(number:string):boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
}
