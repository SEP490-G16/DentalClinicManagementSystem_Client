import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-patient-profile-tab',
  templateUrl: './patient-profile-tab.component.html',
  styleUrls: ['./patient-profile-tab.component.css']
})
export class PatientProfileTabComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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

  maHoSo: string = '12345';
  dateCreated: string = '14/10/2023';
  fullName:string = 'Nguyễn Lan Hương';
  gender:boolean = false;
  phone:string = '0123456789';
  email:string = 'hehe@gmail.com';
  address:string = 'N/A';
  tsb:string = 'pretty';
  note: string = '...';

  isEditing: boolean = false;

  toggleEditing() {
    this.isEditing = !this.isEditing;
  }

}
