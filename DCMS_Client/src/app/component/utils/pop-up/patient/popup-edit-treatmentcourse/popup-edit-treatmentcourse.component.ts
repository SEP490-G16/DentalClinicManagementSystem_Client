import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { error } from '@angular/compiler-cli/src/transformers/util';

@Component({
  selector: 'app-popup-edit-treatmentcourse',
  templateUrl: './popup-edit-treatmentcourse.component.html',
  styleUrls: ['./popup-edit-treatmentcourse.component.css']
})
export class PopupEditTreatmentcourseComponent implements OnInit {
  @Input() TreatmentCourse: any;
  
  Post_Procedure_Material_Usage: any[] = []
  showDropDown:boolean = false;
  constructor(
    private treatmentCourseService:TreatmentCourseService,
    private toastr: ToastrService,
    private materialUsageService: MaterialUsageService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
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


  Edit_TreatmentCourse: any;
  ngOnInit(): void {
    this.getMedicalProcedureList();
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
            }
          })
        }
      })
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['TreatmentCourse'].currentValue != undefined) {
      this.Edit_TreatmentCourse = {
        treatment_course_id: this.TreatmentCourse.treatment_course_id,
        patient_id: this.TreatmentCourse.patient_id,
        description: this.TreatmentCourse.description,
        chief_complaint: this.TreatmentCourse.chief_complaint,
        created_date: this.TreatmentCourse.created_date,
        differential_diagnosis: this.TreatmentCourse.differential_diagnosis,
        provisional_diagnosis: this.TreatmentCourse.provisional_diagnosis,
        name: this.TreatmentCourse.name,
      }
    }
    this.materialUsageService.getMaterialUsage_By_TreatmentCourse(this.Edit_TreatmentCourse.treatment_course_id).subscribe((data) => {
      this.listData = data.data;
      this.listData.forEach((item: any) => {
        console.log("check list", this.listData)
        if (item.medical_procedure_id != null) {
          let precedureO = {
            procedure_id: item.medical_procedure_id,
            price: item.price
          }
          this.list.forEach((ite: any) => {
            ite.procedure.forEach((pro: any) => {
              if (pro.procedureId == item.medical_procedure_id) {
                ite.checked = true;
                pro.checked = true;
                pro.price = item.price;
                let materialUsage = {
                  material_usage_id: item.material_usage_id,
                  medical_procedure_id: item.medical_procedure_id,
                  treatment_course_id: item.treatment_course_id,
                  quantity: '1',
                  price: item.price,
                  total_paid: item.total_paid,
                  description: ''
                }
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

  getSelectedValue(it: any) {
    this.list.forEach((item: any) => {
      if (item.groupId == it.groupId) {
        item.checked = !it.checked;
      }
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

  listData: any[] = [];
  listDisplay: any[] = [];

  editTreatmentCourse() {
    this.treatmentCourseService.putTreatmentCourse(this.Edit_TreatmentCourse.treatment_course_id, this.Edit_TreatmentCourse)
    .subscribe((res) => {
        this.Post_Procedure_Material_Usage.forEach((item:any) => {
          console.log(1)
          this.materialUsageService.putMaterialUsage(item.medical_procedure_id, item).subscribe((data) => {
            this.toastr.success(res.message, "Sửa thủ thuật thành công");
          }, (error) => {
            this.toastr.error(error.message, "Sửa thủ thuật thất bại");
          }
          )
        })
        this.toastr.success(res.message, "Sửa Lịch trình điều trị");
        window.location.reload();
    },
    (error) => {
      //this.toastr.error(err.error.message, "Sửa Lịch trình điều trị thất bại");
      ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl+"/treatment-course/"+this.TreatmentCourse.treatment_course_id, error);
    }
    )
  }

}

interface ProcedureOb {
  procedureId: string;
  procedureName: string;
  initPrice: string;
  price: string;
  checked: Boolean;
}
