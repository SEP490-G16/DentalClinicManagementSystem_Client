import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITreatmentCourse } from 'src/app/model/ITreatment-Course';
import { Examination } from 'src/app/model/ITreatmentCourseDetail';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  Procedure_Material_Usage_Body: any[] = []

  pg_id: any;
  //Thêm Vật liệu sử dụng Table
  MaterialWarehouse_Array: any[] = [];
  remainMaterial: number = 0;
  Material_Usage_Body: any[] = [];

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
    private tcService: TreatmentCourseService,
    private tcDetailService: TreatmentCourseDetailService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private materialUsageService: MaterialUsageService,
    private materialWarehoseService: MaterialWarehouseService,
    private materialService: MaterialService,
    private LaboService: LaboService,
    private cdr: ChangeDetectorRef,
    private medicalSupplyService: MedicalSupplyService,
    private modalService: NgbModal
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

  currentDate: any;
  listTreatmentCourse: any[] = [];
  orderer: any = "";
  examinationId: any = "";

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    const user = sessionStorage.getItem('username');
    if (user != null) {
      this.orderer = user;
    }
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];
    this.examinationId = this.route.snapshot.params['examinationId'];
    const id = sessionStorage.getItem('sub-id');
    if (id != null) {
      this.staff_id = id;
    }
    this.getExaminationById();
    this.getLabos();
    this.getMaterialList();
    this.getListStaff();
    this.getMedicalProcedureList();
    this.getMedicalandProcedure()
    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.currentDate = currentDateGMT7;
    this.tcService.getTreatmentCourse(this.patient_Id)
      .subscribe((res) => {
        this.listTreatmentCourse = res;
      })
  }

  examininationSelect: any;
  imageContent: any;
  imageDescription: any;

  getExaminationById() {
    this.tcDetailService.getExamination(this.examinationId).subscribe((data) => {
      console.log("data: ", data);
      this.examininationSelect = data.data[0];
      this.examination.diagnosis = this.examininationSelect.diagnosis;
      this.examination.medicine = this.examininationSelect.medicine;
      this.imageContent = this.examininationSelect['x-ray-image'].split('><');
      this.imageDescription = this.examininationSelect['x-ray-image-des'].split('||');
      this.imageContent.forEach((item: any) => {
        this.id++;
        this.recordImage = {
          id: this.id,
          typeImage: "",
          imageInsert: item,
          description: ""
        }
        this.recordsImage.push(this.recordImage);
        this.recordImage = {
          id: 0,
          typeImage: "",
          imageInsert: "",
          description: ""
        }
      })

      this.imageDescription.forEach((item: any) => {
        const im = item.split('><');
        for (let i = 0; i < im.length; i++) {
          this.recordsImage.forEach((img: any) => {
            if (im[i] % 2 != 0) {
              img.description = im[i];
            }
          })
        }
      })
    },
      (error) => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.tcDetailService.apiUrl + "/examination/" + this.examinationId, error);
      })
  }

  getPredureGroupId(id: any): any {
    this.list.forEach((item: any) => {
      item.procedure.forEach((it: any) => {
        if (it.procedureId == id) {
          return item.groupId;
        }
      })
    })
  }

  getProcedureGroupName(id: any): any {
    this.list.forEach((item: any) => {
      if (item.groupId == id) {
        return item.groupName;
      }
    })
  }

  listResponse: any[] = [];
  getMedicalandProcedure() {
    this.tcDetailService.getDetailByExamnination(this.examinationId).subscribe((data) => {
      this.listResponse = data.data;
      console.log("check recordMaterial", this.listResponse)
      this.listResponse.forEach((item: any) => {
        if (item.mp_medical_procedure_id != null) {
          this.records.push({
            material_usage_id: item.mu_material_usage_id,
            treatment_course_id: this.treatmentCourse_Id,
            medical_group_procedure_id: item.mp_medical_procedure_group_id,
            medical_procedure_id: item.mp_medical_procedure_id,
            medical_procedure_name: item.mp_name,
            examination_id: this.examinationId,
            quantity: item.mu_quantity,
            price: item.mu_price,
            total_paid: item.mu_total_paid,
            description: '',
          });
        } else {
          this.recordsMaterial.push({
            material_usage_id: item.mu_material_usage_id,
            material_warehouse_id: item.mu_material_warehouse_id,
            material_name: item.mw_material_name,
            treatment_course_id: this.treatmentCourse_Id,
            examination_id: this.examinationId,
            quantity: item.mu_quantity,
            price: item.mw_price,
            total_paid: item.mu_total_paid == undefined ? '' : item.mu_total_paid,
            description: '',
          })
          //console.log("check recordMaterial", this.recordsMaterial)
        }
      })
    })
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
    console.log(event);
    this.list.forEach((item: any) => {
      if (item.groupId == event) {
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

  Procedure_Body: any[] = [];
  Material_Body: any[] = [];

  openConfirmationModal() {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.message = 'Bạn có chắc chắn muốn sửa lần khám này không?';
    modalRef.componentInstance.confirmButtonText = 'Sửa';
    modalRef.componentInstance.cancelButtonText = 'Hủy';

    return modalRef.result;
  }

  putExamination() {
    this.openConfirmationModal().then((result) => {
      if (result === 'confirm') {
        const faci = sessionStorage.getItem('locale');
        if (faci != null) {
          this.examination.facility_id = 'F-05';
        }
        this.examination.treatment_course_id = this.treatmentCourse_Id;
        this.examination.staff_id = this.staff_id;
        this.examination.created_date = this.currentDate;
        console.log(this.recordsImage);
        if (this.recordsImage.length > 0) {
          this.recordsImage.forEach((item: any) => {
            if (item.typeImage != null) {
              if (item.typeImage == 1) {
                let img = item.imageInsert.split('base64,');
                var a = '';
                if (img.length == 1) {
                  a = img[0];
                } else {
                  a = img[1];
                }
                this.imageBody = {
                  base64: true,
                  image_data: a,
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
        this.tcDetailService.putExamination(this.examinationId, this.examination)
          .subscribe((res) => {
            this.toastr.success(res.message, 'Chỉnh sửa lần khám thành công');
            let isSuccess = false;
            if (this.records.length > 0) {
              this.records.forEach((el) => {
                let newProcedureBody = {
                  material_usage_id: el.material_usage_id,
                  medical_procedure_id: el.medical_procedure_id,
                  treatment_course_id: this.treatmentCourse_Id,
                  examination_id: this.examinationId,
                  quantity: '1',
                  price: el.price,
                  total_paid: el.total_paid,
                  description: '',
                }
                this.materialUsageService.putMaterialUsage(newProcedureBody.material_usage_id, newProcedureBody)
                  .subscribe((res) => {
                    isSuccess = true;
                    this.toastr.success(res.message, 'Chỉnh sửa Thủ thuật thành công');
                  },
                    (err) => {
                      isSuccess = false;
                      console.log(err);
                      this.toastr.error(err.error.message, 'Chỉnh sửa Thủ thuật thất bại');
                    })
              })
            }
            if (this.recordsMaterial.length > 0) {
              this.recordsMaterial.forEach((el) => {
                let newMaterialBody = {
                  material_usage_id: el.material_usage_id,
                  material_warehouse_id: el.material_warehouse_id,
                  treatment_course_id: this.treatmentCourse_Id,
                  examination_id: this.examinationId,
                  quantity: el.quantity,
                  price: el.price,
                  total_paid: el.total_paid,
                  description: '',
                }
                this.materialUsageService.putMaterialUsage(newMaterialBody.material_usage_id, newMaterialBody)
                  .subscribe((res) => {
                    isSuccess = true;
                    this.toastr.success(res.message, 'Chỉnh sửa Vật liệu sử dụng thành công');
                  },
                    (err) => {
                      isSuccess = false;
                      console.log(err);
                      this.toastr.error(err.error.message, 'Chỉnh sửa Vật liệu thất bại');
                    })
              })
            }
            console.log(isSuccess);
            this.showNaviPopup(1)
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
    // if (this.isAdd) {
    //   this.records.push({
    //     material_usage_id:'',
    //     treatment_course_id: this.treatmentCourse_Id,
    //     medical_procedure_id: '',
    //     examination_id: '',
    //     quantity: 1,
    //     price: '',
    //     total_paid: '',
    //     description: '',
    //   });
    // }
  }

  recordsMaterial: any[] = [];
  isAddMaterial: boolean = false;
  toggleAddMaterial() {
    this.isAddMaterial = !this.isAddMaterial;
    // if (this.isAddMaterial) {
    //   this.recordsMaterial.push({
    //     material_usage_id: '',
    //     material_warehouse_id: '',
    //     treatment_course_id: this.treatmentCourse_Id,
    //     examination_id: '',
    //     quantity: '1',
    //     price: '',
    //     total_paid: '',
    //     description: '',
    //   })
    // }
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
    if (selectedMaterial) {
      record.material_name = selectedMaterial.materialName;
      record.price = selectedMaterial.unitPrice;
      record.totalPaid = selectedMaterial.unitPrice;
    }
  }

  //image
  isAddImage: boolean = false;
  recordImage = {
    id: 0,
    typeImage: "",
    imageInsert: "",
    description: ""
  }

  recordsImage: any[] = []
  id: number = 0;
  toggleAddImage() {
    this.isAddImage = !this.isAddImage;
    // if (this.isAddImage) {
    //   const Id = this.id++;
    //   this.recordImage = {
    //     id: Id,
    //     typeImage: "1",
    //     imageInsert: "../../../../../../assets/img/noImage.png",
    //     description: ""
    //   }
    //   this.recordsImage.push(this.recordImage);
    // }
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
    this.resetFileInput();
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
    this.resetFileInput();
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

  deleteRecordSpeciment(index: any) {
    this.isAddSpeci = false;
    this.recordsSpecimen.splice(index, 1);
  }

  listLabo: any[] = []
  listDisplay: any[] = []
  laboO = {
    labo_id: '',
    name: ''
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
  onMedicineChange() {
    this.showPrescriptionContent = this.examination.medicine !== '';
    // Nếu cần thực hiện thêm logic nào đó dựa trên lựa chọn, thực hiện ở đây
  }
  recordsMedicine: any[] = [];
  isAddMedicine: boolean = false;
  showPrescriptionContent: boolean = false;
  toggleAddMedicine() {
    this.isAddMedicine = !this.isAddMedicine;
    if (this.isAddMedicine) {
      this.recordsMedicine.push({
        soLuong:'',
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
  mu_material_usage_id: string,
  material_warehouse_id: string,
  treatment_course_id: string,
  examination_id: string,
  quantity: string,
  price: number,
  total_paid: number,
  description: string
}
