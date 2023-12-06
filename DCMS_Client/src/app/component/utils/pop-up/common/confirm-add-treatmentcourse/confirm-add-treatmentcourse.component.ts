import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-confirm-add-treatmentcourse',
  templateUrl: './confirm-add-treatmentcourse.component.html',
  styleUrls: ['./confirm-add-treatmentcourse.component.css']
})
export class ConfirmAddTreatmentcourseComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    console.log("ModalConfirm")
  }
  dismiss() {
    window.location.reload();
    this.activeModal.dismiss('cancel');
  }
  close(message:string){
    this.activeModal.close(message);
  }
}
