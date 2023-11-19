import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {ImportMaterialService} from "../../../../../service/MaterialService/import-material.service";
import {ToastrService} from "ngx-toastr";
import {MaterialWarehouseService} from "../../../../../service/MaterialService/material-warehouse.service";
import {MaterialService} from "../../../../../service/MaterialService/material.service";
import * as moment from "moment-timezone";

@Component({
  selector: 'app-popup-add-bill-import-material',
  templateUrl: './popup-add-bill-import-material.component.html',
  styleUrls: ['./popup-add-bill-import-material.component.css']
})
export class PopupAddBillImportMaterialComponent implements OnInit {
  model!: NgbDateStruct;
  options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4'];
  selectedOption: any;

  constructor(private importMaterialService: ImportMaterialService,
              private materialWarehouseService: MaterialWarehouseService,
              private materialService: MaterialService,
              private toastr: ToastrService) {

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    this.model = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };
  }

  status: boolean = false;
  pagingMaterial = {
    paging: 1,
    total: 0
  }

  ngOnInit(): void {

  }

  importBill = {
    creator: '',
  }
  importBillBody = {
    created_date:0,
    creator: ''
  }
  importMaterialBody = {
    material_id: '',
    import_material_id: '',
    quantity_import: '',
    price: '',
    warranty: '',
    discount: 0
  }
  materialInput = {
    tenVatLieu: '',
    donVi: '',
    soLuong: '',
    donGia: '',
    hanSudung: '',
    thanhTien: '',
    chietKhau: ''
  }
  materialList: any;
  records_body: any[] = []
  isAdd: boolean = false;
  records: any[] = [];
  materials: any[] = [];
  phieuLapId: any;
  totalAmount: number = 0;
  loading: boolean = false;
  count: number = 0;

  toggleAdd() {
    this.isAdd = !this.isAdd;
    console.log("A", this.isAdd);
    if (this.isAdd) {
      this.getMaterials(this.pagingMaterial.paging);
      this.records.push({...this.materialInput});
    }
    this.calculateTotalAmount();
  }

  toggleSave() {
    this.isAdd = false;
  }

  //test
  userInput: string = '';
  showPopup: boolean = false;
  suggestion: string = '';

  addImportMaterial() {

    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    let createDateTimestamp = this.dateToTimestamp(selectedDate) ;
    //alert(createDateTimestamp);
    //return;
    this.importBillBody = {
      created_date: createDateTimestamp,
      creator: this.importBill.creator
    }
    this.importMaterialService.addImportBill(this.importBillBody).subscribe(data => {
        this.toastr.success('Thêm mới phiếu thành công!');
        this.phieuLapId = data.data.import_material_id;
        this.status = true;
        this.records.forEach((record: any) => {
          console.log("record", this.records);
          let warrantyDate = new Date(record.hanSudung);
          let warrantyTimestamp = (warrantyDate.getTime() / 1000).toString();
          this.importMaterialBody = {
            material_id: record.tenVatLieu,
            import_material_id: this.phieuLapId,
            quantity_import: record.soLuong,
            price: record.donGia,
            warranty: warrantyTimestamp,
            discount: record.chietKhau
          }
          this.materials.push(this.importMaterialBody);
        })
        console.log(this.materials);
        this.loading = true;
        this.materialWarehouseService.ImportMaterial(this.materials).subscribe(data => {

            window.location.reload();
          },
          error => {
            this.loading = false;

          }
        )
      },
      error => {
        this.toastr.error('Thêm mới phiếu thất bại !');
      }
    )
  }

  d: boolean = false;

  getMaterials(paging: number) {
    this.materialService.getMaterial(paging).subscribe(data => {
      const transformedMaterialList = data.data.map((item: any) => {
        return {
          id: item.material_id,
          tenVatLieu: item.material_name,
          donVi: item.unit
        };
      });
      this.materialList = transformedMaterialList;
      if (this.materialList.length < 11) {
        this.pagingMaterial.total += this.materialList.length;
      } else {
        this.pagingMaterial.total = this.materialList.length;
      }
    })
  }

  temporaryName: string = '';

  updateTemporaryName(record: any, event: any) {
    // event chứa tên vật liệu được chọn
    console.log(event);
    const selectedMaterial = this.materialList.find((material: any) => material.id === event);
    console.log(selectedMaterial.donVi);
    if (selectedMaterial) {
      this.temporaryName = selectedMaterial.tenVatLieu;
      record.donVi = selectedMaterial.donVi;
      console.log(record.donVi);
    }
  }

  calculateThanhTien(record: any) {
    if (record.soLuong && record.donGia) {
      record.thanhTien = record.soLuong * record.donGia;
    } else {
      record.thanhTien = null;
    }
  }

  calculateTotalAmount() {
    this.totalAmount = 0;
    for (const record of this.records) {
      if (record.thanhTien) {
        this.totalAmount += record.thanhTien;
      }
    }
  }

  private resetMaterialInput() {
    this.materialInput = {
      tenVatLieu: '',
      donVi: '',
      soLuong: '',
      donGia: '',
      hanSudung: '',
      thanhTien: '',
      chietKhau: ''
    }
  }

  toggleCancel() {
    this.isAdd = false;
    if (this.records.length > 0) {
      this.records.pop();
    }
  }

  deleteRecord(index: number) {
    this.records.splice(index, 1);
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
}

