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
import { ResponseHandler } from "../../../libs/ResponseHandler";
import { IsThisSecondPipe } from 'ngx-date-fns';
import * as moment from 'moment-timezone';
import { MaterialService } from 'src/app/service/MaterialService/material.service';
import { LaboService } from 'src/app/service/LaboService/Labo.service';
import { getDate } from 'date-fns';
import { ConfirmationModalComponent } from '../../common/confirm-modal/confirm-modal.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PopupGenMedicalPdfComponent } from './popup-gen-medical-pdf/popup-gen-medical-pdf.component';
import { PatientService } from 'src/app/service/PatientService/patient.service';
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
  Patient:any;
  treatmentCourse_Id: string = "0";
  //Image
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;
  imageURL: string | ArrayBuffer = '';
  imageUrls: string[] = [];
  imageLink: string = '';
  showImages: boolean = false;
  showPopup = false;
  showInput = false;
  isAdd: boolean = false;
  records: any[] = [];
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
    description: '',
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
  staff_id: string = "0";
  doctorId: any;
  //Hover
  showSecondaryDatalist: boolean = false;
  sanitizer: any;
  constructor(
    private cognitoService: CognitoService, private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private tcService: TreatmentCourseService,
    private tcDetailService: TreatmentCourseDetailService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private materialUsageService: MaterialUsageService,
    private materialWarehoseService: MaterialWarehouseService,
    private materialService: MaterialService,
    private LaboService: LaboService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private medicalSupplyService: MedicalSupplyService
  ) {
    this.examination = {
      treatment_course_id: "",
      diagnosis: "",
      created_date: "",
      facility_id: "",
      description: "",
      staff_id: "",
      image: [] as ImageBody[],
      medicine: ""
    } as Examination;

    this.examination.created_date = new Date().toISOString().substring(0, 10);

    const facility = sessionStorage.getItem("locale");
    if (facility) {
      this.facility = "F-05";
    }
  }

  currentDate: any;
  listTreatmentCourse: any[] = [];
  orderer: any = "";

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    this.getPatient();
    const user = sessionStorage.getItem('username');
    if (user != null) {
      this.orderer = user;
    }
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];

    const id = sessionStorage.getItem('sub-id');
    if (id != null) {
      this.staff_id = id;
    }
    this.getLabos();
    this.getMaterialList();
    this.getListStaff();
    this.getMedicalProcedureList();
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDate = currentDateGMT7;
    this.tcService.getTreatmentCourse(this.patient_Id)
      .subscribe((res) => {
        this.listTreatmentCourse = res;
      })

  }

  getPatient() {
    this.patientService.getPatientById(this.patient_Id)
    .subscribe((res)=> {
        this.Patient = res;
    },
    (err) => {
      this.toastr.error(err.error.message, "Lỗi khi lấy thông tin bệnh nhân")
    }
    )
  }

  staff = {
    staffId: '',
    staffName: '',
    staffUserName: '',
    zoneInfor: '',
  }

  listStaffDisplay: any[] = [];

  listStaff: any[] = [];
  getListStaff() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.listStaff = res.message;
        console.log("ListStaff:", this.listStaff);
        this.listStaff.forEach((staff: any) => {
          this.staff = {
            staffId: '',
            staffName: '',
            staffUserName: '',
            zoneInfor: ''
          }
          this.staff.staffUserName = staff.Username;
          staff.Attributes.forEach((attr: any) => {
            if (attr.Name == 'sub') {
              this.staff.staffId = attr.Value;
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'zoneinfo') {
              this.staff.zoneInfor = attr.Value;
            }
          })
          const role = this.staff.zoneInfor.split(',');
          if (!role.includes("3")) {
            this.listStaffDisplay.push(this.staff);
          }
        })
      },
      )
  }

  ProcedureGroupList: any = [];
  ProcedureDetailList: any = [];
  list: any[] = [];
  UniqueList: string[] = [];
  groupProcedureO = {
    groupId: '',
    groupName: '',
    checked: true,
    procedure: [] as ProcedureOb[]
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

  listService: any[] = [];
  uniqueList: string[] = [];
  materialList: any[] = [];
  procedureGroupName: any;
  temporaryName: string = '';
  updateTemporaryName(record: any, event: any) {
    // event chứa tên vật liệu được chọn
    this.materialList.splice(0, this.materialList.length);
    this.listService.splice(0, this.listService.length);
    console.log(event);
    this.list.forEach((item: any) => {
      if (item.groupId == event) {
        //this.procedureGroupName = item.groupName;
        item.procedure.forEach((it: any) => {
          let proObject = {
            procedureId: it.procedureId,
            procedureName: it.procedureName,
            initPrice: it.initPrice
          };
          this.listService.push(proObject);
          proObject = {
            procedureId: "",
            procedureName: "",
            initPrice: ""
          };
        })
      }
    })
    const transformedMaterialList = this.listService.map((item: any) => {
      return {
        id: item.procedureId,
        tenVatLieu: item.procedureName,
        giaTien: item.initPrice
      };
    });
    this.materialList = transformedMaterialList;
    console.log(this.materialList);
  }

  serviceName: any;
  updateTemporaryServiceName(record: any, event: any) {
    const selectedMaterial = this.materialList.find((material: any) => material.id === event);
    if (selectedMaterial) {
      this.serviceName = selectedMaterial.tenVatLieu;
      record.price = selectedMaterial.giaTien;
      console.log(record.price);
    }
  }

  deleteRecord(index: number) {
    this.isAdd = false;
    this.records.splice(index, 1);
  }

  imageBody = {
    base64: true,
    image_data: '',
    description: ''
  }
  openConfirmationModal() {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.message = 'Bạn có chắc chắn muốn thêm lần khám mới không?';
    modalRef.componentInstance.confirmButtonText = 'Thêm mới';
    modalRef.componentInstance.cancelButtonText = 'Hủy';

    return modalRef.result;
  }
  postExamination() {
    this.openConfirmationModal().then((result) => {
      if (result === 'confirm') {
        const faci = sessionStorage.getItem('locale');
        if (faci != null) {
          this.examination.facility_id = 'F-05';
        }
        this.examination.treatment_course_id = this.treatmentCourse_Id;
        this.examination.staff_id = this.staff_id;
        this.examination.created_date = this.currentDate;
        this.examination.medicine = JSON.stringify(this.recordsMedicine);
        if (this.recordsImage.length > 0) {
          this.recordsImage.forEach((item: any) => {
            if (item.typeImage != null) {
              if (item.typeImage == 1) {
                let img = item.imageInsert.split('base64,');
                this.imageBody = {
                  base64: true,
                  image_data: img[1],
                  description: item.description
                }
              } else {
                this.imageBody = {
                  base64: false,
                  image_data: item.imageInsert,
                  description: item.description
                }
              }
              this.examination.image.push(this.imageBody);
            }
          })
        }
        this.tcDetailService.postExamination(this.examination)
          .subscribe((res) => {
            this.toastr.success(res.message, 'Thêm lần khám thành công');
            console.log("ExaminationId Response: ", res.data.examination_id);
            const examinationId = res.data.examination_id;
            let isSuccess = false;
            if (this.records.length > 0) {
              this.records.forEach((el) => {
                el.examination_id = examinationId;
                el.price = el.price * el.quantity;
                el.total_paid = 0;
              })
              this.materialUsageService.postMaterialUsage(this.records)
                .subscribe((res) => {
                  isSuccess = true;
                  this.toastr.success(res.message, 'Thêm Thủ thuật thành công');
                },
                  (err) => {
                    isSuccess = false;
                    console.log(err);
                    this.toastr.error(err.error.message, 'Thêm Thủ thuật thất bại');
                  })
            }
            if (this.recordsSpecimen.length > 0) {
              this.recordsSpecimen.forEach((item: any) => {
                item.patient_id = this.patient_Id;
                item.facility_id = 'F-05';
                item.treatment_course_id = this.treatmentCourse_Id;
                item.orderer = this.orderer
                item.order_date = this.dateToTimestamp(item.order_date);
                item.received_date = this.dateToTimestamp(item.received_date);
                item.used_date = this.dateToTimestamp(item.used_date);
                this.medicalSupplyService.addMedicalSupply(item).subscribe(data => {
                  isSuccess = true;
                  this.toastr.success(data.message, 'Thêm mẫu vật sử dụng thành công');
                }
                  ,
                  (err) => {
                    isSuccess = false;
                    console.log(err);
                    this.toastr.error(err.error.message, 'Thêm mẫu vật thất bại');
                  }
                )
              })
            }
            if (this.recordsMaterial.length > 0) {
              this.recordsMaterial.forEach((el) => {
                el.examination_id = examinationId
              })
              this.materialUsageService.postMaterialUsage(this.recordsMaterial)
                .subscribe((res) => {
                  isSuccess = true;
                  this.toastr.success(res.message, 'Thêm Vật liệu sử dụng thành công');
                },
                  (err) => {
                    isSuccess = false;
                    console.log(err);
                    this.toastr.error(err.error.message, 'Thêm Vật liệu thất bại');
                  })
            }
            console.log(isSuccess);
            this.isPopup1Visible = true;
          },
            (error) => {
              ResponseHandler.HANDLE_HTTP_STATUS(this.tcDetailService.apiUrl + "/examination", error);
            }
          )
      }
    })
  }
  test() {
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
    this.router.navigate([href + this.patient_Id]);
  }

  toggleAdd() {
    this.isAdd = !this.isAdd;
    if (this.isAdd) {
      this.records.push({
        treatment_course_id: this.treatmentCourse_Id,
        medical_procedure_id: '',
        examination_id: '',
        quantity: 1,
        price: '',
        total_paid: '',
        description: '',
      });
    }
  }

  recordsMaterial: any[] = [];
  isAddMaterial: boolean = false;
  toggleAddMaterial() {
    this.isAddMaterial = !this.isAddMaterial;
    if (this.isAddMaterial) {
      this.recordsMaterial.push({
        material_warehouse_id: '',
        treatment_course_id: this.treatmentCourse_Id,
        examination_id: '',
        quantity: '1',
        price: '',
        total_paid: '',
        description: '',
      })
    }
  }

  wareHouseMaterial = {
    material_warehouse_id: '',
    materialId: '',
    materialName: '',
    quantity: 0,
    unitPrice: 0,
  }

  results: any[] = []
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
    })
  }

  materialName: any;
  updateTemporaryNameMaterial(record: any, event: any) {
    const selectedMaterial = this.results.find((material: any) => material.material_warehouse_id === event);
    console.log("check selected", selectedMaterial);
    if (selectedMaterial) {
      record.price = selectedMaterial.unitPrice;
      record.totalPaid = selectedMaterial.unitPrice;
    }
  }
  laboName:string = '';
  updateTemporaryLaboName(record:any, event:any){
    const selectedLabo = this.listLabo.find((labo:any) => labo.labo_id === event);
    if (selectedLabo){
      this.laboName = selectedLabo.name;
    }
  }
  deleteRecordMaterial(index: any) {
    this.isAddMaterial = false;
    this.recordsMaterial.splice(index, 1);
  }

  //image
  isAddImage: boolean = false;
  recordImage = {
    id: 0,
    typeImage: "",
    imageInsert: "",
    description: ""
  }
  showPrescriptionContent: boolean = false;
  recordsImage: any[] = []
  id: number = 0;
  toggleAddImage() {
    this.isAddImage = !this.isAddImage;
    if (this.isAddImage) {
      const Id = this.id++;
      this.recordImage = {
        id: Id,
        typeImage: "1",
        imageInsert: "../../../../../../assets/img/noImage.png",
        description: ""
      }
      this.recordsImage.push(this.recordImage);
    }
  }


  modalOption: NgbModalOptions = {
    size: 'lg',
    centered: true
  }

  openGeneratePdfModal() {
    const modalRef = this.modalService.open(PopupGenMedicalPdfComponent, this.modalOption);
    modalRef.componentInstance.Medical = this.recordsMedicine;
    modalRef.componentInstance.Patient = this.Patient;
  }

  deleteRecordImage(index: any) {
    this.isAddImage = false;
    this.recordsImage.splice(index, 1);
  }

  currentIndex: any;
  onChangeIndex(index: any) {
    this.currentIndex = index;
  }

  inputImageUrlInsert(event: any) {
    this.recordImage = {
      id: this.currentIndex,
      typeImage: "2",
      imageInsert: event.target.value,
      description: ""
    }
  }

  @ViewChild('fileInput') fileInputVariable!: ElementRef;
  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Data = e.target.result;
        this.recordImage = {
          id: this.currentIndex,
          typeImage: "1",
          imageInsert: base64Data,
          description: ""
        }
      };
      reader.readAsDataURL(file);
    }
  }

  addImageUrl() {
    this.recordsImage.forEach((item: any) => {
      if (item.id == this.currentIndex) {
        item.typeImage = this.recordImage.typeImage;
        item.imageInsert = this.recordImage.imageInsert;
      }
    })
    this.recordImage = {
      id: 0,
      typeImage: "1",
      imageInsert: "",
      description: ""
    }
  }

  isAddSpeci: boolean = false;
  specimenBody = {
    name: '',
    type: '',
    received_date: '',
    orderer: '',
    used_date: '',
    quantity: '',
    unit_price: '',
    order_date: '',
    patient_id: '',
    facility_id: '',
    labo_id: '',
    treatment_course_id: ''
  }

  recordsSpecimen: any[] = [];
  toggleAddSpecime() {
    this.isAddSpeci = !this.isAddSpeci;
    if (this.isAddSpeci) {
      var now = new Date();
      this.specimenBody.order_date = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
      this.recordsSpecimen.push(this.specimenBody);
    }
  }

  listLabo: any[] = []
  listDisplay: any[] = []
  laboO = {
    labo_id: '',
    name: ''
  }

  deleteRecordSpeciment(index: any) {
    this.isAddSpeci = false;
    this.recordsSpecimen.splice(index, 1);
  }

  getLabos() {
    this.LaboService.getLabos()
      .subscribe((res) => {
        this.listLabo = res.data;
        this.listLabo.forEach((item: any) => {
          let laboO = {
            labo_id: item.labo_id,
            name: item.name
          }
          this.listDisplay.push(laboO);
        })
      })
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  selectMedicine: string = '0';
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

  recordsMedicine: any[] = [];
  isAddMedicine: boolean = false;
  toggleAddMedicine() {
    this.isAddMedicine = !this.isAddMedicine;
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
  deleteRecordMedicine(index: any) {
    this.isAddMedicine = false;
    this.recordsMedicine.splice(index, 1);
  }
}

interface ProcedureGroup {
  id: string;
  name: string;
}

interface ProcedureOb {
  procedureId: string;
  procedureName: string;
  initPrice: string;
  price: string;
  checked: Boolean;
}

interface ImageBody {
  base64: boolean,
  image_data: string,
  description: string,
}
