import { Component, OnInit } from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-popup-add-approve-specimens',
  templateUrl: './popup-add-approve-specimens.component.html',
  styleUrls: ['./popup-add-approve-specimens.component.css']
})
export class PopupAddApproveSpecimensComponent implements OnInit {
  model!: NgbDateStruct
  model2!: NgbDateStruct
  model3!: NgbDateStruct
  constructor() { }

  ngOnInit(): void {
  }

}
