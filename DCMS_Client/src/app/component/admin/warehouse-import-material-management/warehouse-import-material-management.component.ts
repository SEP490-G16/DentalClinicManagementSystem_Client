import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ImportMaterialService } from "../../../service/MaterialService/import-material.service";
import { ToastrService } from "ngx-toastr";
import { MaterialWarehouseService } from "../../../service/MaterialService/material-warehouse.service";
import { MaterialService } from "../../../service/MaterialService/material.service";
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-warehouse-import-material-management',
  templateUrl: './warehouse-import-material-management.component.html',
  styleUrls: ['./warehouse-import-material-management.component.css']
})
export class WarehouseImportMaterialManagementComponent implements OnInit {
  model!: NgbDateStruct;
  currentPage: number = 1;
  recordsPerPage: number = 10;
  hasNextPage: boolean = false; // Biến để kiểm tra xem có trang sau hay không

  constructor(private importMaterialService: ImportMaterialService,
    private materialWarehouseService: MaterialWarehouseService,
    private toastr: ToastrService,
    private materialService: MaterialService) { }
  importBills: any[] = [];
  pagingBill = {
    paging: 1,
    total: 0
  };
  startDate: string = '';
  endDate: string = '';
  displayWarehouse: any[] = [];
  total: number = 0;
  materbyId = {
    Id: '',
    CreateDate: '',
    Note: '',
    TotalAmount: 0,
    CreateBy: ''
  }
  importBillId: any;
  importBillObject: any;
  materialListByImportMaterialId: any[] = [];
  materialList: any[] = [];
  totalAmount: number = 0;
  loading: boolean = false;
  ngOnInit(): void {
    this.loadPage(this.pagingBill.paging);
    this.getMaterials(this.pagingBill.paging);
  }
  checkNextPage() {
    this.hasNextPage = this.importBills.length > 10;
  }
  loadPage(page: number) {
    console.log("page", page)
    this.loading = true;
    this.currentPage = page;
    if (this.startDate != '' && this.endDate != '') {
      this.importMaterialService.getImportMaterialsFromDateToDate(this.startDate, this.endDate,this.currentPage).subscribe(data=>{
        this.importBills = [];
        this.importBills = data.data;
        this.checkNextPage();
        this.loading = false;
        if (this.importBills.length > 10) {
          this.importBills.pop();
        }
      })
    } else {
      this.importMaterialService.getImportMaterials(this.currentPage).subscribe(data => {
        this.importBills = [];
        this.importBills = data.data;
        this.checkNextPage();
        this.loading = false;
        if (this.importBills.length > 10) {
          this.importBills.pop();
        }
        this.displayWarehouse = [];
        this.importBills.forEach((p: any) => {
          // let total = 0;
          // this.materialWarehouseService.getMaterialsByImportMaterialBill(p.id).subscribe(data => {

          //   this.materialList = data.data;
          //   if (this.materialList.length != 0) {
          //     this.materialList.forEach((m: any) => {
          //       total = total + (m.quantity_import * m.price * (1 - m.discount));
          //     })
          //   } else {
          //     total = 0;
          //   }
            this.materbyId.Id = p.id;
            this.materbyId.CreateDate = p.created_date;
            this.materbyId.CreateBy = p.creator;
            this.materbyId.Note = p.description;
            this.materbyId.TotalAmount = p.total;
            this.displayWarehouse.push(this.materbyId);
            //total = 0;
            this.materbyId = {
              Id: '',
              CreateDate: '',
              Note: '',
              TotalAmount: 0,
              CreateBy: ''
            }
          //})
        })
      })
    }
  }
  getMaterials(paging: number) {
    this.materialService.getMaterials(paging).subscribe(data => {
      this.materialList = data.data;
      this.materialList.forEach((p: any) => {
        p.totalAmount += p.quantity_import * p.price * (1 - p.discount);

      });
    })
  }
  calculateTotalAmountForBill(importBill: any) {
    let total = 0;
    // Tính tổng tiền dựa trên các sản phẩm trong phiếu nhập (hoặc cách tính tổng tiền của bạn)
    console.log(importBill.products);
    importBill.products.forEach((product: any) => {
      total += product.price * product.quantity_import;
      console.log(total);
    });
    return total;
  }
  openEditImportMaterial(id: any, importMaterialBill: any) {
    this.importBillId = id;
    this.importBillObject = importMaterialBill;
  }
  pageChanged(event: number) {
    if (event >= 1 && event <= 11) {
      this.loadPage(event);
    }
  }
  getMaterialsImportMaterialBills(importMaterialBillId: any) {
    this.materialWarehouseService.getMaterialsByImportMaterialBill(importMaterialBillId).subscribe(data => {
      this.materialListByImportMaterialId = data.data;
      this.materialListByImportMaterialId.forEach((material: any) => {
        this.materialWarehouseService.deleteMaterialImportMaterial(material.material_warehouse_id).subscribe(data => {
          this.toastr.success("Xoá thành công!");
        },
          error => {
            this.toastr.error("Xoá thất bại!");
          }
        )
      }
      )
      console.log(this.materialListByImportMaterialId)
    })
  }
  deleteImportMaterial(id: any) {
    const cf = confirm("Bạn có muốn xóa phiếu nhập này không?");
    if (cf) {
      this.loading = true;
      this.getMaterialsImportMaterialBills(id);
      this.importMaterialService.deleteImportBill(id)
        .subscribe((res) => {
          this.toastr.success('Xóa phiếu nhập thành công!');
          window.location.reload();
        },
          (err) => {
            this.loading = false;
            this.toastr.error('Xóa phiếu nhập thất bại!');
          }
        )
    }
  }
  // changeDateFrom(value: any) {
  //   this.startDate = value;
  // }
  // changeDateTo(value: any) {
  //   this.endDate = value;
  // }
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
}
