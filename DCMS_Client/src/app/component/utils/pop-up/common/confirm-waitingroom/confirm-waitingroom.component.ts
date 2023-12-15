import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-confirm-waitingroom',
  templateUrl: './confirm-waitingroom.component.html',
  styleUrls: ['./confirm-waitingroom.component.css']
})
export class ConfirmWaitingroomComponent implements OnInit {
  @Input() message!: string;
  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
