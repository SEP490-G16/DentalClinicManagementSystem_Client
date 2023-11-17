import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {ImportMaterialService} from "../../../../service/MaterialService/import-material.service";
import {ToastrService} from "ngx-toastr";
import {MaterialWarehouseService} from "../../../../service/MaterialService/material-warehouse.service";
import {MaterialService} from "../../../../service/MaterialService/material.service";

@Component({
  selector: 'app-popup-add-bill-import-material',
  templateUrl: './popup-add-bill-import-material.component.html',
  styleUrls: ['./popup-add-bill-import-material.component.css']
})
export class PopupAddBillImportMaterialComponent implements OnInit {
  model!:NgbDateStruct;
  options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4'];
  selectedOption: any;
  constructor(private importMaterialService: ImportMaterialService,
              private materialWarehouseService:MaterialWarehouseService,
              private materialService:MaterialService,
              private toastr: ToastrService) { }
  status:boolean = false;
  pagingMaterial ={
    paging:1,
    total:0
  }
  ngOnInit(): void {

  }
  importBill={
    createDate:'',
    creator:'',
  }
  importBillBody={
    created_date:'',
    creator:''
  }
  importMaterialBody={
    material_id:'',
    import_material_id:'',
    quantity_import:'',
    price:'',
    warranty:'',
    discount:0
  }
  materialInput={
    tenVatLieu:'',
    donVi:'',
    soLuong:'',
    donGia:'',
    hanSudung:'',
    thanhTien:'',
    chietKhau:''
  }
  materialList:any;
  records_body: any[] = []
  isAdd: boolean = false;
  records: any[] = [];
  materials: any[] = [];
  phieuLapId:any;
  totalAmount: number = 0;
  loading:boolean = false;
  addImportBill(){
    let createDate = new Date(this.importBill.createDate);
    let createDateTimestamp = (createDate.getTime()/1000).toString();
    this.importBillBody={
      created_date: createDateTimestamp,
      creator: this.importBill.creator
    }
    this.importMaterialService.addImportBill(this.importBillBody).subscribe(data=>{
      this.toastr.success('Thêm mới phiếu thành công!');
      this.phieuLapId = data.data.import_material_id;
      this.status = true;

    },
      error => {
      this.toastr.error('Thêm mới phiếu thất bại !');
      }
      )
  }
  toggleAdd() {
    this.isAdd = !this.isAdd;
    console.log("A",this.isAdd);
    if (this.isAdd){
      this.getMaterials(this.pagingMaterial.paging);
      this.records.push({...this.materialInput});
    }
    this.calculateTotalAmount();
  }

  addImportMaterial(){
    console.log("button trigger");
    this.records.forEach((record:any) =>{
      console.log("record", this.records);
      let warrantyDate = new Date(record.hanSudung);
      let warrantyTimestamp = (warrantyDate.getTime()/1000).toString();
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
    this.materialWarehouseService.ImportMaterial(this.materials).subscribe(data =>{
      this.toastr.success('Import vật liệu thành công !');
      window.location.reload();
    },
      error => {
      this.loading = false;
      this.toastr.error('Import vật liệu thất bại !');
      }
      )
  }d: boolean = false;
  getMaterials(paging:number){
    this.materialService.getMaterial(paging).subscribe(data=>{
      const transformedMaterialList = data.data.map((item:any) => {
        return {
          id: item.material_id,
          tenVatLieu: item.material_name,
          donVi:item.unit
        };
      });
      this.materialList = transformedMaterialList;
      if (this.materialList.length < 11){
        this.pagingMaterial.total+=this.materialList.length;
      }
      else
      {
        this.pagingMaterial.total=this.materialList.length;
      }
    })
  }
  temporaryName: string='';

  updateTemporaryName(record:any,event:any) {
    // event chứa tên vật liệu được chọn
    console.log(event);
    const selectedMaterial = this.materialList.find((material:any) => material.id === event);
    console.log(selectedMaterial.donVi);
    if (selectedMaterial) {
      this.temporaryName = selectedMaterial.tenVatLieu;
      record.donVi = selectedMaterial.donVi;
      console.log(record.donVi);
    }
  }
  calculateThanhTien(record:any) {
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
  private resetMaterialInput(){
    this.materialInput ={
      tenVatLieu:'',
      donVi:'',
      soLuong:'',
      donGia:'',
      hanSudung:'',
      thanhTien:'',
      chietKhau:''
    }
  }
  toggleCancel(){
    this.isAdd = false;
    if (this.records.length > 0) {
      this.records.pop();
    }
  }
  deleteRecord(index: number) {
    this.records.splice(index, 1);
  }
  onAddNewMaterial() {
    // Logic để thêm mới một vật liệu
    // Có thể là mở một modal form, hoặc chuyển hướng đến trang thêm mới vật liệu
  }
}
