import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';

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
  Post_Procedure_Material_Usage: IBodyProcedureMaterialUsage[] = []
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
    this.getMedicalProcedureDetailList();
  }

  getMedicalProcedureList() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupList().subscribe(data => {
      this.ProcedureGroupList = data.data;
      console.log("Procedure Group: ", this.ProcedureGroupList);
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      })
  }

  getMedicalProcedureDetailList() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList().subscribe(data => {
      this.ProcedureDetailList = data.data;
      console.log("Procedure: ", this.ProcedureDetailList);
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      })
  }

  onProcedureGroupSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedGroupId = selectElement.value;

    if (this.selectedGroupId && this.selectedGroupId !== '0') {
      this.ProcedureDetailListFiltered = this.ProcedureDetailList.filter(
        (detail: any) => detail.mg_id === this.selectedGroupId
      );
    } else {
      this.ProcedureDetailListFiltered = [];
    }
  }

  onProcedureSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = selectElement.value;

    if (selectedId && selectedId !== '0') {
      const selectedProcedure = this.ProcedureDetailListFiltered.find((procedure: any) => procedure.mp_id === selectedId);

      if (selectedProcedure && !this.ProcedureSelectedItems.some(item => item.mp_id === selectedId)) {
        this.ProcedureSelectedItems.push(selectedProcedure);
        this.updatePostProcedureMaterialUsage(selectedProcedure);
      }
    }
    selectElement.selectedIndex = 0;
    selectElement.value = '0';
  }

  updatePostProcedureMaterialUsage(selectedProcedure: any): void {
    const existingGroupUsage = this.Post_Procedure_Material_Usage.find(usage => usage.medical_procedure_id === selectedProcedure.mg_id);

    if (existingGroupUsage) {
      existingGroupUsage.quantity += 1;
      existingGroupUsage.total_paid += selectedProcedure.mp_price;
    } else {
      this.Post_Procedure_Material_Usage.push({
        medical_procedure_id: selectedProcedure.mp_id,
        treatment_course_id: '',
        examination_id: '',
        quantity: 1,
        price: selectedProcedure.mp_price,
        total_paid: selectedProcedure.mp_price,
        description: selectedProcedure.mp_description || ''
      });
    }

    // Log for debugging
    console.log(this.Post_Procedure_Material_Usage);
  }

  deleteProcedureSelectedItem(index: number): void {
    const procedureToBeRemoved = this.ProcedureSelectedItems[index];

    const groupUsageIndex = this.Post_Procedure_Material_Usage.findIndex(usage => usage.medical_procedure_id === procedureToBeRemoved.mp_id);
    if (groupUsageIndex > -1) {
      const groupUsage = this.Post_Procedure_Material_Usage[groupUsageIndex];
      groupUsage.quantity -= 1;
      groupUsage.total_paid -= procedureToBeRemoved.mp_price;

      if (groupUsage.quantity <= 0) {
        this.Post_Procedure_Material_Usage.splice(groupUsageIndex, 1);
      }
    }

    this.ProcedureSelectedItems.splice(index, 1);

    console.log(this.Post_Procedure_Material_Usage);
  }



  postTreatmentCourse() {
    this.Post_TreatmentCourse.patient_id = this.Patient_Id;
    console.log("Post treatmentcourse: ", this.Post_TreatmentCourse);
    console.log("Post procedure: ", this.Post_Procedure_Material_Usage);
    this.treatmentCourseService.postTreatmentCourse(this.Post_TreatmentCourse).
      subscribe((res) => {
        console.log(res);
        this.toastr.success(res.message, "Thêm liệu trình thành công");
        if (this.Post_Procedure_Material_Usage.length > 0) {
          this.Post_Procedure_Material_Usage.forEach((item) => {
            item.treatment_course_id = res.treatment_course_id;
            this.procedureMaterialService.postProcedureMaterialUsage(item)
              .subscribe((res) => {
                  console.log("oki")
              }, (err) => {
                this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
              });
          });
        }
        this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.Patient_Id + '/themlankham/' + res.treatment_course_id]);
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
  examination_id: any,
  quantity: number,
  price: number,
  total_paid: number,
  description: string
}

interface IBodyTreatmentCourse {
  patient_id: string,
  name: string,
  description: string
}
