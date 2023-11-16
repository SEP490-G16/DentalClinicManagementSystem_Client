import { Component, OnInit } from '@angular/core';
import { MaterialService } from "../../../service/MaterialService/material.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {

  groupedItems: any[] = [
    {
      code: 'M-002',
      name: 'Bông',
      totalQuantity: 150,
      unitPrice: 1000000,
      unit: 'Túi',
      status: 'Đã hết',
      expanded: false,
      details: [
        {
          code: 'M-002',
          name: 'Bông',
          totalQuantity: 150,
          unitPrice: 1000000,
          unit: 'Túi',
          status: 'Đã hết',
          expanded: false,
        },
        {
          code: 'M-002',
          name: 'Bông',
          totalQuantity: 150,
          unitPrice: 1000000,
          unit: 'Túi',
          wranty:'2023-11-02',
          status: 'Đã hết',
          expanded: false,
        }
      ]
    },
    // ...các mục khác
  ];

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  materialList: any = [];
  material: any;
  loading: boolean = false;
  enableNextPageButton: boolean = false;
  constructor(private materialService: MaterialService,
    private toastr: ToastrService) { }

  pagingMaterial = {
    paging: 1,
    total: 0
  };

  ngOnInit(): void {
    this.getMaterials(this.pagingMaterial.paging);
    //this.dataTable();
  }
  getMaterials(paging: number) {
    this.loading = true;
    this.materialService.getMaterials(paging).subscribe(data => {
      this.materialList = data.data;
      console.log(this.materialList.length)
      //alert(this.materialList.length)
      // if (paging > 1 && this.materialList.length > 10) {
      //   const dataNextPage = [this.materialList[10]];
      //   this.materialList = dataNextPage.concat(data.data);
      // } else {
      //   this.materialList = data.data;
      // }
      // this.enableNextPageButton = this.materialList.length > 10;
      this.loading = false;
       if (this.materialList) {
        if (this.materialList.length >= 8) {
          for (let i = 0; i < 10; i++) {
            const currentNumber = this.materialList[i];
            if (!this.uniqueList.includes(currentNumber.material_id)) {
              this.uniqueList.push(currentNumber.material_id);
              let newExpiryObject = {
                quantity: currentNumber.quantity_import,
                expiryDate: currentNumber.warranty,
                expanded: false,
              };
              //this.wareHouseMaterial = {
              this.wareHouseMaterial.materialId = currentNumber.material_id,
                this.wareHouseMaterial.materialName = currentNumber.material_name,
                this.wareHouseMaterial.quantity = currentNumber.quantity_import,
                this.wareHouseMaterial.unitPrice = currentNumber.price,
                this.wareHouseMaterial.unit = currentNumber.unit,
                //this.wareHouseMaterial.expiry: [] as ExpiryObject[]
                //}
                this.wareHouseMaterial.expiry.push(newExpiryObject);
              newExpiryObject = {
                quantity: 0,
                expiryDate: '',
                expanded: false,
              };
              this.results.push(this.wareHouseMaterial);
              this.wareHouseMaterial = {
                materialId: '',
                materialName: '',
                quantity: 0,
                unitPrice: 0,
                unit: '',
                expiry: [] as ExpiryObject[],
                expanded: false,
              }
            } else {
              this.results.forEach((e: any) => {
                if (e.materialId == currentNumber.material_id) {
                  e.quantity += currentNumber.quantity_import;
                  let newExpiryObject = {
                    quantity: currentNumber.quantity_import,
                    expiryDate: currentNumber.warranty,
                    expanded: false,
                  };
                  e.expiry.push(newExpiryObject);
                  newExpiryObject = {
                    quantity: 0,
                    expiryDate: '',
                    expanded: false,
                  };
                }
              })
            }
          }
        }
      }
    })
  }
  pageChanged(paging: number) {
    this.pagingMaterial.paging = paging;
    console.log("paging:", this.pagingMaterial.paging);
    this.getMaterials(this.pagingMaterial.paging);
  }
  deleteMaterial(id: string) {
    const isConfirmed = window.confirm('Bạn có chắc muốn xoá vật liệu này không ?');
    if (isConfirmed) {
      this.loading = true;
      this.materialService.deleteMaterial(id).subscribe(data => {
        this.toastr.success('Xoá vật liệu thành công !');
        const index = this.materialList.findIndex((material: any) => material.material_id === id);
        if (index !== -1) {
          this.materialList.splice(index, 1);
        }
        this.loading = false;
      },
        error => {
          this.toastr.error('Xoá vật liệu thất bại !');
        }
      )
    }
  }
  openEditMaterial(material: any) {
    this.material = material;
  }
  //Đang test nên chưa chuyển đối tượng mới tạo lên
  wareHouseMaterial = {
    materialId: '',
    materialName: '',
    quantity: 0,
    unitPrice: 0,
    unit: '',
    expiry: [] as ExpiryObject[], 
    expanded: false
  }

  existMaterial: string = '';
  count: number = 0;
  dem: number = 0;
  uniqueList: string[] = [];
  results: any[] = [];
  // dataTable(): any[] {
  //  let results = [];
  //   if (this.materialList) {
  //     if (this.materialList.length >= 8) {
  //       for (let i = 0; i < 10; i++) {
  //         //const currentNumber = this.materialList[i];
  //         // if (!this.uniqueList.includes(currentNumber.material_id)) {
  //         //   this.uniqueList.push(currentNumber.material_id);
  //         //   let newExpiryObject = {
  //         //     quantity: currentNumber.quantity_import,
  //         //     expiryDate: currentNumber.warranty, 
  //         //     expanded: false,
  //         //   };
  //         //   //this.wareHouseMaterial = {
  //         //     this.wareHouseMaterial.materialId = currentNumber.material_id,
  //         //     this.wareHouseMaterial.materialName= currentNumber.material_name,
  //         //     this.wareHouseMaterial.quantity= currentNumber.quantity_import,
  //         //     this.wareHouseMaterial.unitPrice= currentNumber.price,
  //         //     this.wareHouseMaterial.unit= currentNumber.unit,
  //         //     //this.wareHouseMaterial.expiry: [] as ExpiryObject[]
  //         //   //}
  //         //   this.wareHouseMaterial.expiry.push(newExpiryObject);
  //         //   newExpiryObject = {
  //         //     quantity: 0,
  //         //     expiryDate: '', 
  //         //     expanded: false,
  //         //   };
  //         //   results.push(this.wareHouseMaterial);
  //         //   this.wareHouseMaterial = {
  //         //     materialId: '',
  //         //     materialName: '',
  //         //     quantity: 0,
  //         //     unitPrice: 0,
  //         //     unit: '',
  //         //     expiry: [] as ExpiryObject[], 
  //         //     expanded: false,
  //         //   }
  //         // } else {
  //         //   results.forEach((e: any) => {
  //         //     if (e.materialId == currentNumber.material_id) {
  //         //       e.quantity += currentNumber.quantity_import;
  //         //       let newExpiryObject = {
  //         //         quantity: currentNumber.quantity_import,
  //         //         expiryDate: currentNumber.warranty, 
  //         //         expanded: false,
  //         //       };
  //         //       e.expiry.push(newExpiryObject);
  //         //       newExpiryObject = {
  //         //         quantity: 0,
  //         //         expiryDate: '', 
  //         //         expanded: false,
  //         //       };
  //         //     }
  //         //   })
  //         // }
  //         results.push(this.materialList[i]);
  //       }
  //       alert(this.materialList.length);
  //     } else {
  //       results = this.materialList;
  //     }
  //   }
  //   return results;
  // }
}

interface ExpiryObject {
  quantity: number;
  expiryDate: string;
  expanded: boolean;
}