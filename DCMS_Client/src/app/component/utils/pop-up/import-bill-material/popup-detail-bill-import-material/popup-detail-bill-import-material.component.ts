import { Component, OnInit } from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-popup-detail-bill-import-material',
  templateUrl: './popup-detail-bill-import-material.component.html',
  styleUrls: ['./popup-detail-bill-import-material.component.css']
})
export class PopupDetailBillImportMaterialComponent implements OnInit {
  model!:NgbDateStruct;
  constructor() { }

  ngOnInit(): void {
  }

}
