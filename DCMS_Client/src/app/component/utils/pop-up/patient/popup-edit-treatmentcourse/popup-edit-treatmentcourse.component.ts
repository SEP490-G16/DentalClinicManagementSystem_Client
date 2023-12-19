import { Component, Input, OnInit, SimpleChanges, AfterViewInit  } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { error } from '@angular/compiler-cli/src/transformers/util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PopupGenMedicalPdfComponent } from '../popup-add-examination/popup-gen-medical-pdf/popup-gen-medical-pdf.component';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/service/MaterialService/material.service';
import { LaboService } from 'src/app/service/LaboService/Labo.service';
import { MedicalSupplyService } from 'src/app/service/MedicalSupplyService/medical-supply.service';
import * as moment from "moment-timezone";

@Component({
  selector: 'app-popup-edit-treatmentcourse',
  templateUrl: './popup-edit-treatmentcourse.component.html',
  styleUrls: ['./popup-edit-treatmentcourse.component.css']
})
export class PopupEditTreatmentcourseComponent implements OnInit {
  @Input() TreatmentCourse: any;

  Post_Procedure_Material_Usage: any[] = []
  Patient_Id: any;
  showDropDown:boolean = false;
  Labos: any[] = [];
  //selectMedicine: string = '0';
  constructor(
    private treatmentCourseService:TreatmentCourseService,
    private toastr: ToastrService,
    private materialUsageService: MaterialUsageService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private modelService:NgbModal,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private materialService: MaterialService,
    private LaboService: LaboService,
    private medicalSupplyService: MedicalSupplyService
  ) {
    this.Edit_TreatmentCourse = {
      treatment_course_id: "",
      patient_id: "",
      description: "",
      chief_complaint: "",
      created_date: "",
      differential_diagnosis: "",
      provisional_diagnosis: "",
      name: "",
    }
  }
  valdateSpecimens:any = {};
  isSubmittedSpecimens: boolean = false;
  validateMedicine:any = {}
  Edit_TreatmentCourse: any;
  ngOnInit(): void {
    this.Patient_Id = this.route.snapshot.params['id'];
    this.getMedicalProcedureList();
    this.getMaterialList();
    this.getLabo();
    this.getPatient();
  }

  groupProcedureO = {
    groupId:'',
    groupName: '',
    checked: true,
    procedure: [] as ProcedureOb[],
    isExpand: false,
  }
  list: any[] = [];
  ProcedureGroupList:any[] = []
  UniqueList: any[] =[]

  getLabo() {
    const labo = localStorage.getItem('ListLabo');
    if (labo != null) {
      this.Labos = JSON.parse(labo);
    } else {
      this.LaboService.getLabos()
        .subscribe((res) => {
          this.Labos = res.data;
          localStorage.setItem("ListLabo", JSON.stringify(this.Labos))
        })
    }
  }

  getMedicalProcedureList() {
    this.list.splice(0, this.list.length)
    this.medicalProcedureGroupService.getMedicalProcedureGroupListandDetail().subscribe(data => {
      this.ProcedureGroupList = data.data;
      this.ProcedureGroupList.forEach((item: any) => {
        const currentO = item;
        if (!this.UniqueList.includes(currentO.mg_id)) {
          this.UniqueList.push(currentO.mg_id);
          let proObject = {
            procedureId: currentO.mp_id,
            procedureName: currentO.mp_name,
            initPrice: currentO.mp_price,
            price: currentO.mp_price,
            quantity: '1',
            laboId: '0',
            checked: false,
            isExpand: false,
          };
          this.groupProcedureO.groupId = currentO.mg_id;
          this.groupProcedureO.groupName = currentO.mg_name;
          this.groupProcedureO.checked = false;
          this.groupProcedureO.procedure.push(proObject);
          this.list.push(this.groupProcedureO);
          this.groupProcedureO = {
            groupId: '',
            groupName: '',
            checked: true,
            procedure: [],
            isExpand: false
          }
          proObject = {
            procedureId: '',
            procedureName: '',
            initPrice: '',
            price: '',
            quantity: '1',
            laboId: '0',
            checked: true,
            isExpand: false
          };
        } else {
          this.list.forEach((item: any) => {
            if (item.groupId == currentO.mg_id) {
              let proObject = {
                procedureId: currentO.mp_id,
                procedureName: currentO.mp_name,
                initPrice: currentO.mp_price,
                price: currentO.mp_price,
                laboId: '0',
                checked: false,
                isExpand: false,
              };
              item.procedure.push(proObject);
            }
          })
        }
      })
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      })
  }

