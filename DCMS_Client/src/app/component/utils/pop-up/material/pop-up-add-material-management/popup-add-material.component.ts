import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MaterialService } from 'src/app/service/MaterialService/material.service';

@Component({
  templateUrl: '../pop-up-add-material-management/popup-add-material.component.html',
  styleUrls: ['../pop-up-add-material-management/popup-add-material.component.css']
})
export class PopupAddMaterialManagement implements OnInit {
  PostMaterial: MaterialPost = {} as MaterialPost
  constructor(private materialService:MaterialService) {

  }
  ngOnInit(): void {

  }

}

interface MaterialPost {
  material_name: string,
  unit: number,
  total: number
}
