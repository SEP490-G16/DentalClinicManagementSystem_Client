import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITreatmentCourse } from 'src/app/model/ITreatment-Course';
import { Examination } from 'src/app/model/ITreatmentCourseDetail';
import { TreatmentCourseDetailService } from 'src/app/service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
import { MedicalProcedureService } from 'src/app/service/MedicalProcedureService/medical-procedure.service';
import { MedicalSupplyService } from 'src/app/service/MedicalSupplyService/medical-supply.service';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import { MaterialWarehouseService } from 'src/app/service/MaterialService/material-warehouse.service';
@Component({
  selector: 'app-popup-edit-examination',
  templateUrl: './popup-edit-examination.component.html',
  styleUrls: ['../popup-add-examination/popup-add-examination.component.css'],
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
export class PopupEditExaminationComponent implements OnInit {
  //Pathparam
  patient_Id: string = "";
  treatmentCourse_Id: string = "";
  examinationId: string = "";
  //Image
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;
  imageURL: string | ArrayBuffer = '';
  imageUrls: string[] = [];
  imageLink: string = '';
  showImages: boolean = false;
  showPopup = false;
  showInput = false;
  facility: string = "";

  //Thủ thuật
  ProcedureGroupArray: any[] = [];
  detailProcedureGroupArray: any[] = [];

  Procedure_Material_Usage_Body: any[] = [{
    medical_procedure_id: null,
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
      material_warehouse_id: null,
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
    private medicalProcedureService: MedicalProcedureService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private medicalSupplyService: MedicalSupplyService,
    private materialUsageService: MaterialUsageService,
    private materialWarehoseService: MaterialWarehouseService,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {
    this.examination = {
      treatment_course_id: "",
      diagnosis: "",
      created_date: "",
      facility_id: "",
      description: "",
      staff_id: "",
      medicine: ""

    } as Examination;

    this.examination.created_date = new Date().toISOString().substring(0, 10);

    const facility = sessionStorage.getItem("locale");
    if (facility) {
      this.facility = facility;
    }
  }

  ngOnInit(): void {
    //Set id from pathparm
    this.patient_Id = this.route.snapshot.params['id'];
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];
    this.examinationId = this.route.snapshot.params['examinationId'];
    console.log("Patient Id", this.patient_Id);
    console.log("Treatment Id", this.treatmentCourse_Id);
    console.log("Examination Id", this.examinationId);
    this.staff_id = this.doctors[0].doctorid;

    this.getTreatmentCourse();
    this.getExamination();
    this.getMedicalProcedureGroup();
    this.getMedicalProcedureGroupDetail();
    this.getMaterialWarehouse();
    //main
    this.getMaterialUsageByTreatmentCourse();
  }

  getTreatmentCourse() {
    this.tcService.getTreatmentCourse(this.patient_Id)
      .subscribe((data) => {
        console.log("data treatment: ", data);
        this.treatmentCourse = data;
        console.log("treatment course: ", this.treatmentCourse);
      },
        (error) => {
          //this.toastr.error(err.error.message, "Lấy danh sách Liệu trình thất bại");
          ResponseHandler.HANDLE_HTTP_STATUS(this.tcService.apiUrl + "/treatment-course/patient-id/" + this.patient_Id, error);
        })
  }

  getExamination() {
    this.examination.facility_id = this.facility;
    this.tcDetailService.getExamination(this.examinationId)
      .subscribe((data) => {
        console.log("data: ", data);
        this.examination = data.data[0];
        this.examination.created_date = this.examination.created_date.split(" ")[0];

        this.staff_id = this.examination.staff_id;
        console.log("examination: ", this.examination);

      },
        (error) => {
          //this.toastr.error(err.error.message, 'Lỗi khi lấy dữ liệu lần khám');
          ResponseHandler.HANDLE_HTTP_STATUS(this.tcDetailService.apiUrl + "/examination/" + this.examinationId, error);
        })
  }

  getMedicalProcedureGroup() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupList()
      .subscribe((res) => {
        console.log("Get all - Medical Procedure Group: ", res);
        this.ProcedureGroupArray = res.data;
      })
  }

  getMedicalProcedureGroupDetail() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList()
      .subscribe((res) => {
        console.log("Get all - Medical Procedure Group with Detail: ", res);
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

  material_Usage_temp: any[] = [];
  getMaterialUsageByTreatmentCourse() {
    this.materialUsageService.getMaterialUsage_By_TreatmentCourse(this.treatmentCourse_Id)
      .subscribe((res) => {
        console.log("Material Usage TreatmentCourse: ", res);
        this.material_Usage_temp = res.data.filter((mu: any) => mu.examination_id == this.examinationId);
        console.log("Material USAGE TEMP: ", this.material_Usage_temp);

        if (this.material_Usage_temp.length > 0) {
          this.Procedure_Material_Usage_Body = [];
          this.Material_Usage_Body = [];

          const filteredProcedureMaterials = this.material_Usage_temp.filter((mu: any) => mu.medical_procedure_id);
          filteredProcedureMaterials.forEach((pm) => {
            const procedureMaterialApi = {
              medical_procedure_id: pm.medical_procedure_id,
              treatment_course_id: pm.treatment_course_id,
              examination_id: pm.examination_id,
              quantity: pm.quantity,
              price: pm.price,
              total_paid: pm.total,
              description: pm.description
            }
            this.Procedure_Material_Usage_Body.push(procedureMaterialApi);
          })
          console.log("asdsadas: ", this.Procedure_Material_Usage_Body);

          this.material_Usage_temp.forEach((mut) => {
            const materialUsageApi = {
              material_warehouse_id: mut.material_warehouse_id,
              quantity: mut.quantity,
              price: mut.price,
              total_paid: mut.total,
              usage_date: mut.created_date,
            }
            this.Material_Usage_Body.push(materialUsageApi);
          });
        }
        console.log("Material Usage Body after update: ", this.Material_Usage_Body)
      },
        (err) => {
          this.toastr.error(err.error.message, "Lấy danh sách vật liệu sử dụng theo Lịch trình thất bại!");
        })
  }
  findProcedureById(procedureId: string) {
    return this.detailProcedureGroupArray.find(p => p.mp_id === procedureId);
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

  putExamination() {
    console.log("Put Examination: ", this.examination);
    this.examination.staff_id = this.staff_id;
    this.tcDetailService.putExamination(this.examinationId, this.examination)
      .subscribe((res) => {
        this.toastr.success(res.message, 'Sửa lần khám thành công');
        let isSuccess = false;
        this.Procedure_Material_Usage_Body.forEach((el) => {
          el.examination_id = this.examinationId
          if (this.areRequiredFieldsFilled(this.Procedure_Material_Usage_Body)) {
            this.materialUsageService.postProcedureMaterialUsage(el)
              .subscribe((res) => {
                isSuccess = true;
                this.toastr.success(res.message, 'Sửa Thủ thuật thành công');
              },
                (err) => {
                  isSuccess = false;
                  console.log(err);
                  this.toastr.error(err.error.message, 'Sửa Thủ thuật thất bại');
                })
          }
        }
        )
        this.Material_Usage_Body = this.Material_Usage_Body.map(item => {
          const { mw_remaining, ...rest } = item;
          return rest;
        });
        this.Material_Usage_Body.forEach((el) => {
          el.examination_id = this.examinationId
          el.treatment_course_id = this.treatmentCourse_Id
        })
        if (this.areRequiredFieldsFilled(this.Material_Usage_Body)) {
          this.materialUsageService.postMaterialUsage(this.Material_Usage_Body)
            .subscribe((res) => {
              isSuccess = true;

            },
              (err) => {
                isSuccess = false;
                console.log(err);
                this.toastr.error(err.error.message, 'Sửa Vật liệu thất bại');
              })
        }
        if (isSuccess)
          this.showNaviPopup(1)
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.tcDetailService.apiUrl + "/examination/" + this.examinationId, error);
        })
  }

  preview() {
    this.showNaviPopup(1)
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
  @ViewChild('fileInput') fileInputVariable!: ElementRef;
  onFileSelected(event: any) {
    const files = event.target.files;
    console.log(files);
    if (files) {
      for (let file of files) {

        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.imageUrls.push(e.target.result);
          // this.resetFileInput();
          this.showImages = true;
          this.cdr.detectChanges();
          console.log(this.imageUrls);
        };

        reader.readAsDataURL(file);
      }
    }
  }

  addImageUrl() {
    if (this.imageLink) {
      console.log('Adding image URL:', this.imageLink); // Kiểm tra URL
      this.imageUrls.push(this.imageLink);
      // this.imageLink = '';
      console.log('Image URLs:', this.imageUrls); // Kiểm tra xem URL có được thêm vào mảng không
      this.cdr.detectChanges();
    }
  }

  private resetFileInput() {
    this.fileInputVariable.nativeElement.value = ""; // Reset trạng thái của input file
  }
  removeImage(urlToRemove: string) {
    this.imageUrls = this.imageUrls.filter(url => url !== urlToRemove);
    console.log(this.imageUrls);
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
    this.router.navigate(["/benhnhan/danhsach/tab/lichhen/" + this.patient_Id]);
  }
  goPayment(popupNumber: number): void {
    this.isPopup1Visible = false;
    this.router.navigate(["/benhnhan/danhsach/tab/thanhtoan/" + this.patient_Id]);
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
interface Medical_Supply {
  medical_supply_id: string,
  type: string,
  name: string,
  patient_id: string,
  quantity: number,
  received_date: string,
  receiver: string,
  orderer: string,
  order_date: string,
  unit_price: string,
  used_date: string,
  warranty: string,
  labo_id: any,
  status: number,
  facility_id: string,
}

interface material_usage_body {
  material_warehouse_id: string,
  treatment_course_id: string,
  examination_id: string,
  quantity: string,
  price: number,
  total_paid: number,
  description: string
}
