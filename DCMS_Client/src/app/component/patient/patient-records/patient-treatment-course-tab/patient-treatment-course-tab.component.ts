import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-patient-treatment-course-tab',
  templateUrl: './patient-treatment-course-tab.component.html',
  styleUrls: ['./patient-treatment-course-tab.component.css']
})
export class PatientTreatmentCourseTabComponent implements OnInit {

  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
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
      this.router.navigate(['/login']);
    })
  }
}
