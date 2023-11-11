import { Component, OnInit } from '@angular/core';


import { Auth } from 'aws-amplify';
import { CognitoService } from 'src/app/service/cognito.service';
import { Router } from '@angular/router';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { IPostWaitingRoom } from 'src/app/model/IWaitingRoom';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit {

  waitingRoomData: any;
  loading:boolean = false;
  procedure: string = '0';

  status: string = '1';
  PUT_WAITINGROOM: IPostWaitingRoom;

  constructor(private waitingRoomService: ReceptionistWaitingRoomService,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService
  ) {

    this.PUT_WAITINGROOM = {
      epoch: 0,
      produce: 1,
      patient_id: '',
      patient_name: '',
      reason: '',
      status: 1
    } as IPostWaitingRoom
  }

  ngOnInit(): void {
    this.getWaitingRoomData();
    this.waitingRoomData = [
      {
        epoch: 1698765209,
        patient_id: 'HE153724',
        patient_name: 'Pham Thanh Long',
        produce: 1,
        status: 1,
        reason: 'Đau răng',
      },
      {
        epoch: 1698768809,
        patient_id: 'HE121321',
        patient_name: 'Keke',
        produce: 2,
        status: 2,
        reason: 'Đau răng',
      },
      {
        epoch: 1698772409,
        patient_id: 'HE113233',
        patient_name: 'kiki',
        produce: 3,
        status: 3,
        reason: 'Đau răng',
      },
    ]
    // console.log(this.waitingRoomData);
    this.filteredWaitingRoomData = this.waitingRoomData;
  }


  getWaitingRoomData() {
    this.waitingRoomService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        console.log(this.waitingRoomData);
        if (this.waitingRoomData.length == 0) {
          this.waitingRoomData.push({
            epoch: 1698765209,
            patient_id: 'HE153724',
            patient_name: 'Pham Thanh Long',
            produce: 1,
            status: 1,
            reason: 'Đau răng',
          });

          this.waitingRoomData.push(
            {
              epoch: 1698768809,
              patient_id: 'HE121321',
              patient_name: 'Keke',
              produce: 2,
              status: 2,
              reason: 'Đau răng',
            });

          this.waitingRoomData.push(
            {
              epoch: 1698772409,
              patient_id: 'HE113233',
              patient_name: 'kiki',
              produce: 3,
              status: 3,
              reason: 'Đau răng',
            }
          )
        }
        this.waitingRoomData.sort((a: any, b: any) => a.epoch - b.epoch);
        console.log(this.waitingRoomData);
      }
    );
  }

  filteredWaitingRoomData: any[] = [];
  filterProcedure() {
    if (this.procedure === '0') {
      this.filteredWaitingRoomData = [...this.waitingRoomData];
    } else {
      this.filteredWaitingRoomData = this.waitingRoomData.filter((item: IPostWaitingRoom) => item.produce.toString() === this.procedure);
    }
  }

  onPutStatus(wtr: any, epoch: number) {
    this.PUT_WAITINGROOM = {
      epoch: epoch,
      produce: Number(wtr.produce),
      patient_id: wtr.patient_id,
      patient_name: wtr.patient_name,
      reason: wtr.reason,
      status: Number(wtr.status)
    } as IPostWaitingRoom

    if (this.PUT_WAITINGROOM.status == 4) {
      this.waitingRoomService.deleteWaitingRooms(this.PUT_WAITINGROOM)
        .subscribe((data) => {
          this.showSuccessToast('Xóa hàng chờ thành công');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
          () => {
            this.showErrorToast('Xóa hàng chờ thất bại');
          }
        )
    }else {
      this.waitingRoomService.putWaitingRoom(this.PUT_WAITINGROOM)
        .subscribe(data => {
          this.showSuccessToast('Chỉnh sửa hàng chờ thành công');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
          () => {
            this.showErrorToast('Chỉnh sửa hàng chờ thất bại');
          }
        )
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


  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }

}
