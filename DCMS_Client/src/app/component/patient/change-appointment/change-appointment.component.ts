
import { Component, OnInit } from '@angular/core';




import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-change-appointment',
  templateUrl: './change-appointment.component.html',
  styleUrls: ['./change-appointment.component.css']
})
export class ChangeAppointmentComponent implements OnInit {
  model!:NgbDateStruct;

  ngOnInit(): void {
  }



}
