import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-receptionist-waiting-room',
  templateUrl: './receptionist-waiting-room.component.html',
  styleUrls: ['./receptionist-waiting-room.component.css']
})
export class ReceptionistWaitingRoomComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {

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
