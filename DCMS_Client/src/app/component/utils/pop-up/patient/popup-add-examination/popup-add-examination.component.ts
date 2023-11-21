import { Component, HostListener, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITreatmentCourse } from 'src/app/model/ITreatment-Course';
import { Examination, TreatmentCourseDetail } from 'src/app/model/ITreatmentCourseDetail';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MedicalProcedureService } from 'src/app/service/MedicalProcedureService/medical-procedure.service';
import { MedicalSupplyService } from 'src/app/service/MedicalSupplyService/medical-supply.service';
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { MaterialWarehouseService } from 'src/app/service/MaterialService/material-warehouse.service';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
@Component({
  selector: 'app-popup-add-examination',
  templateUrl: './popup-add-examination.component.html',
  styleUrls: ['./popup-add-examination.component.css'],
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ])
    ]),
  ]
})
export class PopupAddExaminationComponent implements OnInit {
  //Pathparam
  patient_Id: string = "";
  treatmentCourse_Id: string = "";
  //Image
  imageURL: string | ArrayBuffer = '';
  imageUrls: string[] = [];
  imageLink: string = '';
  showImages: boolean = false;
  showPopup = false;
  showInput = false;
  facility: string = "";
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;
  //Thủ thuật
  ProcedureGroupArray: any[] = [];
  detailProcedureGroupArray: any[] = [];

  Procedure_Material_Usage_Body: any[] = [{
    material_warehouse_id: "",
    medical_procedure_id: "",
    treatment_course_id: "",
    examination_id: "",
    quantity: 1,
    price: 0,
    total_paid: 0,
    description: ''
  }
  ]

  pg_id: any;
  //Thêm Vật liệu sử dụng Table
  MaterialWarehouse_Array: any[] = [];
  remainMaterial: number = 0;
  Material_Usage_Body: any[] = [
    {
      material_warehouse_id: "",
      medical_procedure_id: "",
      treatment_course_id: "",
      examination_id: "",
      quantity: 1,
      price: 0,
      total_paid: 0,
      description: '',
      mw_remaining: 0
    }
  ];

  examination: Examination = {} as Examination;
  treatmentCourse: ITreatmentCourse = [];
  staff_id: string = "";
  doctors = [
    {
      doctorid: "ad2879dd-626c-4ade-8c95-da187af572ad",
      doctorName: "Thế"
    }
  ]
  //Hover
  showSecondaryDatalist: boolean = false;
  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private tcService: TreatmentCourseService,
    private tcDetailService: TreatmentCourseDetailService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private medicalProcedureService: MedicalProcedureService,
    private medicalSupplyService: MedicalSupplyService,
    private materialUsageService: MaterialUsageService,
    private materialWarehoseService: MaterialWarehouseService,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    this.examination = {
      treatment_course_id: "",
      diagnosis: "",
      xRayImage: "",
      created_date: "",
      facility_id: "",
      description: "",
      staff_id: "",
      xRayImageDes: "",
      medicine: ""
    } as Examination;

    this.examination.created_date = new Date().toISOString().substring(0, 10);

