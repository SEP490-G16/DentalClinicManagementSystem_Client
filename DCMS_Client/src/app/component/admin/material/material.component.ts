import { Component, OnInit } from '@angular/core';
import { MaterialService } from "../../../service/MaterialService/material.service";
import { ToastrService } from "ngx-toastr";
import { MaterialWarehouseService } from 'src/app/service/MaterialService/material-warehouse.service';
import {ResponseHandler} from "../../utils/libs/ResponseHandler";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {
  currentPage: number = 1;
  hasNextPage: boolean = false; // Biến để kiểm tra xem có trang sau hay không
  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  materialList: any = [];
  material: any;
  item: any;
  loading: boolean = false;
  constructor(private materialService: MaterialService,
    private matMaterialWarehouseService: MaterialWarehouseService,
    private toastr: ToastrService) { }

  pagingMaterial = {
    paging: 1,
    total: 0
  };

  ngOnInit(): void {
    this.loadPage(this.pagingMaterial.paging);
  }
  checkNextPage() {
    this.hasNextPage = this.materialList.length > 10;
  }
  totalMaterial: number = 1;
  loadPage(paging: number) {
    this.loading = true;
    this.currentPage = paging;
    this.materialService.getMaterials(paging).subscribe(data => {
      this.materialList = [];
      this.materialList = data.data;
      this.checkNextPage();
      if (this.materialList.length > 10) {
        this.materialList.pop();
      }
      this.loading = false;
       if (this.materialList) {
        if (this.materialList.length >= 1 ){
          for (let i = 0; i < this.materialList.length -1; i++) {
            const currentNumber = this.materialList[i];
            if (!this.uniqueList.includes(currentNumber.m_material_id)) {
              this.uniqueList.push(currentNumber.m_material_id);
              let newExpiryObject = {
                mw_material_warehouse_id: currentNumber.mw_material_warehouse_id,
                quantity: currentNumber.mw_quantity_import,
                expiryDate: currentNumber.mw_warranty,
                discount: currentNumber.mw_discount,
                expanded: false,
              };
                this.wareHouseMaterial.materialId = currentNumber.m_material_id,
                this.wareHouseMaterial.materialName = currentNumber.m_material_name,
                this.wareHouseMaterial.quantity = currentNumber.mw_quantity_import,
                this.wareHouseMaterial.unitPrice = currentNumber.mw_price,
                this.wareHouseMaterial.unit = currentNumber.m_unit,
                this.wareHouseMaterial.expiryDate = currentNumber.mw_warranty,
                this.wareHouseMaterial.expiry.push(newExpiryObject);
              newExpiryObject = {
                mw_material_warehouse_id: '',
                quantity: 0,
                expiryDate: '',
                discount:0,
                expanded: false,
              };
              this.results.push(this.wareHouseMaterial);
              this.wareHouseMaterial = {
                materialId: '',
                materialName: '',
                quantity: 0,
                unitPrice: 0,
                unit: '',
                expiryDate: '',
                expiry: [] as ExpiryObject[],
                expanded: false,
              }
            } else {
              this.results.forEach((e: any) => {
                if (e.materialId == currentNumber.m_material_id) {
                  e.quantity += currentNumber.mw_quantity_import;
                  let newExpiryObject = {
                    mw_material_warehouse_id: currentNumber.mw_material_warehouse_id,
                    quantity: currentNumber.mw_quantity_import,
                    expiryDate: currentNumber.mw_warranty,
                    discount: currentNumber.mw_discount,
                    expanded: false,
                  };
                  e.expiry.push(newExpiryObject);
                  newExpiryObject = {
                    mw_material_warehouse_id: currentNumber.mw_material_warehouse_id,
                    quantity: 0,
                    expiryDate: '',
                    discount:0,
                    expanded: false,
                  };
                }
              })
            }
          }
        } else {
          this.totalMaterial = this.materialList.length;
        }
      }
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.materialService.urlWarehouse+"/material-warehouse/remaining/"+paging, error);
      }
      )
  }
  pageChanged(event: number) {
    if (event >= 1) {
      this.loadPage(event);
    }
  }
  deleteMaterial(id: string) {
    const isConfirmed = window.confirm('Bạn có chắc muốn xoá vật liệu này không ?');
    if (isConfirmed) {
      this.loading = true;
      this.matMaterialWarehouseService.deleteMaterialImportMaterial(id).subscribe(data => {
        this.toastr.success('Xoá vật liệu thành công !');
        const index = this.materialList.findIndex((material: any) => material.material_id === id);
        if (index !== -1) {
          this.materialList.splice(index, 1);
        }
        this.loading = false;
      },
        error => {
          //this.toastr.error('Xoá vật liệu thất bại !');
          ResponseHandler.HANDLE_HTTP_STATUS(this.matMaterialWarehouseService.url+"/material-warehouse/material_warehouse_id/"+id, error);
        }
      )
    }
  }
  openEditMaterial(id: any, detail:any) {
    this.material = detail;
    this.item = id;
  }

  //Đang test nên chưa chuyển đối tượng mới tạo lên
  wareHouseMaterial = {
    materialId: '',
    materialName: '',
    quantity: 0,
    unitPrice: 0,
    unit: '',
    expiryDate: '',
    expiry: [] as ExpiryObject[],
    expanded: false
  }

  existMaterial: string = '';
  count: number = 0;
  dem: number = 0;
  uniqueList: string[] = [];
  results: any[] = [];
}

interface ExpiryObject {
  mw_material_warehouse_id: string;
  quantity: number;
  expiryDate: string;
  discount: 0,
  expanded: boolean;
}
