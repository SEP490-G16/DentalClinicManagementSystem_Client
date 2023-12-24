import { TreatmentCourseDetailService } from './../../../../service/ITreatmentCourseDetail/treatmentcoureDetail.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import { CognitoService } from 'src/app/service/cognito.service';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import { ResponseHandler } from "../../../utils/libs/ResponseHandler";
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteModalComponent } from 'src/app/component/utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
import * as moment from "moment-timezone";
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import { MaterialUsageService } from "../../../../service/MaterialUsage/MaterialUsageService.component";
import { PatientService } from "../../../../service/PatientService/patient.service";
import { MaterialService } from "../../../../service/MaterialService/material.service";
import { MedicalSupplyService } from "../../../../service/MedicalSupplyService/medical-supply.service";
import { LaboService } from "../../../../service/LaboService/Labo.service";
import {
  ConfirmAddTreatmentcourseComponent
} from "../../../utils/pop-up/common/confirm-add-treatmentcourse/confirm-add-treatmentcourse.component";
import {
  PopupGenMedicalPdfComponent
} from "../../../utils/pop-up/patient/popup-add-examination/popup-gen-medical-pdf/popup-gen-medical-pdf.component";
@Component({
  selector: 'app-patient-lichtrinhdieutri',
  templateUrl: './patient-lichtrinhdieutri.component.html',
  styleUrls: ['./patient-lichtrinhdieutri.component.css']
})
export class PatientLichtrinhdieutriComponent implements OnInit {
  isCallApi:boolean = false;
  loading: boolean = false;
  currentDate: any;
  id: string = "";
  examinations: any;
  patientName: any;
  ITreatmentCourse: any[] = [];
  collapsedStates: { [key: string]: boolean } = {};
  roleId: string[] = [];
  ProcedureGroupList: any = [];
  Post_TreatmentCourse: Partial<IBodyTreatmentCourse> = {};
  Post_Procedure_Material_Usage: any[] = [];
  userName: any;
  facility: any;
  valdateSpecimens: any = {}
  isSubmittedSpecimens: boolean = false;
  validateMedicine: any = {}
  TreatmentCouseBody = {
    name: '',
    lydo: '',
    chuandoan: '',
    nguyennhan: '',
    thuoc: '',
    luuy: ''
  }
  validateTreatmentCouse = {
    name: ''
  }
  isSubmittedTreatmentCourse: boolean = false;
  groupProcedureO = {
    groupId: '',
    groupName: '',
    checked: true,
    procedure: [] as ProcedureOb[],
    isExpand: false,
  }
  UniqueList: string[] = [];
  currentDateBody: any;
  constructor(
    private cognitoService: CognitoService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private treatmentCourseService: TreatmentCourseService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private procedureMaterialService: MaterialUsageService,
    private modelService: NgbModal,
    private patientService: PatientService,
    private commonService: CommonService,
    private materialUsageService: MaterialService,
    private LaboService: LaboService,
    private medicalSupplyService: MedicalSupplyService,
    private TreatmentCourseDetailService: TreatmentCourseDetailService,
    private modalService: NgbModal
  ) { }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.id);
  }
  navigateHref2() {
    this.router.navigate([`/benhnhan/danhsach/tab/lichtrinhdieutri/${this.id}/themngaykham`]);
  }
  name: any
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.name = sessionStorage.getItem('patient');
    if (this.name) {
      this.name = JSON.parse(this.name);
      this.patientName = this.name.patient_name;
    } else {
      this.patientService.getPatientById(this.id).subscribe((patient: any) => {
        console.log("Call api Patient: ", patient);
        this.patientName = patient.patient_name;
        sessionStorage.setItem('patient', JSON.stringify(patient));
      },
      err => {
        this.toastr.error("Bệnh nhận đã bị xóa khỏi hệ thống", "Lấy thông tin bệnh nhân thất bại")
      }
      )
    }
    let examination_reason = sessionStorage.getItem("examination_reason");
    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
    this.TreatmentCouseBody.lydo = examination_reason || "";
    sessionStorage.removeItem("examination_reason");
    this.getTreatmentCourse();
    this.onGetXRayImage(this.id)
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh');
    const day = currentDateGMT7.date();
    const month = currentDateGMT7.month() + 1; // Tháng bắt đầu từ 0
    const year = currentDateGMT7.year();
    this.currentDate = day + "/" + month + "/" + year;
    this.getPatient();
    this.getMedicalProcedureList();
    this.getLabo();
    var user = sessionStorage.getItem('username');
    if (user != null) {
      this.userName = user;
    }

    var faci = sessionStorage.getItem('locale');
    if (faci != null) {
      this.facility = faci;
    }
    const currenttDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDateBody = currenttDateGMT7;
  }

  list: any[] = [];
  showDropDown: boolean = false;
  getMedicalProcedureList() {
    this.medicalProcedureGroupService.getMedicalProcedureGroupListandDetail().subscribe(data => {
      this.ProcedureGroupList = data.data;
      console.log("Loai dieu tri: ", this.ProcedureGroupList);
      this.ProcedureGroupList.forEach((item: any) => {
        const currentO = item;
        if (!this.UniqueList.includes(currentO.mg_id)) {
          this.UniqueList.push(currentO.mg_id);
          let proObject = {
            procedureId: currentO.mp_id,
            procedureName: currentO.mp_name,
            initPrice: currentO.mp_price,
            price: currentO.mp_price,
            quantity: 1,
            laboId: "0",
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
            quantity: 1,
            laboId: "0",
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
                quantity: 1,
                laboId: "0",
                checked: false,
                isExpand: false,
              };
              item.procedure.push(proObject);
              proObject = {
                procedureId: currentO.mp_id,
                procedureName: currentO.mp_name,
                initPrice: currentO.mp_price,
                price: '',
                quantity: 1,
                laboId: "0",
                checked: false,
                isExpand: false
              };
            }
          })
        }
      })
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalProcedureGroupService.url + "/medical-procedure-group-with-detail", error);
      })
  }
  getSelectedValue(it: any) {
    this.list.forEach((item: any) => {
      if (item.groupId == it.groupId) {
        item.checked = !it.checked;
      }
    })
  }
  checkListImport: string[] = [];
  checkProcedureUse(it: any) {
    this.list.forEach((item: any) => {
      item.procedure.forEach((pro: any) => {
        if (pro.procedureId == it.procedureId) {
          pro.checked = !it.checked;

          this.Post_Procedure_Material_Usage.forEach((item: any) => {
            if (item.medical_procedure_id == it.procedureId) {
              item.price = it.price;
              item.quantity = 1;
            }
          })
        }
        if (pro.checked == true && !this.checkListImport.includes(it.procedureId)) {
          this.checkListImport.push(it.procedureId);
          let materialUsage = {
            medical_procedure_id: it.procedureId,
            treatment_course_id: '',
            quantity: it.quantity,
            price: it.price,
            total_paid: '',
            description: `0 ${pro.initPrice}`
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
  changePrice(gro: any, event: any) {
    this.Post_Procedure_Material_Usage.forEach((item: any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.price = event.target.value;
      }
    })
  }
  changeQuantity(gro: any, event: any) {
    this.Post_Procedure_Material_Usage.forEach((item: any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.quantity = event.target.value;
      }
    })
  }
  changeLabo(gro: any) {
    this.Post_Procedure_Material_Usage.forEach((item: any) => {
      if (item.medical_procedure_id == gro.procedureId) {
        item.description = `${gro.laboId} ${gro.initPrice}`;
      }
    })
  }
  Labos: any[] = []
  getLabo() {
    this.LaboService.getLabos()
      .subscribe((res) => {
        this.Labos = res.data;
        localStorage.setItem("ListLabo", JSON.stringify(this.Labos))
      })
  }

  postTreatmentCourse() {
    this.resetValidateTreatmentCourse();
    this.isCallApi = true;

    this.Post_TreatmentCourse.patient_id = this.id;
    this.Post_TreatmentCourse.name = this.TreatmentCouseBody.name;
    this.Post_TreatmentCourse.chief_complaint = this.TreatmentCouseBody.lydo;
    this.Post_TreatmentCourse.differential_diagnosis = this.TreatmentCouseBody.nguyennhan;
    this.Post_TreatmentCourse.provisional_diagnosis = this.TreatmentCouseBody.chuandoan;
    this.Post_TreatmentCourse.description = this.TreatmentCouseBody.luuy;
    this.Post_TreatmentCourse.prescription = JSON.stringify(this.recordsMedicine);
    //this.resetValidateSpecimens();
    this.list.forEach((item: any, itemIndex: number) => {
      item.procedure.forEach((it: any, procIndex: number) => {
        const key = `soLuong_${itemIndex}_${procIndex}`;
        let soLuong = it.quantity
        if (!this.checkNumber(soLuong)) {
          this.valdateSpecimens[key] = "Nhập số lượng > 0!";
          this.isSubmittedSpecimens = true
        }
        else {
          if (this.valdateSpecimens[key]) {
            delete this.valdateSpecimens[key];
          }
        }
      })
    })
    // if (this.isSubmittedSpecimens){
    //   return;
    // }
    if (Object.keys(this.valdateSpecimens).length > 0) {
      this.isSubmittedSpecimens = true;
      return;
    }
    this.recordsMedicine.forEach((item: any, itemIndex: any) => {
      const key = `soLuong_${itemIndex}`;
      if (!this.checkNumber(item.soLuong)) {
        this.validateMedicine[key] = "Nhập số lượng > 0!";
      }
      else {
        if (this.validateMedicine[key]) {
          delete this.validateMedicine[key];
        }
      }
    })
    if (Object.keys(this.validateMedicine).length > 0) {
      return;
    }
    console.log("Procedure Post: ", this.Post_Procedure_Material_Usage);
    console.log("List: ", this.list);
    console.log("Post treatment: ", this, this.Post_TreatmentCourse);
    this.treatmentCourseService.postTreatmentCourse(this.Post_TreatmentCourse).
      subscribe((res) => {
        this.isCallApi = false;

        this.toastr.success(res.message, "Thêm liệu trình thành công");
        if (this.Post_Procedure_Material_Usage.length > 0) {

          this.Post_Procedure_Material_Usage.forEach((item) => {
            item.treatment_course_id = res.treatment_course_id;
            // item.price = item.price * item.quantity
            this.procedureMaterialService.postProcedureMaterialUsage(item)
              .subscribe((res) => {
                this.toastr.success("Thêm Thủ thuật thành công");
              }, (err) => {
                this.toastr.error(err.error.message, "Thêm Thủ thuật thất bại");
              })
          })
        }

        this.list.forEach((item: any) => {
          item.procedure.forEach((it: any) => {
            if (it.laboId != "0") {
              let specmenObject = {
                name: it.procedureName,
                type: '',
                received_date: '',
                orderer: this.userName,
                used_date: '',
                quantity: it.quantity,
                unit_price: it.price,
                order_date: this.dateToTimestamp(this.currentDate),
                patient_id: this.id,
                facility_id: this.facility,
                labo_id: it.laboId,
                treatment_course_id: res.treatment_course_id
              }
              this.medicalSupplyService.addMedicalSupply(specmenObject).subscribe(data => {
                this.toastr.success(data.message, 'Thêm mẫu vật sử dụng thành công');
              })
            }
          })
        })
        const modalRef = this.modelService.open(ConfirmAddTreatmentcourseComponent);
        modalRef.result.then((res: any) => {
          switch (res) {
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
          this.isCallApi = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl + "/treatment-course", error);
        }
      )
  }

  convertToFormattedDate(dateString: string): string {
    const dateObject = new Date(dateString);

    if (isNaN(dateObject.getTime())) {
      return '';
    }

    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1; // Tháng bắt đầu từ 0
    const day = dateObject.getDate();

    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  }


  close() {
    this.Post_TreatmentCourse = {}
    this.Post_Procedure_Material_Usage = []
  }
  isExpand: boolean = false;
  toggleExpand(check: any) {
    this.list.forEach((item: any) => {
      if (item.groupId == check.groupId) {
        item.isExpand = !check.isExpand;
      }
    })
  }
  goAppointment(): void {
    this.router.navigate(["/benhnhan/danhsach/tab/lichhen/" + this.id]);
  }
  goPayment(): void {
    this.router.navigate(["/benhnhan/danhsach/tab/thanhtoan/" + this.id]);
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
        ten: '',
        soLuong: '',
        donvi: '',
        lieuDung: '',
        ghiChu: ''
      })
    }
  }
  deleteRecordMedicine(index: any) {
    //this.isAddMedicine = false;
    this.recordsMedicine.splice(index, 1);
  }
  Patient: any;
  getPatient() {
    this.patientService.getPatientById(this.id)
      .subscribe((res) => {
        this.Patient = res;
      },
        (err) => {
          this.toastr.error(err.error.message, "Lỗi khi lấy thông tin bệnh nhân")
        }
      )
  }
  modalOption: NgbModalOptions = {
    size: 'lg',
    centered: true
  }
  openGeneratePdfModal() {
    const modalRef = this.modelService.open(PopupGenMedicalPdfComponent, this.modalOption);
    modalRef.componentInstance.Disagnosis = this.TreatmentCouseBody.chuandoan;
    modalRef.componentInstance.Medical = this.recordsMedicine;
    modalRef.componentInstance.Patient = this.Patient;
  }
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm';
    const timeZone = 'Asia/Ho_Chi_Minh';
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
  private checkNumber(number: any): boolean {
    return /^[1-9]\d*$/.test(number);
  }
  resetValidateTreatmentCourse() {
    this.validateTreatmentCouse = {
      name: ''
    }
    this.isSubmittedTreatmentCourse = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.showPopup && !this.containerRef.nativeElement.contains(event.target)) {
      this.showPopup = false;
    }
  }
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;
  showPopup = false;
  isAddImage: boolean = false;
  recordImage = {
    id: 0,
    typeImage: "",
    imageInsert: "",
    description: ""
  }
  recordsImage: any[] = []
  idImage: number = 0;
  imageLink: string = '';
  toggleAddImage() {
    this.isAddImage = true;
    if (this.isAddImage) {
      var length = this.recordsImage.length
      var id = length++;
      this.recordImage = {
        id: id,
        typeImage: "1",
        imageInsert: "../../../../../../assets/img/noImage.png",
        description: ""
      }
      this.recordsImage.push(this.recordImage);
    }
  }
  deleteRecordImage(index: any) {
    this.isAddImage = false;
    this.recordsImage.splice(index, 1);
  }
  currentIndex: any;
  onChangeIndex(index: any) {
    this.currentIndex = index;
    console.log(this.currentIndex);
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
    console.log(this.recordImage);
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
  showZoomedInImage = false;

  zoomImage() {
    this.showZoomedInImage = true;
  }

  closeZoom() {
    this.showZoomedInImage = false;
  }

  response: any;
  listImageXRay: any[] = [];
  onGetXRayImage(id: any) {
    this.treatmentCourseService.getImageXRay(id).subscribe((res) => {
      this.response = res
      this.listImageXRay = this.response.data;
      this.listImageXRay.forEach((item: any) => {
        var length = this.recordsImage.length
        var id = length++;
        this.recordImage = {
          id: id,
          typeImage: "2",
          imageInsert: item.url,
          description: item.description
        }
        this.recordsImage.push(this.recordImage);
      })
    })
  }

  imageBody = {
    base64: true,
    image_data: '',
    description: ''
  }
  listInsertImage: any[] = [];
  onPostXRayImage() {
    console.log("cehck list image", this.recordsImage);
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
          this.listInsertImage.push(this.imageBody);
        }
      })
    }
    this.treatmentCourseService.postImageXRay(this.id, this.listInsertImage).subscribe((data) => {
      this.toastr.success('Thêm mới ảnh x-quang thành công');
    })
    this.isAddImage = false;
  }

  onDeleteXRayImage(image: any) {
    this.recordsImage.forEach((item: any) => {
      if (item.id == image.id) {
        this.treatmentCourseService.deleteImageXRay(this.id, item.imageInsert).subscribe((data) => {
          this.toastr.success('Xóa ảnh x-quang thành công');
        })
      }
    })
  }

  getTreatmentCourse() {
    this.loading = true;
    this.treatmentCourseService.getTreatmentCourse(this.id)
      .subscribe((data) => {
        this.ITreatmentCourse = data;
        console.log("ITreatmentCourse: ", data);
        this.ITreatmentCourse.forEach((course: any) => {
          this.collapsedStates[course.treatment_course_id] = true; // Khởi tạo trạng thái collapsed
        });
        this.ITreatmentCourse.sort((a: any, b: any) => {
          const dateA = new Date(a.created_date).getTime();
          const dateB = new Date(b.created_date).getTime();
          return dateB - dateA;
        });
        this.checkHTLK();
        this.loading = false;
      },
        error => {
          this.loading = false;
          ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl + "/treatment-course/patient-id/" + this.id, error);
        }
      )
  }

  listProcedure: any
  checkHTLK() {
    this.ITreatmentCourse.forEach((Course: any) => {
      this.procedureMaterialService.getMaterialUsage_By_TreatmentCourse(Course.treatment_course_id)
        .subscribe((data: any) => {
          this.listProcedure = data.data;
          console.log("List procedure: ", this.listProcedure);

          Course.isCompleted = Course.name && this.listProcedure.length > 0;
        })
    })
  }


  toggleStates: { [key: string]: boolean } = {};
  toggleCollapse(courseId: string) {
    if (this.toggleStates[courseId] === undefined) {
      this.toggleStates[courseId] = false;
    }
    this.toggleStates[courseId] = !this.toggleStates[courseId];
    this.TreatmentCourseDetailService.getTreatmentCourseDetail(courseId).subscribe(
      data => {
        this.examinations = data.data;
        console.log(this.examinations);
      },
      error => {
      }
    );
  }

  TreatmentCourse: any;
  editTreatmentCourse(course: any) {
    this.TreatmentCourse = course;
    console.log("Edit: ", this.TreatmentCourse);
  }

  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  deleteTreatmentCourse(treatment_course_id: string, course: any) {
    this.openConfirmationModal('Bạn có muốn xóa đợt khám này không?').then((result) => {
      if (result === true) {
        this.treatmentCourseService.deleteTreatmentCourse(treatment_course_id)
          .subscribe((res) => {
            this.toastr.success(res.message, 'Xóa đợt khám thành công');
            const index = this.ITreatmentCourse.findIndex((ex: any) => ex.treatment_course_id === treatment_course_id);
            if (index !== -1) {
              this.ITreatmentCourse.splice(index, 1);
            }
            this.getListMaterialusageByTreatmentCourse(treatment_course_id);
            this.loading = false;
          },
            (error) => {
              //this.toastr.error(err.error.message, 'Xóa liệu trình thất bại');
              ResponseHandler.HANDLE_HTTP_STATUS(this.treatmentCourseService.apiUrl + "/treatment-course/" + treatment_course_id, error);
            }
          )
      }
    });
  }

  getListMaterialusageByTreatmentCourse(treatment_course_id: any) {
    let MaterialUsageList = [];
    this.procedureMaterialService.getMaterialUsage_By_TreatmentCourse(treatment_course_id).subscribe((data) => {
      MaterialUsageList = data.data;
      if (MaterialUsageList.length > 0) {
        MaterialUsageList.forEach((mu: any) => {
          this.procedureMaterialService.deleteMaterialUsage(mu.material_usage_id)
            .subscribe(res => {
              this.toastr.success("Xóa thủ thuật thành công");
            },
              err => {
                this.toastr.error("Xóa thủ thuật thất bại");
              })
        })
      }
    })
  }

  deleteExamination(examination_id: string) {
    this.openConfirmationModal('Bạn có muốn xóa lần khám này không?').then((result) => {
      if (result === true) {
        this.TreatmentCourseDetailService.deleteExamination(examination_id)
          .subscribe(() => {
            this.toastr.success('Xóa Lần khám thành công!');

            const index = this.examinations.findIndex((ex: any) => ex.examination_id === examination_id);
            if (index !== -1) {
              this.examinations.splice(index, 1);
            }
            this.loading = false;
          },
            (error) => {
              //this.toastr.error(err.error.message, "Xóa lần khám thất bại!");
              ResponseHandler.HANDLE_HTTP_STATUS(this.TreatmentCourseDetailService.apiUrl + "/examination/" + examination_id, error);
            })
      }
    });
  }

  TreatmentCourseDetail: any;

  navigateAddExamination(tcId: string) {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/themlankham/' + tcId]);
  }

  navigateEditExamination(examination: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri/' + this.id + '/sualankham/' + examination.treatment_course_id + '/' + examination.examination_id]);
  }

}
interface IBodyTreatmentCourse {
  patient_id: string,
  name: string,
  description: string,
  chief_complaint: string;
  provisional_diagnosis: string;
  differential_diagnosis: string;
  prescription: string;
}

interface ProcedureOb {
  procedureId: string;
  procedureName: string;
  initPrice: string;
  price: string;
  checked: Boolean;
}
