import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MaterialService } from 'src/app/service/MaterialService/material.service';

@Component({
  selector: 'app-material-management',
  templateUrl: './material-management.component.html',
  styleUrls: ['./material-management.component.css']
})
export class MaterialManagementComponent implements OnInit {
  materials:any;
  constructor(private materialService:MaterialService,
      private modalService:NgbModal
    ) { }
  pagingBill = {
    paging: 1,
    total: 0
  };
  ngOnInit(): void {
    this.getMaterial();
  }


  getMaterial(){
    this.materialService.getMaterial(1)
    .subscribe((res) => {
      this.materials = res.data;
    })
  }

}
