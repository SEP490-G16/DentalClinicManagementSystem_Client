import { Component, OnInit } from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-receptionist-appointment-list',
  templateUrl: './receptionist-appointment-list.component.html',
  styleUrls: ['./receptionist-appointment-list.component.css']
})
export class ReceptionistAppointmentListComponent implements OnInit {
  model!: NgbDateStruct;
  placement = 'bottom';
  constructor() {

   }

  ngOnInit(): void {
  }

}
