import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-cancel-appointment',
  templateUrl: './cancel-appointment.component.html',
  styleUrls: ['./cancel-appointment.component.css']
})
export class CancelAppointmentComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) {}

  dismiss() {
    this.activeModal.dismiss();
  }

  confirm() {
    this.activeModal.close('confirmed');
  }

  ngOnInit(): void {
  }

}
