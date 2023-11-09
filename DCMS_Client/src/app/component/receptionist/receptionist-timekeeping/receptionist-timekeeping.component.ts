import { ReceptionistTimekeepingService } from './../../../service/ReceptionistService/receptionist-timekeeping.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';
@Component({
  selector: 'app-receptionist-timekeeping',
  templateUrl: './receptionist-timekeeping.component.html',
  styleUrls: ['./receptionist-timekeeping.component.css']
})
export class ReceptionistTimekeepingComponent implements OnInit {
  clockin:string = "";
  clockout:string = "";
  timeClockin:string = "";
  timeClockout:string = "";
  constructor(private cognitoService: CognitoService,
    private timekeepingService:ReceptionistTimekeepingService,
    private router: Router) {
  }
  ngOnInit(): void {

  }

  onClockin() {

  }

  onClockout() {

  }
}
