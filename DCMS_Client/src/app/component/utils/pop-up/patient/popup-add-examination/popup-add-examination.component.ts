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
  Body_Medical_Procedure = {
    medical_procedure_group_id: null,
    name: '',
    price: '',
    description: ''
  }
  //Vật liệu sử dụng
  Body_Material_Usage: material_usage_body[] = [];
  Material_Selects: any [] = [];

  //Data Table
  tableRows: any[] = [
    { procedure_name: '', unit_price: 0, total: 0 }
  ];

  materialUsageRows: any[] = [
    { material_name: '', quantity: 0, usage_date: '', adder: '' }
  ]

  examination: Examination = {} as Examination;
  treatmentCourse: ITreatmentCourse = [];
  staff_id: string = "";
  doctors = [
    {
      doctorid: "ad2879dd-626c-4ade-8c95-da187af572ad",
      doctorName: "Thế"
    }
  ]
  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private tcService: TreatmentCourseService,
    private tcDetailService: TreatmentCourseDetailService,
    private medicalProcedureService: MedicalProcedureService,
    private medicalSupplyService: MedicalSupplyService,
    private materialUsageService: MaterialUsageService,
    private materialWarehoseService:MaterialWarehouseService,
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
          this.toastr.error(error.error.message, "Lấy danh sách Liệu trình thất bại");
        })
  }

  getMaterialWarehouse() {
    this.materialWarehoseService.getMaterialWarehousse_Remaining(1)
    .subscribe((res) => {
      console.log("Material Remaining: ", res.data);
    })
  }

  // tableRows: any[] = [
  //   { procedure_name: '', unit_price: 0, total: 0}
  // ];

  allowedEmptyFields: string[] = ['adder', 'discount'];

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
    this.tcDetailService.postExamination(this.examination)
      .subscribe((res) => {
        // this.toastr.success(res.message, 'Thêm lần khám thành công');
        console.log(res.message + "");
      },
        (err) => {
          this.toastr.error(err.error.message, 'Thêm lần khám thất bại');
        })
    if (this.areRequiredFieldsFilled(this.tableRows)) {
      this.tableRows.forEach((procedure) => {
        this.Body_Medical_Procedure.medical_procedure_group_id = null;
        this.Body_Medical_Procedure.name = procedure.procedure_name;
        this.Body_Medical_Procedure.price = procedure.total;
        this.medicalProcedureService.addMedicalProcedure(this.Body_Medical_Procedure)
          .subscribe((res) => {

          },
            (err) => {
              console.log("Thêm thủ thuật: ", err.error.message);
              this.toastr.error(err.error.message, "Thêm thủ thuật thất bại");
            })
      })
    }else {
      this.toastr.error("Vui lòng nhập đầy đủ các thông tin", "Thêm thủ thuật")
    }
    // materialUsageRows: any[] = [
    //   { material_name: '', quantity: 0, usage_date: '', adder: '' }
    // ]
    console.log("Material usage: ", this.materialUsageRows);
    if (this.areRequiredFieldsFilled(this.materialUsageRows)) {

    }else {
      this.toastr.error("Vui lòng nhập đầy đủ các thông tin", "Thêm vật tư đã sử dụng thất bại")
    }
  }

  // materialUsageRows: any[] = [
  //   { material_name: '', amount: 0, usage_date: '', adder: '' }
  // ]

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
        this.materialUsageRows.push({ material_name: '', amount: 0, usage_date: '', adder: '' });
        console.log("Table row", this.materialUsageRows);
        this.materialUsageRows[this.materialUsageRows.length - 1].animationClass = 'new-row-animation';
        break;
      default:
        this.tableRows.push({ tooth: '', condition: '', procedure_name: '', khdongy: '', dongia: '', thanhtien: '', datra: '', conlai: '', tinhtrang: '' });
        console.log("Table row", this.tableRows);
        this.tableRows[this.tableRows.length - 1].animationClass = 'new-row-animation';
        break;
    }
  }

  removeRow(index: number, status: number) {
    switch (status) {
      case 1:
        this.materialUsageRows.splice(index, 1);
        break;
      default:
        this.tableRows.splice(index, 1);
        break;
    }
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

// interface Material {
//   material_name:string,
//   unit:number,
//   total:number
// }

interface material_usage_body {
  material_warehouse_id: any,
  treatment_course_id: string,
  examination_id: string,
  quantity: string,
  price: number,
  total_paid: number,
  description: string
}
