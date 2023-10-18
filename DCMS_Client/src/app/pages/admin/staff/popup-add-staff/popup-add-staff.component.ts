import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-add-staff',
  templateUrl: './popup-add-staff.component.html',
  styleUrls: ['./popup-add-staff.component.css']
})
export class PopupAddStaffComponent implements OnInit {
  imageURL: string | ArrayBuffer = '';
  constructor() { }

  ngOnInit(): void {
  }
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