import { Component, OnInit } from '@angular/core';
import { ReceptionistService } from 'src/app/service/receptionist.service';

import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit {
  waitingRoomData: any;

  constructor(private receptionistService: ReceptionistService) { }

  ngOnInit(): void {
    this.getWaitingRoomData();
  }

  getWaitingRoomData() {
    //this.receptionistService.getWaitingRooms();

    // .subscribe(
    //   (data) => {
    //     this.waitingRoomData = data;
    //   },
    //   (error) => {
    //     console.error('Lỗi khi lấy dữ liệu phòng chờ:', error);
    //   }
    // );

    return Auth.currentSession().then((session) => {
      const idToken = session.getIdToken().getJwtToken();
      console.log(idToken);
      //Create Sub
      // const headers = new HttpHeaders({
      //   'Authorization': `Bearer ${idToken}`
      });
  }



  preventNavigation(event: Event) {
    event.preventDefault();
  }

  imageURL: string | ArrayBuffer = '';

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }
}
