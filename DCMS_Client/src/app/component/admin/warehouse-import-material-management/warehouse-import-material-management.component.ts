import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ImportMaterialService } from "../../../service/MaterialService/import-material.service";
import { ToastrService } from "ngx-toastr";
import { MaterialWarehouseService } from "../../../service/MaterialService/material-warehouse.service";
import { MaterialService } from "../../../service/MaterialService/material.service";
import * as moment from 'moment-timezone';
import { ResponseHandler } from "../../utils/libs/ResponseHandler";
import { CognitoService } from "../../../service/cognito.service";
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import { DatePipe } from "@angular/common";
@Component({
  selector: 'app-warehouse-import-material-management',
  templateUrl: './warehouse-import-material-management.component.html',
  styleUrls: ['./warehouse-import-material-management.component.css']
})
export class WarehouseImportMaterialManagementComponent implements OnInit {
  model!: NgbDateStruct;
  currentPage: number = 1;
  hasNextPage: boolean = false; // Biến để kiểm tra xem có trang sau hay không

  hoveredDate: NgbDate | null = null;
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
  staff = {
    staffId: '',
    staffName: '',
    staffUserName: '',
    dob: '',
    address: '',
    note: '',
    email: '',
    phoneNumber: '',
    roleId: '',
    roleName: '',
    gender: '',
    image: '',
    locale: '',
    zoneInfor: '',
  }
  listStaffDisplay: any[] = [];

  listStaff: any[] = [];

  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  constructor(private importMaterialService: ImportMaterialService,
    private materialWarehouseService: MaterialWarehouseService,
    private toastr: ToastrService,
    private cognitoService: CognitoService,
    private modalService: NgbModal, private datePipe: DatePipe,
    private materialService: MaterialService,
    private calendar: NgbCalendar, public formatter: NgbDateParserFormatter
  ) {

    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }
  ngOnInit(): void {

    this.loadPage(this.pagingBill.paging);
    this.getMaterials(this.pagingBill.paging);
    this.getListStaff();
  }

