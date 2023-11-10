import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-patient-appointment-tab',
  templateUrl: './patient-appointment-tab.component.html',
  styleUrls: ['./patient-appointment-tab.component.css']
})
export class PatientAppointmentTabComponent implements OnInit {

  constructor(private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private router: Router,
    private toastr: ToastrService) { }

  id: string = "";
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
  }

  navigateHref(href: string) {
    this.router.navigate(['' + href + this.id]);
  }

}
