import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { MaxPipe } from 'ngx-date-fns';

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
    procedure: [] as ProcedureOb[]
  }
  ProcedureDetailListCheck: any[] = [];
  UniqueList: string[] = [];

  constructor(
    private treatmentCourseService: TreatmentCourseService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private procedureMaterialService: MaterialUsageService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
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
            price: '',
            checked: false
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
            procedure: []
          }
          proObject = {
            procedureId: '',
            procedureName: '',
            initPrice: '',
            price: '',
            checked: true
          };
        } else {
          this.list.forEach((item: any) => {
            if (item.groupId == currentO.mg_id) {
              let proObject = {
                procedureId: currentO.mp_id,
                procedureName: currentO.mp_name,
                initPrice: currentO.mp_price,
                price: '',
                checked: false
              };
              item.procedure.push(proObject);
              proObject = {
                procedureId: currentO.mp_id,
                procedureName: currentO.mp_name,
                initPrice: currentO.mp_price,
                price: '',
                checked: false
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

  checkProcedureUse(it:any) {
    this.list.forEach((item:any) => {
      item.procedure.forEach((pro:any) => {
        if (pro.procedureId == it.procedureId) {
          pro.checked = !it.checked;
          console.log(it);
        }
        if (pro.checked == true) {
          let materialUsage = {
            medical_procedure_id: it.procedureId,
            treatment_course_id: '',
            quantity: '1',
            price: it.initPrice,
            total_paid: it.price,
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


  // getMedicalProcedureDetailList() {
  //   this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList().subscribe(data => {
  //     this.ProcedureDetailList = data.data;
  //     console.log("Procedure: ", this.ProcedureDetailList);
  //   },
  //     (error) => {
  //       ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
  //     })
  // }

  // onProcedureGroupSelectChange(event: Event): void {
  //   const selectElement = event.target as HTMLSelectElement;
  //   this.selectedGroupId = selectElement.value;

  //   if (this.selectedGroupId && this.selectedGroupId !== '0') {
  //     this.ProcedureDetailListFiltered = this.ProcedureDetailList.filter(
  //       (detail: any) => detail.mg_id === this.selectedGroupId
  //     );
  //   } else {
  //     this.ProcedureDetailListFiltered = [];
  //   }
  // }

  // onProcedureSelectChange(event: Event): void {
  //   const selectElement = event.target as HTMLSelectElement;
  //   const selectedId = selectElement.value;

  //   if (selectedId && selectedId !== '0') {
  //     const selectedProcedure = this.ProcedureDetailListFiltered.find((procedure: any) => procedure.mp_id === selectedId);

  //     if (selectedProcedure && !this.ProcedureSelectedItems.some(item => item.mp_id === selectedId)) {
  //       this.ProcedureSelectedItems.push(selectedProcedure);
  //       this.updatePostProcedureMaterialUsage(selectedProcedure);
  //     }
  //   }
  //   selectElement.selectedIndex = 0;
  //   selectElement.value = '0';
  // }

  // updatePostProcedureMaterialUsage(selectedProcedure: any): void {
  //   const existingGroupUsage = this.Post_Procedure_Material_Usage.find(usage => usage.medical_procedure_id === selectedProcedure.mg_id);

  //   if (existingGroupUsage) {
  //     existingGroupUsage.quantity += 1;
  //     existingGroupUsage.total_paid += selectedProcedure.mp_price;
  //   } else {
  //     this.Post_Procedure_Material_Usage.push({
  //       medical_procedure_id: selectedProcedure.mp_id,
  //       treatment_course_id: '',
  //       examination_id: '',
  //       quantity: 1,
  //       price: selectedProcedure.mp_price,
  //       total_paid: selectedProcedure.mp_price,
  //       description: selectedProcedure.mp_description || ''
  //     });
  //   }
  //onsole.log(this.Post_Procedure_Material_Usage);
  //}

  // deleteProcedureSelectedItem(index: number): void {
  //   const procedureToBeRemoved = this.ProcedureSelectedItems[index];

  //   const groupUsageIndex = this.Post_Procedure_Material_Usage.findIndex(usage => usage.medical_procedure_id === procedureToBeRemoved.mp_id);
  //   if (groupUsageIndex > -1) {
  //     const groupUsage = this.Post_Procedure_Material_Usage[groupUsageIndex];
  //     groupUsage.quantity -= 1;
  //     groupUsage.total_paid -= procedureToBeRemoved.mp_price;

  //     if (groupUsage.quantity <= 0) {
  //       this.Post_Procedure_Material_Usage.splice(groupUsageIndex, 1);
  //     }
  //   }

  //   this.ProcedureSelectedItems.splice(index, 1);

  //   console.log(this.Post_Procedure_Material_Usage);
  // }



  postTreatmentCourse() {
    this.Post_TreatmentCourse.patient_id = this.Patient_Id;
    this.Post_TreatmentCourse.name = this.TreatmentCouseBody.name;
    this.Post_TreatmentCourse.chief_complaint = this.TreatmentCouseBody.lydo;
    this.Post_TreatmentCourse.differential_diagnosis = this.TreatmentCouseBody.nguyennhan;
    this.Post_TreatmentCourse.provisional_diagnosis = this.TreatmentCouseBody.chuandoan;
    this.treatmentCourseService.postTreatmentCourse(this.Post_TreatmentCourse).
      subscribe((res) => {
        console.log(res);
        this.toastr.success(res.message, "Thêm liệu trình thành công");
        if (this.Post_Procedure_Material_Usage.length > 0) {
          this.Post_Procedure_Material_Usage.forEach((item) => {
            item.treatment_course_id = res.treatment_course_id;
            this.procedureMaterialService.postProcedureMaterialUsage(item)
              .subscribe((res) => {
                  console.log("oki");
                  this.toastr.success("Thêm Thủ thuật thành công");
                  this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.Patient_Id + '/themlankham/' + res.treatment_course_id]);
              }, (err) => {
                this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
              });
          });
        }
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