    const facility = sessionStorage.getItem("locale");
    if (facility) {
      this.facility = facility;
    }
  }

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];

    console.log("Patient Id", this.patient_Id);
    console.log("TreatmentCourse Id", this.treatmentCourse_Id);
    this.staff_id = this.doctors[0].doctorid;

    this.getTreatmentCourse();
    this.getMedicalProcedureGroup();
    this.getMedicalProcedureGroupDetail();
    this.getMaterialWarehouse();
  }

  getTreatmentCourse() {
    this.tcService.getTreatmentCourse(this.patient_Id)
      .subscribe((data) => {
        console.log("data treatment: ", data);
        this.treatmentCourse = data;
        console.log("treatment course: ", this.treatmentCourse);
      },
        (error) => {
          //this.toastr.error(error.error.message, "Lấy danh sách Liệu trình thất bại");
          ResponseHandler.HANDLE_HTTP_STATUS(this.tcService.apiUrl+"/treatment-course/patient-id/"+this.patient_Id, error);
        })
  }

  getMedicalProcedureGroup() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupList()
      .subscribe((res) => {
        console.log("Medical Procedure Group: ", res);
        this.ProcedureGroupArray = res.data;
      })
  }

  getMedicalProcedureGroupDetail() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList()
      .subscribe((res) => {
        console.log("Medical Procedure Group with Detail: ", res);
        this.detailProcedureGroupArray = res.data;
      })
  }

  getMaterialWarehouse() {
    this.materialWarehoseService.getMaterialWarehousse_Remaining(1)
      .subscribe((res) => {
        this.MaterialWarehouse_Array = res.data;
        console.log("Material Remaining: ", res.data);
      })
  }

  detailProcedureGroupArrayFilter: any;
  filterProcedureByPG(index: number) {
    if (this.pg_id != "")
      this.detailProcedureGroupArrayFilter = this.detailProcedureGroupArray.filter(p => p.mg_id === this.pg_id)
    console.log("Filter detail: ", this.detailProcedureGroupArrayFilter);
  }

  chooseProcedure(index: number, medicalProcedureId: number) {
    const selectedProcedure = this.detailProcedureGroupArrayFilter.find((procedure: any) => procedure.mp_id === medicalProcedureId);
    if (selectedProcedure) {
      this.Procedure_Material_Usage_Body[index].treatment_course_id = this.treatmentCourse_Id;
      this.Procedure_Material_Usage_Body[index].price = selectedProcedure.mp_price;
      this.Procedure_Material_Usage_Body[index].total_paid = selectedProcedure.mp_price;
    }
  }

  updateMaterialWarehouse(index: number, material_warehouse_id: any) {
    const selectedMaterialW = this.MaterialWarehouse_Array.find((mw: any) => mw.mw_material_warehouse_id === material_warehouse_id);
    console.log("Selected Material: ", selectedMaterialW);
    if (selectedMaterialW) {
      this.Material_Usage_Body[index].treatment_course_id = this.treatmentCourse_Id;
      this.Material_Usage_Body[index].price = selectedMaterialW.mw_price;
      this.Material_Usage_Body[index].mw_remaining = selectedMaterialW.mw_remaining;
      this.Material_Usage_Body[index].total_paid = this.Material_Usage_Body[index].price * this.Material_Usage_Body[index].quantity;
      console.log("updateMaterialWarehouse: ", this.Material_Usage_Body);
    }
  }

  allowedEmptyFields: string[]
    = ['usage_date', 'adder', 'description', 'examination_id',
      'material_warehouse_id', 'medical_procedure_id'];

  areRequiredFieldsFilled(array: any[]): boolean {
    return array.every(item => {
      return Object.entries(item).every(([key, value]) => {
        if (this.allowedEmptyFields.includes(key)) {
          return true;
        }

        return value !== null && value !== '';
      });
    });
  }

  postExamination() {
    this.examination.treatment_course_id = this.treatmentCourse_Id;
    this.examination.staff_id = this.staff_id;
    const facility: string | null = sessionStorage.getItem('locale');
    this.examination.facility_id = this.facility;
    this.examination.xRayImage = this.imageUrls.join(' ');
    console.log("Post", this.examination);
    console.log("Post Procedure: ", this.Procedure_Material_Usage_Body);
    console.log("Post Material: ", this.Material_Usage_Body);
    this.tcDetailService.postExamination(this.examination)
      .subscribe((res) => {
        this.toastr.success(res.message, 'Thêm lần khám thành công');
        console.log("ExaminationId Response: ", res.data.examination_id);
        const examinationId = res.data.examination_id;
        this.Procedure_Material_Usage_Body.forEach((el) => {
          el.examination_id = examinationId
        }
        )
        this.MaterialWarehouse_Array.forEach((el) => {
          el.examination_id = examinationId
        })

        if (this.areRequiredFieldsFilled(this.Procedure_Material_Usage_Body)) {
          this.materialUsageService.postMaterialUsage(this.Procedure_Material_Usage_Body)
            .subscribe((res) => {
              this.toastr.error(res.message, 'Thêm Thủ thuật thành công');
            },
              (err) => {
                console.log(err);
                this.toastr.error(err.error.message, 'Thêm Thủ thuật thất bại');
              })
        }
        if (this.areRequiredFieldsFilled(this.Material_Usage_Body)) {
          this.materialUsageService.postMaterialUsage(this.Material_Usage_Body)
            .subscribe((res) => {
              this.toastr.error(res.message, 'Thêm Vật liệu sử dụng thành công');
            },
              (err) => {
                console.log(err);
                this.toastr.error(err.error.message, 'Thêm Vật liệu thất bại');

              })
        }

      },

        (error) => {
          //this.toastr.error(err.error.message, 'Thêm lần khám thất bại');
          ResponseHandler.HANDLE_HTTP_STATUS(this.tcDetailService.apiUrl+"/examination", error);
        }
        // (err) => {
        //   this.toastr.error(err.error.message, 'Thêm lần khám thất bại');
        // }
        )
  }

  closePopup() {
    let popupContainer = document.getElementById('popupContainer');
    if (popupContainer) {
      popupContainer.classList.remove('show');
    }
  }

  //Xử lý với ảnh
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.showPopup && !this.containerRef.nativeElement.contains(event.target)) {
      this.showPopup = false;
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;

    if (files) {
      for (let file of files) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.imageUrls.push(e.target.result);
          this.cdr.detectChanges(); // Buộc Angular cập nhật view
        };

        reader.readAsDataURL(file);
      }
    }
  }

  completeSelection() {
    this.showImages = true;
  }
  addImageUrl() {
    if (this.imageLink) {
      this.imageUrls.push(this.imageLink);
      console.log(this.imageLink);
      this.imageLink = '';
    }
  }

  removeImage(urlToRemove: string) {
    this.imageUrls = this.imageUrls.filter(url => url !== urlToRemove);
  }

  //Xử lý với bảng
  addNewRow(status: number) {
    switch (status) {
      case 1:
        this.Material_Usage_Body.push({
          material_warehouse_id: "",
          medical_procedure_id: "",
          treatment_course_id: "",
          examination_id: "",
          quantity: 0,
          price: 0,
          total_paid: 0,
          description: ''
        });
        console.log("Table row", this.Material_Usage_Body);
        this.Material_Usage_Body[this.Material_Usage_Body.length - 1].animationClass = 'new-row-animation';
        break;
      default:
        this.Procedure_Material_Usage_Body.push({
          material_warehouse_id: "",
          medical_procedure_id: "",
          treatment_course_id: "",
          examination_id: "",
          quantity: 0,
          price: 0,
          total_paid: 0,
          description: ''
        });
        console.log("Table row", this.Procedure_Material_Usage_Body);
        this.Procedure_Material_Usage_Body[this.Procedure_Material_Usage_Body.length - 1].animationClass = 'new-row-animation';
        break;
    }
  }

  removeRow(index: number, status: number) {
    switch (status) {
      case 1:
        this.Material_Usage_Body.splice(index, 1);
        break;
      default:
        this.Procedure_Material_Usage_Body.splice(index, 1);
        break;
    }
  }
  isPopup1Visible = false;
  isPopup2Visible = false;

  showNaviPopup(popupNumber: number): void {
    this.isPopup1Visible = true;
  }

  goAppointment(popupNumber: number): void {
    this.isPopup1Visible = false;
  }
  goPayment(popupNumber: number): void {
    this.isPopup1Visible = false;
  }

  isHovering: boolean = false;

  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate([href + this.patient_Id]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate([href + this.patient_Id]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate([href + this.patient_Id]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate([href + this.patient_Id]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }

}
