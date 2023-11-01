import { LaboService } from './../../../service/LaboService/Labo.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ILabos } from 'src/app/model/ILabo';

@Component({
  selector: 'app-labo',
  templateUrl: './labo.component.html',
  styleUrls: ['./labo.component.css']
})
export class LaboComponent implements OnInit {

  Labos: ILabos[] = [];

  constructor(
    private LaboService:LaboService,

    private toastr:ToastrService
  ) {


    this.LaboEdit = {
      labo_name: "",
      address: "",
      phone_number: "",
      email: ""
    } as ILabos

  }

  ngOnInit(): void {
    this.getLabos();

    if(this.Labos.length == 0) {
      this.seedLabos();
    }
  }

  getLabos() {
      this.LaboService.getLabos()
      .subscribe((data) => {
          this.Labos = data;
          console.log("Labos", data);
      },
      (err) => {
          this.showErrorToast('Lỗi khi lấy dữ liệu cho Labo')
      }
      )
  }

  seedLabos(){
    this.Labos.push({
      laboId: 1,
      labo_name: "Xưởng A",
      address: "adsadsadsa",
      phone_number: "0123456789",
      email: "xuongA@xa.com"
    });

    this.Labos.push({
      laboId: 2,
      labo_name: "Xưởng B",
      address: "asdsasadas",
      phone_number: "0123456789",
      email: "xuongA@xa.com"
    });

    this.Labos.push({
      laboId: 3,
      labo_name: "Xưởng B",
      address: "zcxzcxzcx",
      phone_number: "0123456789",
      email: "xuongA@xa.com"
    });
  }


  LaboEdit:ILabos;
  openEditModal(labo:ILabos) {
      this.LaboEdit = labo;
  }

  deleteLabo(laboId:number) {

  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }
}
