import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { MaxPipe } from 'ngx-date-fns';
import {NgbModal, NgbModalOptions} from "@ng-bootstrap/ng-bootstrap";
import {
  ConfirmAddTreatmentcourseComponent
} from "../../common/confirm-add-treatmentcourse/confirm-add-treatmentcourse.component";
import {
  PopupGenMedicalPdfComponent
} from "../popup-add-examination/popup-gen-medical-pdf/popup-gen-medical-pdf.component";
import {Examination} from "../../../../../model/ITreatmentCourseDetail";
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { MaterialService } from 'src/app/service/MaterialService/material.service';
import { LaboService } from 'src/app/service/LaboService/Labo.service';
import { MedicalSupplyService } from 'src/app/service/MedicalSupplyService/medical-supply.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-popup-add-treatmentcourse',
  templateUrl: './popup-add-treatmentcourse.component.html',
  styleUrls: ['./popup-add-treatmentcourse.component.css']
})
export class PopupAddTreatmentcourseComponent implements OnInit {

  Patient_Id: string = "";
  selectedGroupId: string | null = null;
  ProcedureGroupList: any = [];
  ProcedureDetailList: any = [];
  ProcedureSelectedItems: any[] = [];
  ProcedureDetailListFiltered: any[] = [];
  Post_TreatmentCourse: Partial<IBodyTreatmentCourse> = {};
  Post_Procedure_Material_Usage: any[] = []
  showDropDown1:boolean=false;
  userName: any;
  facility:any;
  currentDate:any;
  validateMaterial={
    soLuong:''
  }
  isSubmittedMaterial:boolean = false;
  valdateSpecimens ={
    soLuong:''
  }
  isSubmittedSpecimens:boolean = false;
  validateMedicine = {
    soLuong:''
  }
  isSubmittedMedicines:boolean = false;
  TreatmentCouseBody = {
    name: '',
    lydo: '',
    chuandoan: '',
    nguyennhan: '',
    thuoc: '',
    luuy: ''
  }
  groupProcedureO = {
    groupId:'',
    groupName: '',
    checked: true,
    procedure: [] as ProcedureOb[],
    isExpand: false,
  }
  ProcedureDetailListCheck: any[] = [];
  UniqueList: string[] = [];

  constructor(
    private treatmentCourseService: TreatmentCourseService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private procedureMaterialService: MaterialUsageService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modelService:NgbModal,
    private router: Router,
    private patientService: PatientService,
    private materialService: MaterialService,
    private LaboService: LaboService,
    private medicalSupplyService: MedicalSupplyService
  ) {
  }

  ngOnInit(): void {
    this.Patient_Id = this.route.snapshot.params['id'];
    this.getPatient();
    this.getMedicalProcedureList();
    this.getMaterialList();
    this.getLabo();

    var user = sessionStorage.getItem('username');
    if (user != null) {
      this.userName = user;
    }

    var faci = sessionStorage.getItem('locale');
    if (faci != null) {
      this.facility = faci;
    }
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDate = currentDateGMT7;
  }