  onDateSelection(date: NgbDate) {
		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
			this.toDate = date;
		} else {
			this.toDate = null;
			this.fromDate = date;
		}
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate) ||
			(this.toDate && date.equals(this.toDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}

  checkNextPage() {
    this.hasNextPage = this.importBills.length > 10;
  }
  loadPage(page: number) {
    this.loading = true;
    this.currentPage = page;
    if (this.startDate != '' && this.endDate != '') {
      const startTime = this.dateToTimestamp(this.startDate + '00:00:00');
      const endTime = this.dateToTimestamp(this.endDate + '23:59:59');
      this.importMaterialService.getImportMaterialsFromDateToDate(startTime, endTime, this.currentPage).subscribe(data => {
        this.importBills = [];
        this.importBills = data.data;
        this.checkNextPage();
        this.loading = false;
        if (this.importBills.length > 10) {
          this.importBills.pop();
        }
        this.displayWarehouse = [];
        console.log("Checkdate", this.importBills);
        this.importBills.forEach((p: any) => {
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
        })
      },
        error => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.importMaterialService.url + "/import-material/date/" + this.startDate + "/" + this.endDate + "/" + this.currentPage, error);
        }
      )
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
        console.log("Checkdate", this.importBills);
        this.importBills.forEach((p: any) => {
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
        })
      },
        error => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.importMaterialService.url + "/import-material/page/" + this.currentPage, error);
        }
      )
    }
  }
  getMaterials(paging: number) {
    this.materialService.getMaterials(paging).subscribe(data => {
      this.materialList = data.data;
      this.materialList.forEach((p: any) => {
        p.totalAmount += p.quantity_import * p.price * (1 - p.discount);

      });
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialService.urlWarehouse + "/material-warehouse/remaining/" + paging, error);
      }
    )
  }
  calculateTotalAmountForBill(importBill: any) {
    let total = 0;
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
  // pageChanged(event: number) {
  //   if (event >= 1) {
  //     this.loadPage(event);
  //   }
  // }

  clicked: boolean = false;
  lastClickTime: number = 0
  pageChanged(event: number) {
    const currentTime = new Date().getTime();
    if (!this.clicked || (currentTime - this.lastClickTime >= 600)) {
      this.clicked = true;
      this.lastClickTime = currentTime;

      if (event >= 1) {
        this.loadPage(event);
      }
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
            //this.toastr.error("Xoá thất bại!");
            ResponseHandler.HANDLE_HTTP_STATUS(this.materialWarehouseService.url + "/material-warehouse/material_warehouse_id/" + material.material_warehouse_id, error);
          }
        )
      }
      )
      console.log(this.materialListByImportMaterialId)
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialWarehouseService.url + "/material-warehouse/" + importMaterialBillId, error);
      }
    )
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteImportMaterial(id: any, createDate: any) {
    // const cf = confirm("Bạn có muốn xóa phiếu nhập này không?");
    // if (cf) {
    //   this.loading = true;
    //   this.getMaterialsImportMaterialBills(id);
    //   this.importMaterialService.deleteImportBill(id)
    //     .subscribe((res) => {
    //       this.toastr.success('Xóa phiếu nhập thành công!');
    //       this.loadPage(this.currentPage);
    //     },
    //       (error) => {
    //         this.loading = false;
    //         //this.toastr.error('Xóa phiếu nhập thất bại!');
    //         ResponseHandler.HANDLE_HTTP_STATUS(this.importMaterialService.url+"/import-material/"+id, error);
    //       }
    //     )
    // }
    const formattedDate = this.datePipe.transform(createDate, 'dd-MM-yyyy');
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa phiếu nhập ngày ${formattedDate} không?`).then((result) => {
      if (result) {
        this.getMaterialsImportMaterialBills(id);
        this.importMaterialService.deleteImportBill(id)
          .subscribe((res) => {
            this.toastr.success('Xóa phiếu nhập thành công!');
            this.loadPage(this.currentPage);
          },
            (error) => {
              //this.toastr.error('Xóa phiếu nhập thất bại!');
              ResponseHandler.HANDLE_HTTP_STATUS(this.importMaterialService.url + "/import-material/" + id, error);
            }
          )
      }
    });
  }
  dateToTimestamp(dateStr: string): any {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  getListStaff() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.listStaff = res.message;
        console.log("ListStaff:", this.listStaff);
        this.listStaff.forEach((staff: any) => {
          this.staff = {
            staffId: '',
            staffName: '',
            staffUserName: '',
            dob: '',
            address: '',
            note: '',
            email: '',
            phoneNumber: '',
            roleId: '',
            roleName: '',
            gender: '',
            image: '',
            locale: '',
            zoneInfor: ''
          }
          this.staff.staffUserName = staff.Username;
          staff.Attributes.forEach((attr: any) => {
            if (attr.Name == 'sub') {
              this.staff.staffId = attr.Value;
            }
            if (attr.Name == 'address') {
              this.staff.address = attr.Value;
            }
            if (attr.Name == 'email') {
              this.staff.email = attr.Value;
            }
            if (attr.Name == 'phone_number') {
              this.staff.phoneNumber = this.normalizePhoneNumber(attr.Value);
            }
            if (attr.Name == 'custom:role') {
              this.staff.roleId = attr.Value;
              this.staff.roleName = this.getStaffName(this.staff.roleId);
            }
            if (attr.Name == 'gender') {
              this.staff.gender = attr.Value;
              if (this.staff.gender == 'male') {
                this.staff.gender = 'Nam'
              }
              if (this.staff.gender == 'female') {
                this.staff.gender = 'Nữ'
              }
            }
            if (attr.Name == 'custom:DOB') {
              this.staff.dob = this.timestampToDate(attr.Value);
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'custom:image') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'zoneinfo') {
              this.staff.zoneInfor = attr.Value;
            }
          })
          this.listStaffDisplay.push(this.staff);
        })

      },
      )
  }

  getStaffName(id: any): any {
    if (id == "1") {
      return "Admin";
    } else if (id == "2") {
      return "Bác sĩ"
    } else if (id == "3") {
      return "Lễ tân";
    } else if (id == "4") {
      return "Y tá";
    } else if (id == "5") {
      return "Y tá trưởng";
    }
  }
  timestampToDate(timestamp: number): string {
    try {
      const date = moment.unix(timestamp);
      const dateStr = date.format('YYYY-MM-DD');
      return dateStr;
    } catch (err) {
      return '';
    }
  }
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
  }
  staffName: string = '';
  filteredBills: any[] = [];
  filterByStaff() {
    if (this.staffName) {
      this.filteredBills = this.importBills.filter((s: any) => s.creator.includes(this.staffName));
      this.displayWarehouse = [];
      this.filteredBills.forEach((s: any) => {
        this.materbyId.Id = s.id;
        this.materbyId.CreateDate = s.created_date;
        this.materbyId.CreateBy = s.creator;
        this.materbyId.Note = s.description;
        this.materbyId.TotalAmount = s.total;
        this.displayWarehouse.push(this.materbyId);
        //total = 0;
        this.materbyId = {
          Id: '',
          CreateDate: '',
          Note: '',
          TotalAmount: 0,
          CreateBy: ''
        }
      })
      console.log(this.filteredBills)
    }
    else {
      this.filteredBills = this.importBills;
      this.displayWarehouse = [];
      this.filteredBills.forEach((s: any) => {
        this.materbyId.Id = s.id;
        this.materbyId.CreateDate = s.created_date;
        this.materbyId.CreateBy = s.creator;
        this.materbyId.Note = s.description;
        this.materbyId.TotalAmount = s.total;
        this.displayWarehouse.push(this.materbyId);
        //total = 0;
        this.materbyId = {
          Id: '',
          CreateDate: '',
          Note: '',
          TotalAmount: 0,
          CreateBy: ''
        }
      })
    }
  }
}
