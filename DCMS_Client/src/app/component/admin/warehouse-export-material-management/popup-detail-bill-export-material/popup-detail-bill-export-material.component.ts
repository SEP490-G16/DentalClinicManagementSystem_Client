import { Component, OnInit } from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-popup-detail-bill-export-material',
  templateUrl: './popup-detail-bill-export-material.component.html',
  styleUrls: ['./popup-detail-bill-export-material.component.css']
})
export class PopupDetailBillExportMaterialComponent implements OnInit {
  model!:NgbDateStruct;
  constructor() { }

  ngOnInit(): void {
  }

}