  getMedicalProcedureList() {
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
            quantity: 1,
            laboId: "0",
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
            quantity: 1,
            laboId: "0",
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
                quantity: 1,
                laboId: "0",
                checked: false,
                isExpand: false,
              };
              item.procedure.push(proObject);
              proObject = {
                procedureId: currentO.mp_id,
                procedureName: currentO.mp_name,
                initPrice: currentO.mp_price,
                price: '',
                quantity: 1,
                laboId: "0",
                checked: false,
                isExpand: false
              };
            }
          })
        }
      })
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      })
  }

  list: any[] = [];
  showDropDown: boolean = false;
  checkedList: any[] = [];
  currentSelected: any;
  getSelectedValue(it: any) {
    this.list.forEach((item: any) => {
      if (item.groupId == it.groupId) {
        item.checked = !it.checked;
      }
    })
  }

  checkListImport: string[] = [];
  checkProcedureUse(it:any) {
    this.list.forEach((item:any) => {
      item.procedure.forEach((pro:any) => {
        if (pro.procedureId == it.procedureId) {
          pro.checked = !it.checked;
          this.Post_Procedure_Material_Usage.forEach((item:any) => {
            if (item.medical_procedure_id == it.procedureId) {
              item.price = it.price;
              item.quantity = 1;
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
            description: it.laboId
          }
          this.Post_Procedure_Material_Usage.push(materialUsage);
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

  changePrice(gro:any, event:any) {
    this.Post_Procedure_Material_Usage.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.price = event.target.value;
      }
    })
  }

  changeQuantity(gro:any, event:any) {
    this.Post_Procedure_Material_Usage.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.quantity = event.target.value;
      }
    })
  }

  changeLabo(gro:any) {
    this.Post_Procedure_Material_Usage.forEach((item:any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.description = gro.laboId;
      }
    })
  }

  currentPage: number = 1;
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
  unique: string[] = [];
  updateTemporaryNameMaterial() {
    this.results.forEach((item:any) => {
      if (item.id == this.material_warehouse_id && !this.unique.includes(this.material_warehouse_id)) {
        this.unique.push(item.id);
        this.listMaterialUsage.push({
          material_warehouse_id: item.id,
          treatment_course_id: '',
          quantity: '1',
          price: '',
          total_paid: '',
          description: item.materialName,
        });
      }
     }
    )
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

  Labos: any[] = []
  getLabo() {
    this.LaboService.getLabos()
      .subscribe((res) => {
        this.Labos = res.data;
        localStorage.setItem("ListLabo", JSON.stringify(this.Labos))
      })
  }

  treatmentCourseId: any;
  postTreatmentCourse() {
    this.Post_TreatmentCourse.patient_id = this.Patient_Id;
    this.Post_TreatmentCourse.name = this.TreatmentCouseBody.name;
    this.Post_TreatmentCourse.chief_complaint = this.TreatmentCouseBody.lydo;
    this.Post_TreatmentCourse.differential_diagnosis = this.TreatmentCouseBody.nguyennhan;
    this.Post_TreatmentCourse.provisional_diagnosis = this.TreatmentCouseBody.chuandoan;
    this.Post_TreatmentCourse.description = this.TreatmentCouseBody.luuy;
    this.Post_TreatmentCourse.prescription = JSON.stringify(this.recordsMedicine);
    this.resetValidateMaterial();
    this.listMaterialUsage.forEach((item: any) => {
      let soLuong = item.quantity;
      if (!this.checkNumber(soLuong)){
        this.validateMaterial.soLuong = "Vui lòng nhập số lượng > 0!";
        this.isSubmittedMaterial = true;
      }
    })
    if (this.isSubmittedMaterial){
      return;
    }
    this.resetValidateSpecimens();
    this.list.forEach((item: any) => {
      item.procedure.forEach((it: any) => {
        let soLuong = it.quantity
        if (!this.checkNumber(soLuong)){
          this.valdateSpecimens.soLuong = "Vui lòng nhập số lượng > 0!";
          this.isSubmittedSpecimens = true
        }
      })
    })
    if (this.isSubmittedSpecimens){
      return;
    }
    this.treatmentCourseService.postTreatmentCourse(this.Post_TreatmentCourse).
      subscribe((res) => {
        this.toastr.success(res.message, "Thêm liệu trình thành công");
        if (this.Post_Procedure_Material_Usage.length > 0) {
          this.Post_Procedure_Material_Usage.forEach((item) => {
            item.treatment_course_id = res.treatment_course_id;
            item.price = item.price * item.quantity
            this.procedureMaterialService.postProcedureMaterialUsage(item)
              .subscribe((res) => {
                this.toastr.success("Thêm Thủ thuật thành công");
              }, (err) => {
                this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
              })
          })
        }

        this.list.forEach((item: any) => {
          item.procedure.forEach((it: any) => {
            if (it.laboId != "0") {
              let specmenObject = {
                name: it.procedureName,
                type: '',
                received_date: '',
                orderer: this.userName,
                used_date: '',
                quantity: it.quantity,
                unit_price: it.price,
                order_date: this.dateToTimestamp(this.currentDate),
                patient_id: this.Patient_Id,
                facility_id: this.facility,
                labo_id: it.laboId,
                treatment_course_id: res.treatment_course_id
              }
              this.medicalSupplyService.addMedicalSupply(specmenObject).subscribe(data => {
                this.toastr.success(data.message, 'Thêm mẫu vật sử dụng thành công');
              })
            }
          })
        })

        if (this.listMaterialUsage.length > 0) {
          this.listMaterialUsage.forEach((item: any) => {
            item.treatment_course_id = res.treatment_course_id;
          })
          this.procedureMaterialService.postMaterialUsage(this.listMaterialUsage)
            .subscribe((res) => {
              this.toastr.success("Thêm vật liệu thành công");
            }, (err) => {
              this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
            })
        }
        const modalRef = this.modelService.open(ConfirmAddTreatmentcourseComponent);
        modalRef.result.then((res:any) =>{
          switch (res){
            case 'lich-hen':
              const ref = document.getElementById('cancel');
              ref?.click();
              this.goAppointment();

              break;
            case 'thanh-toan':
              const ref1 = document.getElementById('cancel');
              ref1?.click();
              this.goPayment();
              break;
            default:
              break;
          }
        })

      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl + "/treatment-course", error);
        }
      )
  }

  close() {
    this.Post_TreatmentCourse = {}
    this.Post_Procedure_Material_Usage = []
  }
  isExpand:boolean = false;
  toggleExpand(check:any){
    this.list.forEach((item:any) => {
       if (item.groupId == check.groupId) {
        item.isExpand = !check.isExpand;
       }
    })
  }
  goAppointment(): void {
    this.router.navigate(["/benhnhan/danhsach/tab/lichhen/" + this.Patient_Id]);
  }
  goPayment(): void {
    this.router.navigate(["/benhnhan/danhsach/tab/thanhtoan/" + this.Patient_Id]);
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
  Patient:any;
  //examination: Examination = {} as Examination;
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

  modalOption: NgbModalOptions = {
    size: 'lg',
    centered: true
  }

  openGeneratePdfModal() {
    const modalRef = this.modelService.open(PopupGenMedicalPdfComponent, this.modalOption);
    modalRef.componentInstance.Disagnosis = this.TreatmentCouseBody.chuandoan;
    modalRef.componentInstance.Medical = this.recordsMedicine;
    modalRef.componentInstance.Patient = this.Patient;
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm';
    const timeZone = 'Asia/Ho_Chi_Minh';
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  private resetValidateMaterial(){
    this.validateMaterial = {
      soLuong: ''
    }
    this.isSubmittedMaterial = false;
  }
  private resetValidateSpecimens(){
    this.valdateSpecimens = {
      soLuong: ''
    }
    this.isSubmittedSpecimens = false;
  }
}

interface IBodyProcedureMaterialUsage {
  medical_procedure_id: any,
  treatment_course_id: any,
  quantity: number,
  price: number,
  total_paid: number,
  description: string
}

interface IBodyTreatmentCourse {
  patient_id: string,
  name: string,
  description: string,
  chief_complaint: string;
  provisional_diagnosis: string;
  differential_diagnosis: string;
  prescription: string;
}

interface ProcedureOb {
  procedureId: string;
  procedureName: string;
  initPrice: string;
  price: string;
  checked: Boolean;
}

interface ExpiryObject {
  mw_material_warehouse_id: string;
  quantity: number;
  expiryDate: string;
  discount: 0,
  expanded: boolean;
}
