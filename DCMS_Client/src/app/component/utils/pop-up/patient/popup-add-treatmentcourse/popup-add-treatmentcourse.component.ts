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

  TreatmentCouseBody = {
    name: '',
    lydo: '',
    chuandoan: '',
    nguyennhan: '',
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
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.Patient_Id = this.route.snapshot.params['id'];
    this.getMedicalProcedureList();
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
                checked: false,
                isExpand: false,
              };
              item.procedure.push(proObject);
              proObject = {
                procedureId: currentO.mp_id,
                procedureName: currentO.mp_name,
                initPrice: currentO.mp_price,
                price: '',
                checked: false,
                isExpand: false
              };
            }
          })
        }
      })
      console.log("Procedure Group: ", this.list);
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
            }
          })
        }
        if (pro.checked == true && !this.checkListImport.includes(it.procedureId)) {
          this.checkListImport.push(it.procedureId);
          let materialUsage = {
            medical_procedure_id: it.procedureId,
            treatment_course_id: '',
            quantity: '1',
            price: it.price,
            total_paid: '',
            description: ''
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
        console.log(item.price);
      }
    })
  }

  treatmentCourseId: any;
  postTreatmentCourse() {
    this.Post_TreatmentCourse.patient_id = this.Patient_Id;
    this.Post_TreatmentCourse.name = this.TreatmentCouseBody.name;
    this.Post_TreatmentCourse.chief_complaint = this.TreatmentCouseBody.lydo;
    this.Post_TreatmentCourse.differential_diagnosis = this.TreatmentCouseBody.nguyennhan;
    this.Post_TreatmentCourse.provisional_diagnosis = this.TreatmentCouseBody.chuandoan;
    console.log(this.Post_Procedure_Material_Usage);
    this.treatmentCourseService.postTreatmentCourse(this.Post_TreatmentCourse).
      subscribe((res) => {
        console.log(res);
        this.toastr.success(res.message, "Thêm liệu trình thành công");
        if (this.Post_Procedure_Material_Usage.length > 0) {
          this.Post_Procedure_Material_Usage.forEach((item) => {
            item.treatment_course_id = res.treatment_course_id;
            this.treatmentCourseId = res.treatment_course_id;
            this.procedureMaterialService.postProcedureMaterialUsage(item)
              .subscribe((res) => {
                console.log("oki");
                this.toastr.success("Thêm Thủ thuật thành công");
                //this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.Patient_Id + '/themlankham/' + this.treatmentCourseId]);
              }, (err) => {
                this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
              })
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
    this.isAddMedicine = false;
    this.recordsMedicine.splice(index, 1);
  }
  modalOption: NgbModalOptions = {
    size: 'lg',
    centered: true
  }
  Patient:any;
  examination: Examination = {} as Examination;
  openGeneratePdfModal() {
    const modalRef = this.modelService.open(PopupGenMedicalPdfComponent, this.modalOption);
    modalRef.componentInstance.Disagnosis = this.examination.diagnosis;
    modalRef.componentInstance.Medical = this.recordsMedicine;
    modalRef.componentInstance.Patient = this.Patient;
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
}

interface ProcedureOb {
  procedureId: string;
  procedureName: string;
  initPrice: string;
  price: string;
  checked: Boolean;
}
