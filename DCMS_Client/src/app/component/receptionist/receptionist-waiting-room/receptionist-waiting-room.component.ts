import { Component, OnInit } from '@angular/core';


import { Auth } from 'aws-amplify';
import { CognitoService } from 'src/app/service/cognito.service';
import { Router } from '@angular/router';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';

@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit {
  waitingRoomData: any;

  constructor(private receptionistService: ReceptionistWaitingRoomService, private cognitoService:CognitoService, private router:Router) { }

  ngOnInit(): void {
    this.getWaitingRoomData();
  }

  getWaitingRoomData() {
    this.receptionistService.getWaitingRooms().subscribe(
      data => {
        this.waitingRoomData = data;
        console.log(this.waitingRoomData);
      },
      // error => {
        // if (error.status === 401) {
        //   this.cognitoService.refreshToken()
        //     .then(newAccessToken => {
        //       console.log("New AccessToken: ",newAccessToken);
        //       this.receptionistService.getWaitingRooms().subscribe(
        //         newData => {
        //           this.waitingRoomData = newData;
        //           console.log(this.waitingRoomData);
        //         },
        //         newError => {
        //           console.log("New Error", newError);
        //         }
        //       );
        //     })
        //     .catch(refreshError => {
        //       console.error("Token refresh failed: ", refreshError);
        //       this.cognitoService.signOut()
        //         .then(() => {
        //           this.router.navigate(['/auth']);
        //         });
        //     });
        // } else {
        //   console.error("API error: ", error);
        // }
      //   console.error("API error: ", error);
      // }
    );
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
        console.log("Logged out!");
        this.router.navigate(['/auth']);
    })
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
