import { Component, OnInit } from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-warehouse-import-material-management',
  templateUrl: './warehouse-import-material-management.component.html',
  styleUrls: ['./warehouse-import-material-management.component.css']
})
export class WarehouseImportMaterialManagementComponent implements OnInit {
  model!:NgbDateStruct;
  constructor() { }

  ngOnInit(): void {
  }

}
