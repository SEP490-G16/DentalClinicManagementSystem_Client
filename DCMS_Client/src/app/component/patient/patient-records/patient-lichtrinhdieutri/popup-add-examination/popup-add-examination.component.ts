import { Component, HostListener, ViewChild, ElementRef, OnInit } from '@angular/core';
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
  imageURL: string | ArrayBuffer = '';
  imageUrls: string[] = [];
  showPopup = false;
  showInput = false;

  Body_Medical_Procedure = {
    medical_procedure_group_id: '',
    name: '',
    price: '',
    description: ''
  }

  Body_Medical_Supply = {
    type: "",
    quantity: 0,
    unit_price: 0,
    order_date: 0,
    received_date: 0,
    receiver: "",
    warranty: 0,
    description: "",
    facility_id: "",
    labo_id: "",
    used_date: "",
    patient_id: "",
  }

  tableRows: any[] = [
    { tooth: '', condition: '', procedure_name: '', khdongy: '', dongia: '', thanhtien: '', datra: '', conlai: '', tinhtrang: '' }
  ];

  supplyOrderRows: any[] = [
    { tooth: '', material: '', supply: '', amount: '', dongia: '', total: '', discount: '', order_date: '', order: '', status: '' }
  ]
  materialUsageRows: any[] = [
    { material_name: '', amount: 0, usage_date: '', adder: '' }
  ]

  patient_Id: string = "";
  treatmentCourse_Id: string = "";
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;

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

    private eRef: ElementRef
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
  }


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
  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];

    console.log("Patient Id", this.patient_Id);
    console.log("TreatmentCourse Id", this.treatmentCourse_Id);
    this.staff_id = this.doctors[0].doctorid;

    this.Body_Medical_Supply.patient_id = this.patient_Id;

    const facitlityId = sessionStorage.getItem('locale');
    if (facitlityId != undefined) {
      this.Body_Medical_Supply.patient_id = facitlityId;
    }
    this.getTreatmentCourse();

  }

  getTreatmentCourse() {
    this.tcService.getTreatmentCourse(this.patient_Id)
      .subscribe((data) => {
        console.log("data treatment: ", data);
        this.treatmentCourse = data;
        console.log("treatment course: ", this.treatmentCourse);
      })
  }

  postExamination() {
    this.examination.treatment_course_id = this.treatmentCourse_Id;
    this.examination.staff_id = this.staff_id;
    const facility: string | null = sessionStorage.getItem('locale');
    this.examination.facility_id = "F-14"; // Sử dụng toán tử '||' để gán giá trị mặc định nếu facility là null
    this.examination.xRayImage = this.imageUrls.join(' ');
    console.log("post", this.examination);
    this.tcDetailService.postExamination(this.examination)
      .subscribe((res) => {
        this.toastr.success(res.message, 'Thêm lần khám thành công');
      },
        (err) => {
          this.toastr.error(err.error.message, 'Thêm lần khám thất bại');
        })

    // this.medicalProcedureService.addMedicalProcedure()

    this.Body_Medical_Supply.type = "1",
    this.Body_Medical_Supply.quantity = this.supplyOrderRows[0].amount,
    this.Body_Medical_Supply.unit_price = this.supplyOrderRows[0].dongia,
    this.Body_Medical_Supply.order_date = this.supplyOrderRows[0].order_date,

    this.medicalSupplyService.addMedicalSupply(this.Body_Medical_Supply)
    .subscribe((res) => {

    },
    (err) => {
      this.toastr.error(err.error.message, "Thêm Xưởng và vật tư thất bại");
    })





  }
  // supplyOrderRows: any[] = [
  //   { tooth: '', material: '', supply: '', amount: '', dongia: '', total: '', discount: '', order_date: '', order: '', status: '' }
  // ]

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

  togglePopup() {
    this.showPopup = !this.showPopup;
  }
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      // Xử lý ảnh đầu tiên
      const reader = new FileReader();
      reader.onload = (e: any) => { this.imageURL = e.target.result; };
      reader.readAsDataURL(files[0]);

      // Xử lý các ảnh tiếp theo (nếu có)
      this.imageUrls = [];
      for (let i = 1; i < files.length; i++) {
        const fileReader = new FileReader();
        fileReader.onload = (e: any) => { this.imageUrls.push(e.target.result); };
        fileReader.readAsDataURL(files[i]);
      }
    }
  }

  removeImage(urlToRemove: string) {
    this.imageUrls = this.imageUrls.filter(url => url !== urlToRemove);
  }

  //Xử lý với bảng
  addNewRow(status: number) {
    switch (status) {
      case 2:
        this.supplyOrderRows.push({ tooth: '', material: '', supply: '', amount: '', dongia: '', total: '', discount: '', order_date: '', order: '', status: '' });
        console.log("Table row", this.supplyOrderRows);
        this.supplyOrderRows[this.supplyOrderRows.length - 1].animationClass = 'new-row-animation';
        break;
      case 3:
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
      case 2:
        this.supplyOrderRows.splice(index, 1);
        break;
      case 3:
        this.materialUsageRows.splice(index, 1);
        break;
      default:
        this.tableRows.splice(index, 1);
        break;
    }
  }

  isHovering: boolean = false;
  animateIcon(event: Event) {
    const target = event.target as HTMLElement;
    target.style.animation = 'clickAnimation 0.5s';
    target.addEventListener('animationend', () => {
      target.style.animation = '';
    });
  }
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
