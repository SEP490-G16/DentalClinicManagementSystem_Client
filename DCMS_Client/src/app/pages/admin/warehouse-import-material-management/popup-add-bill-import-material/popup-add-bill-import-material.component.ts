import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-add-bill-import-material',
  templateUrl: './popup-add-bill-import-material.component.html',
  styleUrls: ['./popup-add-bill-import-material.component.css']
})
export class PopupAddBillImportMaterialComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  maVatLieu:any;
  tenVatLieu:any;
  donVi:any;
  soLuong:any;
  donGia:any;
  thanhTien:any;
  hanSudung:any;
  chietKhau:any;
  isAdd: boolean = false;
  records: any[] = [];
  toggleAdd() {
    this.isAdd = !this.isAdd;
    if (this.isAdd){
      this.records.push({
        maVatLieu: null,
        tenVatLieu: null,
        donVi:null,
        soLuong:null,
        donGia:null,
        thanhTien:null,
        hanSudung:null,
        chietKhau:null

      });
    }

  }
}
