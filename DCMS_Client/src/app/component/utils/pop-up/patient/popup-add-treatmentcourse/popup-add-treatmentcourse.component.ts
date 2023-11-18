import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { ITreatmentCourse, TreatmentCourse } from './../../../../../model/ITreatment-Course';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ToastrService } from 'ngx-toastr';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';

@Component({
  selector: 'app-popup-add-treatmentcourse',
  templateUrl: './popup-add-treatmentcourse.component.html',
  styleUrls: ['./popup-add-treatmentcourse.component.css']
})
export class PopupAddTreatmentcourseComponent implements OnInit {

  Add_TreatmentCourse = {
    patient_id: "",
    description: "",
    name: "",
  };
  Patient_Id: string = "";
  constructor(
    private treatmentCourseService: TreatmentCourseService,
    private methodService: CommonService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ProcedureList:any = [];

  selectedItems: any[] = [];

  ngOnInit(): void {
    this.Patient_Id = this.route.snapshot.params['id'];
    this.getMedicalProcedureList();
  }

  onProcedureSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = selectElement.value;

    const selectedProcedure = this.ProcedureList.find((procedure:any) => procedure.mp_id === selectedId);

    if (selectedProcedure && !this.selectedItems.some(item => item.mp_id === selectedId)) {
      this.selectedItems.push({
        mp_id: selectedProcedure.mp_id,
        mp_name: selectedProcedure.mp_name
      });
    }
  }

  deleteSelectedItem(index: number): void {

    this.selectedItems.splice(index, 1);
  }

  getMedicalProcedureList(){
    this.medicalProcedureGroupService.getMedicalProcedureList().subscribe(data=>{
      console.log("Data Medical Procedure: ", data);
      this.ProcedureList = data.data;
    },
    (err) => {
      this.toastr.error(err.error.message, "Lấy dánh sách thủ thuật thất bại");
    })
  }

  addTreatmentCourse() {
    console.log(this.Add_TreatmentCourse);
    this.Add_TreatmentCourse.patient_id = this.Patient_Id;
    this.treatmentCourseService.postTreatmentCourse(this.Add_TreatmentCourse).
      subscribe((res) => {
        console.log(res);
        this.toastr.success(res.message, "Thêm liệu trình thành công");
        this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.Patient_Id + '/themlankham/' + res.treatment_course_id])
        // window.location.reload();
      },
        (err) => {
          this.methodService.showToast(err.error.message, "Thêm liệu trình thất bại", 2);
          console.log(err.error.message);
        }
      )
  }

}
