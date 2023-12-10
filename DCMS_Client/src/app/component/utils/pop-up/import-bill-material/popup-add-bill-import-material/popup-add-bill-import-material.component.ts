import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {ImportMaterialService} from "../../../../../service/MaterialService/import-material.service";
import {ToastrService} from "ngx-toastr";
import {MaterialWarehouseService} from "../../../../../service/MaterialService/material-warehouse.service";
import {MaterialService} from "../../../../../service/MaterialService/material.service";
import * as moment from "moment-timezone";
import {ResponseHandler} from "../../../libs/ResponseHandler";

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

    let createBy = sessionStorage.getItem('username');
    if (createBy != null) {
      this.importBill.creator = createBy;
    }
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
    creator: '',
    facility_id: ''
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
    chietKhau: 0
  }
  validateMaterial = {
    tenVatLieu:'',
    soLuong:'',
    donGia:'',
    hanSuDung:''
  }
  material = {
    name:'',
    unit:'',
    unitPrice:''
  }
  materialBody={
    material_name:'',
    unit:'',
    total:''
  }
  validate={
    name:'',
    unit:'',
    unitPrice:''
  }
  isAddMaterial:boolean = false;
  materialList: any;
  records_body: any[] = []
  isAdd: boolean = false;
  records: any[] = [];
  materials: any[] = [];
  phieuLapId: any;
  totalAmount: number = 0;
  loading: boolean = false;
  count: number = 0;
  isAddBill:boolean = false;
  isSubmitted:boolean = false;
  toggleAdd() {
    this.isAdd = true;
    this.isAddBill = true;
    console.log("A", this.isAdd);
    if (this.isAdd) {
        this.getMaterials(this.pagingMaterial.paging);
        this.records.push({...this.materialInput});
    }
    this.calculateTotalAmount();
  }
  toggleAddMaterial(){
    this.isAddMaterial = true;
    this.isAddBill = false;
  }
  toggleCancelMaterial(){
    this.isAddMaterial = false;
  }
  addMaterial(){
    this.resetValidate();
    if (!this.material.name){
      this.validate.name = "Vui lòng nhập tên vật liệu!";
      this.isSubmitted = true;
    }
    if (!this.material.unit){
      this.validate.unit = "Vui lòng nhập đơn vị!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.materialBody = {
      material_name: this.material.name,
      unit: this.material.unit,
      total:this.material.unitPrice
    }
    this.materialService.addMaterial(this.materialBody).subscribe(data=>{
        this.toastr.success('Thêm mới vật liệu thành công!');
        // const newMaterialId = data.data.medical_id;
        // this.materialBody.material_id = newMaterialId;
        // this.materialList.unshift(this.materialBody);
        this.isAddMaterial = false;
        this.materialList.push({
          id: data.data.medical_id,
          tenVatLieu: this.materialBody.material_name,
          donVi: this.materialBody.unit,
          donGia:this.materialBody.total
        })
      },
      error => {
        //this.toastr.error('Thêm mới vật liệu thất bại!');
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialService.url+"/material", error);
      }
    )
  }
  private resetValidate(){
    this.validate = {
      name:'',
      unit:'',
      unitPrice:''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }

  toggleSave() {
    this.isAdd = false;
  }

  //test
  userInput: string = '';
  showPopup: boolean = false;
  suggestion: string = '';

  addImportMaterial() {
    let ro = sessionStorage.getItem('locale');
    if (ro != null) {
      this.importBillBody.facility_id = ro
    }
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    let createDateTimestamp = this.dateToTimestamp(selectedDate) ;
    //alert(createDateTimestamp);
    //return;
    this.importBillBody = {
      created_date: createDateTimestamp,
      creator: this.importBill.creator,
      facility_id: this.importBillBody.facility_id
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
            discount: record.chietKhau,
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
            ResponseHandler.HANDLE_HTTP_STATUS("abc", error);
          }
        )
      },
      error => {
        //
        // this.toastr.error('Thêm mới phiếu thất bại !');
        this.loading = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.importMaterialService.url+"/import-material", error);
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
          donVi: item.unit,
          donGia:item.total
        };
      });
      this.materialList = transformedMaterialList;
      if (this.materialList.length < 11) {
        this.pagingMaterial.total += this.materialList.length;
      } else {
        this.pagingMaterial.total = this.materialList.length;
      }
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialService.urlWarehouse+"/material/"+paging, error);
      }
      )
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
      chietKhau: 0
    }
  }

  toggleCancel() {
    this.isAdd = false;
    if (this.records.length > 0) {
      this.records.pop();
    }
  }

  deleteRecord(index: number) {
    this.isAdd = true;
    this.records.splice(index, 1);
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
}

