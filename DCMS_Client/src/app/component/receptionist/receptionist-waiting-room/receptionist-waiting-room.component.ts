import { Component, OnInit } from '@angular/core';


import { Auth } from 'aws-amplify';
import { CognitoService } from 'src/app/service/cognito.service';
import { Router } from '@angular/router';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { ToastrService } from 'ngx-toastr';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import * as moment from 'moment';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit {
  waitingRoomData: any;
  loading: boolean = false;
  procedure: string = '0';
  listGroupService: any[] = [];
  listTemp: any[] = [];
  status: string = '1';
  filteredWaitingRoomData: any[] = [];
  listPatientId: any[] = [];
  PUT_WAITINGROOM: IPostWaitingRoom;
  dataStorage: string = '';
  intervalId: any;
  roleId: any;
  constructor(private waitingRoomService: ReceptionistWaitingRoomService,
    private appointmentService: ReceptionistAppointmentService,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService,
    private medicaoProcedureGroupService: MedicalProcedureGroupService
  ) {

    this.PUT_WAITINGROOM = {
      epoch: 0,
      produce_id: "1",
      produce_name: '',
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 1
    } as IPostWaitingRoom
  }

  ngOnInit(): void {
    let co = sessionStorage.getItem('role');
    if (co != null) {
      this.roleId = co.split(',');
    }
    this.getListGroupService();
    if (this.roleId.includes('2') || this.roleId.includes('4') || this.roleId.includes('5')) {
      // this.intervalId = setInterval(() => {
      //   this.getWaitingRoomData();
      // }, 1000);
    } else {
      this.getWaitingRoomData();
    }
  }
  
  getWaitingRoomData() {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        this.waitingRoomData.forEach((i: any) => {
          i.date = this.timestampToTime(i.epoch)
        });
        const statusOrder: { [key: number]: number } = { 2: 1, 3: 2, 1: 3, 4: 4 };
        this.waitingRoomData.sort((a: any, b: any) => {
          const orderA = statusOrder[a.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
          const orderB = statusOrder[b.status] ?? Number.MAX_VALUE; // Fallback if status is not a valid key
          return orderA - orderB;
        });
        this.listPatientId = this.waitingRoomData.map((item: any) => item.patient_id);
        localStorage.setItem('listPatientId', JSON.stringify(this.listPatientId));
        this.filteredWaitingRoomData = [...this.waitingRoomData]; // Update the filtered list as well
        if (this.roleId.includes('2') || this.roleId.includes('4') || this.roleId.includes('5')) {
          this.filteredWaitingRoomData = this.filteredWaitingRoomData.filter((item) => item.status == "2");
        }
        console.log(this.filteredWaitingRoomData);
      },
      (error) => {
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room", error);
      }
    );
  }
  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }
  getListGroupService() {
    this.medicaoProcedureGroupService.getMedicalProcedureGroupList().subscribe((res: any) => {
      this.listGroupService = res.data;
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicaoProcedureGroupService.url + "/medical-procedure-group", error);
      }
    )
  }
  filterProcedure() {
    if (this.procedure === '0') {
      this.filteredWaitingRoomData = [...this.waitingRoomData];
      this.loading = false;
    } else {
      this.filteredWaitingRoomData = this.waitingRoomData.filter((item: IPostWaitingRoom) => item.produce_id === this.procedure);
      this.loading = false;
    }
  }

  selectedColor: string = '#000';
  onPutStatus(wtr: any, epoch: number) {
    this.PUT_WAITINGROOM = {
      epoch: epoch,
      produce_id: wtr.produce_id,
      produce_name: wtr.produce_name,
      patient_id: wtr.patient_id,
      patient_name: wtr.patient_name,
      reason: wtr.reason,
      status: Number(wtr.status)
    } as IPostWaitingRoom
    this.loading = true;
    if (this.PUT_WAITINGROOM.status == 4) {
      const index = this.filteredWaitingRoomData.findIndex((item: any) => item.patient_id == this.PUT_WAITINGROOM.patient_id);
      if (index != -1) {
        this.filteredWaitingRoomData.splice(index, 1);
      }
      this.listTemp = this.filteredWaitingRoomData;
      localStorage.setItem('listPatientId', JSON.stringify(this.listTemp));
      this.waitingRoomService.deleteWaitingRooms(this.PUT_WAITINGROOM)
        .subscribe((data) => {
          this.loading = false;
          this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
          this.showSuccessToast('Xóa hàng chờ thành công');

          ///this.getWaitingRoomData();
        },
          (error) => {
            this.loading = false;
            //this.showErrorToast('Xóa hàng chờ thất bại');
            ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROOM, error);
          }
        )
    } else {
      this.waitingRoomService.putWaitingRoom(this.PUT_WAITINGROOM)
        .subscribe(data => {
          this.loading = false;
          this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
          this.showSuccessToast('Chỉnh sửa hàng chờ thành công');
          this.getWaitingRoomData();
          
        },
          (error) => {
            this.loading = false;
            //this.showErrorToast('Chỉnh sửa hàng chờ thất bại');
            ResponseHandler.HANDLE_HTTP_STATUS(this.waitingRoomService.apiUrl + "/waiting-room/" + this.PUT_WAITINGROOM, error);
          }
        )
    }
  }
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(3);
    } else {
      return phoneNumber;
    }
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
  stopClick(event: Event) {
    event.stopPropagation();
  }
  details(id: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', id])
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      this.router.navigate(['dangnhap']);
    })
  }
  navigateHref(href: string, id:any) {
    this.router.navigate([href + id]);
  }
}
