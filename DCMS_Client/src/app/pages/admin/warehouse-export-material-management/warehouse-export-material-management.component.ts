import { Component, OnInit } from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-warehouse-export-material-management',
  templateUrl: './warehouse-export-material-management.component.html',
  styleUrls: ['./warehouse-export-material-management.component.css']
})
export class WarehouseExportMaterialManagementComponent implements OnInit {
  model!:NgbDateStruct;
  constructor() { }

  ngOnInit(): void {
  }

}
