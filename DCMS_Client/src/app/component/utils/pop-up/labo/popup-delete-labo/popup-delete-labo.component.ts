import { Component, Input, OnInit } from '@angular/core';
import { LaboService } from 'src/app/service/LaboService/Labo.service';

@Component({
  selector: 'app-popup-delete-labo',
  templateUrl: './popup-delete-labo.component.html',
  styleUrls: ['./popup-delete-labo.component.css']
})
export class PopupDeleteLaboComponent implements OnInit {
  @Input() LaboId:any;
  constructor(
    private laboService:LaboService
  ) { }

  ngOnInit(): void {
  }

  confirmDelete(){
    this.laboService.deleteLabo(this.LaboId)
    .subscribe((res) => {

    },
    (err) => {
      if(err === 0) {}
    }
    )
  }
}
