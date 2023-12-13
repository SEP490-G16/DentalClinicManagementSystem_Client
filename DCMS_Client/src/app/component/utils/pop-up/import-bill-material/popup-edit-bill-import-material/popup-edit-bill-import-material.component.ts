import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ImportMaterialService} from "../../../../../service/MaterialService/import-material.service";
import {MaterialWarehouseService} from "../../../../../service/MaterialService/material-warehouse.service";
import {ToastrService} from "ngx-toastr";
import {MaterialService} from "../../../../../service/MaterialService/material.service";
import {ResponseHandler} from "../../../libs/ResponseHandler";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {FormatNgbDate} from "../../../libs/formatNgbDateToString";

@Component({
  selector: 'app-popup-edit-bill-import-material',
  templateUrl: './popup-edit-bill-import-material.component.html',
  styleUrls: ['./popup-edit-bill-import-material.component.css']
})
export class PopupEditBillImportMaterialComponent implements OnChanges {
  @Input() importMaterialId:any;
  @Input() importMaterialBill:any;
  constructor(private importMaterialService: ImportMaterialService,
              private materialWarehouseService:MaterialWarehouseService,
              private toastr: ToastrService,
              private materialService:MaterialService) { }

  status:boolean = false;
  importBill={
    createDate:'',
    creator:'',
    totalAmount:0
  }
  importBillBody={
    created_date:'',
    creator:'',
    facility_id: ''
  }
  importMaterialBody={
    material_id:'',
    import_material_id:'',
    quantity_import:'',
    price:'',
    warranty:'',
    discount:0,
    remaining:'',
  }

  material_warehouse_Import_Id:string='';
  materialInput={
    material_id:'',
    material_warehouse_Import_Id: '',
    import_material_id:'',
    quantity_import:'',
    unit: '',
    price:'',
    totalAmount: 0,
    warranty:'',
    discount:0,
    remaining:'',
  }

  displayListImport:any[]= [];

