import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-add-bill-export-material',
  templateUrl: './popup-add-bill-export-material.component.html',
  styleUrls: ['./popup-add-bill-export-material.component.css']
})
export class PopupAddBillExportMaterialComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
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
  deleteRecord(index: number) {
    this.records.splice(index, 1);
  }
}