  chechChange: boolean = false;
  ngOnChanges(changes: SimpleChanges): void {
    this.recordsMedicine.splice(0, this.recordsMedicine.length);
    this.listMaterialUsage.splice(0, this.listMaterialUsage.length);
    //this.getMedicalProcedureList();
    if (changes['TreatmentCourse'].currentValue != undefined ) {
      this.Edit_TreatmentCourse = {
        treatment_course_id: this.TreatmentCourse.treatment_course_id,
        patient_id: this.TreatmentCourse.patient_id,
        description: this.TreatmentCourse.description,
        chief_complaint: this.TreatmentCourse.chief_complaint,
        created_date: this.TreatmentCourse.created_date,
        differential_diagnosis: this.TreatmentCourse.differential_diagnosis,
        provisional_diagnosis: this.TreatmentCourse.provisional_diagnosis,
        name: this.TreatmentCourse.name,
        prescription: JSON.parse(this.TreatmentCourse.prescription)
      }
    }
    this.getListMaterialusage();
    if (this.Edit_TreatmentCourse.prescription.length > 0) {
      this.showPrescriptionContent = true;
      this.Edit_TreatmentCourse.prescription.forEach((item:any) => {
      this.selectMedicine = item.id;
      this.recordsMedicine.push({
        id: this.selectMedicine,
        ten: item.ten,
        soLuong: item.soLuong,
        donvi: item.donvi,
        lieuDung: item.lieuDung,
        ghiChu:item.ghiChu
      })
    })
    }
  }

  listCheckChange: any[] = [];
  listCheckChangeMaterial: any[] = [];
  getListMaterialusage() {
    this.materialUsageService.getMaterialUsage_By_TreatmentCourse(this.Edit_TreatmentCourse.treatment_course_id).subscribe((data) => {
      this.listData = data.data;
      this.listData.forEach((item: any) => {
        if (item.medical_procedure_id != null) {
          this.list.forEach((ite: any) => {
            ite.procedure.forEach((pro: any) => {
              if (pro.procedureId == item.medical_procedure_id) {
                ite.checked = true;
                pro.checked = true;
                pro.price = item.price;
                pro.quantity = item.quantity;
                pro.laboId = item.description.split(" ")[0];
                let materialUsage = {
                  material_usage_id: item.material_usage_id,
                  medical_procedure_id: item.medical_procedure_id,
                  treatment_course_id: item.treatment_course_id,
                  quantity: item.quantity,
                  price: item.price,
                  total_paid: item.total_paid,
                  description: item.description
                }
                this.listCheckChange.push(materialUsage);
                this.Post_Procedure_Material_Usage.push(materialUsage);
                materialUsage = {
                  material_usage_id: '',
                  medical_procedure_id: '',
                  treatment_course_id: '',
                  quantity: '',
                  price: '',
                  total_paid: '',
                  description: ''
                }
              }
            })
          })
        }

        if (item.material_warehouse_id != null) {
          this.unique.push(item.material_warehouse_id);
          this.results.forEach((it: any) => {
            if (it.id == item.material_warehouse_id) {
              this.listCheckChangeMaterial.push({
                material_usage_id: item.material_usage_id,
                material_warehouse_id: item.material_warehouse_id,
                treatment_course_id: item.treatment_course_id,
                quantity: item.quantity,
                price: '',
                total_paid: '',
                description: it.materialName,
              })
              this.listMaterialUsage.push({
                material_usage_id: item.material_usage_id,
                material_warehouse_id: item.material_warehouse_id,
                treatment_course_id: item.treatment_course_id,
                quantity: item.quantity,
                price: '',
                total_paid: '',
                description: it.materialName,
              })
            }
          })
        }
      })
    })
  }

  isExpand:boolean = false;
  toggleExpand(check:any){
    this.list.forEach((item:any) => {
       if (item.groupId == check.groupId) {
        item.isExpand = !check.isExpand;
       }
    })
  }

  checkListImport: string[] = [];
  Post_Procedure_Material_Usage_New: any[] = []
  checkProcedureUse(it:any) {
    this.list.forEach((item:any) => {
      item.procedure.forEach((pro:any) => {
        if (pro.procedureId == it.procedureId) {
          pro.checked = !it.checked;
          this.Post_Procedure_Material_Usage.forEach((item:any) => {
            if (item.medical_procedure_id == it.procedureId) {
              item.price = it.price;
            }
          })
        }
        if (pro.checked == true && !this.checkListImport.includes(it.procedureId)) {
          this.checkListImport.push(it.procedureId);
          let materialUsage = {
            medical_procedure_id: it.procedureId,
            treatment_course_id: '',
            quantity: it.quantity,
            price: it.price,
            total_paid: '',
            description: it.laboId + " " + it.initPrice
          }
          this.Post_Procedure_Material_Usage_New.push(materialUsage);
          materialUsage = {
            medical_procedure_id: '',
            treatment_course_id: '',
            quantity: '',
            price: '',
            total_paid: '',
            description: ''
          }
        }
      })
    })
  }

