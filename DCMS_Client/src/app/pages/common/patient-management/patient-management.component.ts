import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-patient-management',
  templateUrl: './patient-management.component.html',
  styleUrls: ['./patient-management.component.css']
})
export class PatientManagementComponent implements OnInit {

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
}