  isAdd: boolean = false;
  records: any[] = [];
  materials: any[] = [];
  importMaterialBillId:any;
  materialListByImportMaterialId:any;
  materialList:any;
  totalAmount: number = 0;
  temporaryName: string='';
  paging:number=1;
  selectedMaterial: boolean = false;
  loading:boolean = false;
  hanSuDungNgbModal!:NgbDateStruct;
  createDateNgbModal!:NgbDateStruct;
  validateMaterial = {
    tenVatLieu:'',
    soLuong:'',
    donGia:'',
    hanSuDung:''
  }
  isSubmittedBill:boolean = false;
  ngOnInit(): void {
  }
  updateImportBill(){
    let faci = sessionStorage.getItem('locale');
    if (faci != null) {
      this.importBillBody.facility_id = faci;
    }
    const createDateParse = FormatNgbDate.formatNgbDateToString(this.createDateNgbModal);
    //let createDate = new Date(this.importBill.createDate);
    let createDate = new Date(createDateParse);
    let createDateTimestamp = (createDate.getTime()/1000).toString();
    this.importBillBody={
      created_date: createDateTimestamp,
      creator: this.importBill.creator,
      facility_id: this.importBillBody.facility_id
    }
    this.importMaterialService.updateImportBill(this.importMaterialBillId,this.importBillBody).subscribe(data=>{
        this.toastr.success('Cập nhật phiếu thành công!');
        this.status = true;
        window.location.reload();
      },
      error => {
        //this.toastr.error('Cập nhật phiếu thất bại !');
        ResponseHandler.HANDLE_HTTP_STATUS(this.importMaterialService.url+"/import-material/"+this.importMaterialBillId, error);
      }
    )
  }
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
      //console.log(this.materialList);
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialService.url+"/material/"+paging, error);
      }
      )
  }
  getMaterialsImportMaterialBills(importMaterialBillId:any){
      this.displayListImport = [];
      this.materialWarehouseService.getMaterialsByImportMaterialBill(importMaterialBillId).subscribe(data=>{
      this.materialListByImportMaterialId = data.data;
      this.getMaterials(this.paging);

      this.materialListByImportMaterialId.forEach((m:any) => {
        this.materialInput.material_warehouse_Import_Id = m.material_warehouse_id;
        console.log(m.material_warehouse_id);
        console.log("1hgvh", this.material_warehouse_Import_Id)
        this.materialInput.material_id = m.material_id;
        console.log(this.materialList);
        this.materialList.forEach((a:any) => {
          if (a.id == this.materialInput.material_id) {
            this.materialInput.unit = a.donVi;
          }
        })
        this.materialInput.totalAmount = m.quantity_import * m.price * (1 - m.discount);
        const warrantyDateParts = m.warranty?.split(' ')[0].split('-').map(Number);
        if (warrantyDateParts && warrantyDateParts.length === 3) {
          this.hanSuDungNgbModal = { year: warrantyDateParts[0], month: warrantyDateParts[1], day: warrantyDateParts[2] };
        }
        //const date = new Date(m.warranty);
        const date = new Date(warrantyDateParts);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm '0' ở đầu nếu cần
        const day = date.getDate().toString().padStart(2, '0'); // Thêm '0' ở đầu nếu cần
        //m.warranty = `${year}-${month}-${day}`;
        this.materialInput.warranty = `${year}-${month}-${day}`;
        this.materialInput.price = m.price;
        this.materialInput.discount = m.discount;
        this.materialInput.quantity_import = m.quantity_import;
        this.displayListImport.push(this.materialInput);
        this.materialInput={
          material_id:'',
          import_material_id:'',
          material_warehouse_Import_Id: '',
          quantity_import:'',
          unit: '',
          price:'',
          totalAmount: 0,
          warranty:'',
          discount:0,
          remaining:'',
        }
      });

      console.log(this.materialListByImportMaterialId)
    },
        error => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.materialWarehouseService.url+"/material-warehouse/"+importMaterialBillId, error);
        }
        )
  }
  materialWareHouseId:any;
  updateImportMaterial() {
    this.updateImportBill();
    this.displayListImport.forEach((material: any) => {
      this.materialListByImportMaterialId.forEach((a: any) => {
        if (a.material_id == material.material_id) {
          console.log(a.material_id)

          this.materialWareHouseId = a.material_warehouse_id;
          console.log(this.materialWareHouseId)
        }
      })
      this.resetValidateMaterial();
      let hanSudung = FormatNgbDate.formatNgbDateToString(this.hanSuDungNgbModal);
      if (!material.price){
        this.validateMaterial.donGia = "Vui lòng nhập đơn giá!";
        this.isSubmittedBill = true;
      }
      else if (!this.checkNumber(material.price)){
        this.validateMaterial.donGia = "Vui lòng nhập đơn giá > 0!";
        this.isSubmittedBill = true;
      }
      if (!material.quantity_import){
        this.validateMaterial.soLuong = "Vui lòng nhập số lượng!";
        this.isSubmittedBill = true;
      }
      else if (!this.checkNumber(material.quantity_import)){
        this.validateMaterial.soLuong = "Vui lòng nhập số lượng > 0!";
        this.isSubmittedBill = true;
      }
      if (!hanSudung || !this.formatDate(hanSudung)){
        this.validateMaterial.hanSuDung = "Vui lòng nhập hạn sử dụng!";
        this.isSubmittedBill = true;
      }
      if (this.isSubmittedBill){
        return;
      }
      //const warranty = FormatNgbDate.formatNgbDateToString(this.hanSuDungNgbModal);
      //let warrantyDate = new Date(material.warranty);
      let warrantyDate = new Date(hanSudung);
      let warrantyTimestamp = (warrantyDate.getTime() / 1000).toString();
      this.importMaterialBody = {
        material_id: material.material_id,
        import_material_id: this.importMaterialBillId,
        quantity_import: material.quantity_import,
        price: material.price,
        warranty: warrantyTimestamp,
        discount: material.discount.toString(),
        remaining: '0'
      }
      console.log("abc")
      this.loading = true;
      this.materialWarehouseService.updateMaterialImportMaterial(this.materialWareHouseId, this.importMaterialBody).subscribe(data => {
        this.toastr.success('Cập nhật thành công !');
        window.location.reload();
      },
        error => {
          this.loading = false;
          //this.toastr.error('Cập nhật thất bại !');
          ResponseHandler.HANDLE_HTTP_STATUS(this.materialWarehouseService.url+"/material-warehouse/material_warehouse_id/"+this.materialWareHouseId, error);
        }
      )
    })
  }
  updateTemporaryName(m:any,event:any) {
    // event chứa tên vật liệu được chọn
    console.log(event);
    m.materialList = event;
    const selectedMaterial = this.materialList.find((material:any) => material.id === event);
    this.selectedMaterial = true;
    console.log(selectedMaterial.donVi);
    if (selectedMaterial) {
      this.temporaryName = selectedMaterial.tenVatLieu;
      m.unit = selectedMaterial.donVi;
      console.log(m.donVi);
    }
    if (m.material_id && this.materialList) {
      // Tìm vật liệu tương ứng trong danh sách materialList
      const selectedMaterial = this.materialList.find((material:any) => material.id === m.material_id);

      if (selectedMaterial) {
        // Cập nhật đơn vị của vật liệu tương ứng
        m.donVi = selectedMaterial.donVi;
      }
    }
  }
  calculateThanhTien(record:any) {
    if (record.quantity_import && record.price) {
      record.totalAmount = record.quantity_import * record.price * (1 - record.discount);
    } else {
      record.totalAmount = null;
    }
    this.calculateTotalAmount();
  }
  calculateTotalAmount() {
   this.importBill.totalAmount = 0;
    for (const record of this.displayListImport) {
      if (record.totalAmount) {
        this.importBill.totalAmount += record.totalAmount;
      }
    }
  }
  toggleAdd() {
    this.isAdd = true;
    console.log("A",this.isAdd);
    if (this.isAdd){
      this.records.push({...this.materialInput});
      /*this.getMaterials(this.paging);*/
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['importMaterialId']){
      this.importMaterialBillId = this.importMaterialId;
      this.getMaterialsImportMaterialBills(this.importMaterialBillId);
    }
    if (changes['importMaterialBill']){
      console.log(this.importMaterialBill.CreateDate)
      //let createdDate = new Date(this.importMaterialBill.created_date);
      // const orginalCreateDate = this.importMaterialBill.CreateDate;
      // const createDatePart = orginalCreateDate.split(" ");
      // const formattedCreateDate = createDatePart[0];
      // this.importBill.createDate = formattedCreateDate;
      const createDateParts = this.importMaterialBill.CreateDate?.split(' ')[0].split('-').map(Number);
      if (createDateParts && createDateParts.length === 3) {
        this.createDateNgbModal = { year: createDateParts[0], month: createDateParts[1], day: createDateParts[2] };
      }
      this.importBill.creator = this.importMaterialBill.CreateBy;
      this.importBill.totalAmount = this.importMaterialBill.TotalAmount;
    }
  }

  deleteMaterialWareHouse(id:any){
    this.materialWarehouseService.deleteMaterialImportMaterial(id).subscribe(data=>{
      this.toastr.success('Xoá thành công!');
      const index = this.displayListImport.findIndex((item:any) => item.m.material_warehouse_Import_Id == id);
      if (index != -1) {
        this.displayListImport.splice(index, 1);
      }
    },
      error => {
      //this.toastr.error('Xoá thất bại!');
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialWarehouseService.url+"/material-warehouse/material_warehouse_id/"+id, error);
      })
  }
  addNewMaterials() {
    this.displayListImport.push({
      quantity_import: '',
      price: '',
      totalAmount: '',
      warranty: '',
      discount: '',
    });
    this.isAdd = true;
  }
  private resetValidateMaterial(){
    this.validateMaterial = {
      tenVatLieu:'',
      soLuong:'',
      donGia:'',
      hanSuDung:''
    }
    this.isSubmittedBill = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  private formatDate(dateString: any): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }
}