  getSelectedValue(it: any) {
    this.list.forEach((item: any) => {
      if (item.groupId == it.groupId) {
        item.checked = !it.checked;
      }
    })
  }

  listChange: string[] = [];
  changePrice(gro:any, event:any) {
    this.Post_Procedure_Material_Usage.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        if (!this.listChange.includes(item.material_usage_id)) {
          this.listChange.push(item.material_usage_id);
        }
        item.price = event.target.value;
      }
    })

    this.Post_Procedure_Material_Usage_New.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.price = event.target.value;
      }
    })
  }

  changeQuantity(gro:any, event:any) {
    this.Post_Procedure_Material_Usage.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        if (!this.listChange.includes(item.material_usage_id)) {
          this.listChange.push(item.material_usage_id);
        }
        item.quantity = event.target.value;
      }
    })

    this.Post_Procedure_Material_Usage_New.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        if (!this.listChange.includes(item.material_usage_id)) {
          this.listChange.push(item.material_usage_id);
        }
        item.quantity = event.target.value;
      }
    })
  }

  changeLabo(gro:any) {
    this.Post_Procedure_Material_Usage.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.description = `${gro.laboId} ${gro.initPrice}`;
      }
    })

    this.Post_Procedure_Material_Usage_New.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.description = `${gro.laboId} ${gro.initPrice}`;
      }
    })
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }

  listData: any[] = [];
  listDisplay: any[] = [];
  listUpdateMaterial: any[] = [];

  editTreatmentCourse() {
    this.Edit_TreatmentCourse.prescription = this.recordsMedicine;
    this.Edit_TreatmentCourse.prescription = JSON.stringify(this.Edit_TreatmentCourse.prescription);
    this.treatmentCourseService.putTreatmentCourse(this.Edit_TreatmentCourse.treatment_course_id, this.Edit_TreatmentCourse)
    .subscribe((res) => {
      this.toastr.success(res.message, "Sửa Lịch trình điều trị");
      window.location.reload();
    },
    (error) => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl+"/treatment-course/"+this.TreatmentCourse.treatment_course_id, error);
    }
    )
    // this.list.forEach((item: any, itemIndex: number) => {
    //   item.procedure.forEach((it: any, procIndex: number) => {
    //     const key = `soLuong_${itemIndex}_${procIndex}`;
    //     let soLuong = it.quantity
    //     if (!this.checkNumber(soLuong)) {
    //       this.valdateSpecimens[key] = "Nhập số lượng > 0!";
    //       this.isSubmittedSpecimens = true;
    //     }
    //     else {
    //       if (this.valdateSpecimens[key]) {
    //         delete this.valdateSpecimens[key];
    //       }
    //     }
    //
    //   })
    // })
    // if (Object.keys(this.valdateSpecimens).length > 0) {
      //   this.isSubmittedSpecimens = true;
      //   return;
      // }

      console.log("Post thu thuat: ", this.Post_Procedure_Material_Usage_New);
      console.log("Put thu thuat: ", this.Post_Procedure_Material_Usage);
      return;
    if (this.Post_Procedure_Material_Usage_New.length > 0) {
      this.Post_Procedure_Material_Usage_New.forEach((item: any) => {
        item.treatment_course_id = this.Edit_TreatmentCourse.treatment_course_id;
        this.materialUsageService.postProcedureMaterialUsage(item)
        .subscribe((res) => {
          this.toastr.success("Thêm Thủ thuật thành công");
          window.location.reload();
        }, (err) => {
          this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
        })
      })
    }
    console.log("đã vào");
    if (this.Post_Procedure_Material_Usage.length > 0) {
      this.Post_Procedure_Material_Usage.forEach((item: any) => {
        this.listChange.forEach((it: any) => {
          if (item.material_usage_id == it) {
            this.materialUsageService.putMaterialUsage(item.material_usage_id, item).subscribe((data) => {
                this.toastr.success("Sửa Thủ thuật thành công");
                window.location.reload();
            }, (error) => {
              this.toastr.error(error.message, "Sửa thủ thuật thất bại");
            }
            )
          }
        })
      })
    }

    // if (this.listInsertNewMaterial.length > 0) {
    //   this.listMaterialUsage.forEach((item: any) => {
    //     this.listInsertNewMaterial.forEach((it: any) => {
    //       if (it.material_warehouse_id == item.material_warehouse_id) {
    //         it.material_warehouse_id = item.material_warehouse_id;
    //         it.treatment_course_id = this.Edit_TreatmentCourse.treatment_course_id;
    //         it.examination_id = '';
    //         it.quantity = item.quantity;
    //         it.price = item.price;
    //         it.total_paid = '';
    //         it.description = item.materialName;
    //       }
    //     })
    //   })
    //
    //   this.materialUsageService.postMaterialUsage(this.listInsertNewMaterial)
    //     .subscribe((res) => {
    //       this.toastr.success("Thêm vật liệu thành công");
    //     }, (err) => {
    //       this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
    //     })
    // }

    console.log("đã đến đây");
    // if (this.listMaterialUsage.length > 0) {
    //   console.log("đã vô 1");
    //   this.listMaterialUsage.forEach((item: any) => {
    //     if (this.listInsertNewMaterial.length > 0) {
    //       this.listInsertNewMaterial.forEach((it: any) => {
    //         if (it.material_warehouse_id != item.material_warehouse_id) {
    //           this.listUpdateMaterial.push(item);
    //           return;
    //         }
    //       })
    //     } else {
    //       this.listUpdateMaterial = this.listMaterialUsage;
    //     }
    //   })
    //
    //   this.listUpdateMaterial.forEach((item: any) => {
    //     this.listCheckChangeMaterial.forEach((it: any) => {
    //       if (item.material_usage_id == it.material_usage_id) {
    //         if (it.quantity != item.quantity) {
    //           item.price = 1;
    //           this.materialUsageService.putMaterialUsage(item.material_usage_id, item)
    //             .subscribe((res) => {
    //               return;
    //             }, (err) => {
    //               this.toastr.error(err.error.message, "Chỉnh sửa Thủ thuật thất bại");
    //             })
    //         }
    //       }
    //     })
    //   })
    // }
  }

  selectMedicine: string = '0';
  showPrescriptionContent: boolean = false;
  recordsMedicine: any[] = [];
  listSample = [
    {
      "Id": "1",
      "Medical": [
        {
          "MedicalName": "Augmentin 1g",
          "Quantity": "1",
          "Unit": "Viên(Glaxo Smith)",
          "Dosage": "Ngày uống 1 viên sau ăn",
          "Note": ""
        },
        {
          "MedicalName": "Metronidazol 250mg",
          "Quantity": "1",
          "Unit": "Viên",
          "Dosage": "Ngày uống 4 viên chia 2 lần sau ăn",
          "Note": ""
        },
        {
          "MedicalName": "Medrol 16mg",
          "Quantity": "1",
          "Unit": "Viên",
          "Dosage": "Ngày uống 1 viên sau ăn",
          "Note": ""
        },
        {
          "MedicalName": "Efferalgan codein 500mg",
          "Quantity": "1",
          "Unit": "Viên",
          "Dosage": "Uống khi đau mỗi lần 1 viên sau ăn no.Nếu đau sau 6-8 tiếng sau uống 1 viên tiếp. Pha 1 viên vào 200 ml nước lọc",
          "Note": ""

        }
      ]
    },
    {
      "Id": "2",
      "Medical": [
        {
          "MedicalName": "Augmentin 1g",
          "Quantity": "1",
          "Unit": "Viên(Glaxo Smith)",
          "Dosage": "Ngày uống 1 viên sau ăn",
          "Note": ""
        },
        {
          "MedicalName": "Efferalgan codein 500mg",
          "Quantity": "1",
          "Unit": "Viên",
          "Dosage": "Uống khi đau mỗi lần 1 viên sau ăn no.Nếu đau sau 6-8 tiếng sau uống 1 viên tiếp. Pha 1 viên vào 200 ml nước lọc",
          "Note": ""

        }
      ]
    }
  ]
  onMedicineChange() {
    this.recordsMedicine.splice(0, this.recordsMedicine.length);
    this.showPrescriptionContent = this.selectMedicine !== '0';
    this.listSample.forEach((item: any) => {
      if (item.Id == this.selectMedicine) {
        item.Medical.forEach((it: any) => {
          this.recordsMedicine.push({
            id: item.Id,
            ten: it.MedicalName,
            soLuong: it.Quantity,
            donvi: it.Unit,
            lieuDung: it.Dosage,
            ghiChu: it.Note
          })
        })
      }
    })

  }
  isAddMedicine: boolean = true;
  toggleAddMedicine() {
    if (this.isAddMedicine) {
      this.recordsMedicine.push({
        id: this.selectMedicine,
        ten:'',
        soLuong:'',
        donvi: '',
        lieuDung:'',
        ghiChu:''
      })
    }
  }

  toggleUpdateMedicine() {
    this.isAddMedicine = !this.isAddMedicine;
  }

  deleteRecordMedicine(index: any) {
    //this.isAddMedicine = false;
    this.recordsMedicine.splice(index, 1);
  }
  modalOption: NgbModalOptions = {
    size: 'lg',
    centered: true
  }

  Patient: any;
  getPatient() {
    this.patientService.getPatientById(this.Patient_Id)
    .subscribe((res)=> {
        this.Patient = res;
    },
    (err) => {
      this.toastr.error(err.error.message, "Lỗi khi lấy thông tin bệnh nhân")
    }
    )
  }

  openGeneratePdfModal() {
    const modalRef = this.modelService.open(PopupGenMedicalPdfComponent, this.modalOption);
    modalRef.componentInstance.Disagnosis = this.Edit_TreatmentCourse.chuandoan;
    modalRef.componentInstance.Medical = this.recordsMedicine;
    modalRef.componentInstance.Patient = this.Patient;
  }

  showDropDown1:boolean=false;
  materialList: any = [];
  uniqueList: string[] = [];
  results: any[] = [];
  material_warehouse_id: any;
  wareHouseMaterial = {
    material_warehouse_id: '',
    materialId: '',
    materialName: '',
    quantity: 0,
    unitPrice: 0,
  }
  getMaterialList() {
    this.materialService.getMaterials(1).subscribe(data => {
      this.materialList = [];
      this.materialList = data.data;
      if (this.materialList) {
        if (this.materialList.length >= 1) {
          for (let i = 0; i < this.materialList.length - 1; i++) {
            const currentNumber = this.materialList[i];
            if (!this.uniqueList.includes(currentNumber.m_material_id)) {
              this.uniqueList.push(currentNumber.m_material_id);
              this.wareHouseMaterial.material_warehouse_id = currentNumber.mw_material_warehouse_id,
              this.wareHouseMaterial.materialId = currentNumber.m_material_id,
              this.wareHouseMaterial.materialName = currentNumber.m_material_name,
              this.wareHouseMaterial.quantity = currentNumber.mw_quantity_import,
              this.wareHouseMaterial.unitPrice = currentNumber.mw_price,
              this.results.push(this.wareHouseMaterial);
              this.wareHouseMaterial = {
                material_warehouse_id: '',
                materialId: '',
                materialName: '',
                quantity: 1,
                unitPrice: 0,
              }
            }
          }
        }
      }
      const transformedMaterialList = this.results.map((item: any) =>{
        return{
          id:item.material_warehouse_id,
          materialName: item.materialName,
          materialId:item.materialId,
          quantity:item.quantity,
          unitPrice:item.unitPrice
        }
      })
      this.results = transformedMaterialList;
    })
  }

  materialName: any;
  listMaterialUsage:any[] = [];
  listInsertNewMaterial:any[] = [];
  unique: string[] = [];
  updateTemporaryNameMaterial() {
    this.results.forEach((item:any) => {
      if (item.id == this.material_warehouse_id && !this.unique.includes(this.material_warehouse_id)) {
        this.unique.push(item.id);
        this.listMaterialUsage.push({
          material_usage_id: item.material_usage_id == "" ? '' : item.material_usage_id,
          material_warehouse_id: item.material_warehouse_id,
          treatment_course_id: '',
          quantity: '1',
          price: '',
          total_paid: '',
          description: item.materialName,
        });
        this.listInsertNewMaterial.push({
          material_usage_id: item.material_usage_id == "" ? '' : item.material_usage_id,
          material_warehouse_id: item.material_warehouse_id,
          treatment_course_id: '',
          quantity: '1',
          price: '',
          total_paid: '',
          description: item.materialName,
        })
      }
     })
  }

  deleteMaterialUsage(id:any) {
    const index = this.listMaterialUsage.findIndex((item:any) => item.material_warehouse_id == id);
    const index2 = this.unique.findIndex((item:any) => item === id);
    if (index != -1) {
      this.listMaterialUsage.splice(index, 1);
    }

    if (index2 != -1) {
      this.unique.splice(index2, 1);
    }
  }
}

interface ProcedureOb {
  procedureId: string;
  procedureName: string;
  initPrice: string;
  price: string;
  checked: Boolean;
}
