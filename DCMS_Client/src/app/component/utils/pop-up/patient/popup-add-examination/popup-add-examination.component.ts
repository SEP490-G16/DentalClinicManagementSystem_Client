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
    private tcService: TreatmentCourseService,
    private tcDetailService: TreatmentCourseDetailService,
    private medicalProcedureGroupService: MedicalProcedureGroupService,
    private materialUsageService: MaterialUsageService,
    private materialWarehoseService: MaterialWarehouseService,
    private materialService: MaterialService,
    private LaboService: LaboService,
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
      'x-ray-image': "",
      'x-ray-image-des': "",
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
  orderer:any = "";

  ngOnInit(): void {
    this.patient_Id = this.route.snapshot.params['id'];
    const user = sessionStorage.getItem('username');
    if (user != null) {
      this.orderer = user;
    }
    this.treatmentCourse_Id = this.route.snapshot.params['tcId'];

    const id = sessionStorage.getItem('sub-id');
    if (id != null) {
      this.staff_id = id;
    }
    // this.getTreatmentCourse();
    // this.getMedicalProcedureGroup();
    // this.getMedicalProcedureGroupDetail();
    // this.getMaterialWarehouse();
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

  // getTreatmentCourse() {
  //   this.tcService.getTreatmentCourse(this.patient_Id)
  //     .subscribe((data) => {
  //       console.log("data treatment: ", data);
  //       this.treatmentCourse = data;
  //       console.log("treatment course: ", this.treatmentCourse);
  //     },
  //       (error) => {
  //         //this.toastr.error(error.error.message, "Lấy danh sách Liệu trình thất bại");
  //         ResponseHandler.HANDLE_HTTP_STATUS(this.tcService.apiUrl + "/treatment-course/patient-id/" + this.patient_Id, error);
  //       })
  // }

  // getMedicalProcedureGroup() {
  //   this.medicalProcedureGroupService.getMedicalProcedureGroupList()
  //     .subscribe((res) => {
  //       console.log("Medical Procedure Group: ", res);
  //       this.ProcedureGroupArray = res.data;
  //     })
  // }

  // getMedicalProcedureGroupDetail() {
  //   this.medicalProcedureGroupService.getMedicalProcedureGroupWithDetailList()
  //     .subscribe((res) => {
  //       console.log("Medical Procedure Group with Detail: ", res);
  //       this.detailProcedureGroupArray = res.data;
  //     })
  // }

  // getMaterialWarehouse() {
  //   this.materialWarehoseService.getMaterialWarehousse_Remaining(1)
  //     .subscribe((res) => {
  //       this.MaterialWarehouse_Array = res.data;
  //       console.log("Material Remaining: ", res.data);
  //     })
  // }

  // detailProcedureGroupArrayFilter: any;
  // filterProcedureByPG(index: number) {
  //   if (this.pg_id != "")
  //     this.detailProcedureGroupArrayFilter = this.detailProcedureGroupArray.filter(p => p.mg_id === this.pg_id)
  //   console.log("Filter detail: ", this.detailProcedureGroupArrayFilter);
  // }

  // chooseProcedure(index: number, medicalProcedureId: number) {
  //   const selectedProcedure = this.detailProcedureGroupArrayFilter.find((procedure: any) => procedure.mp_id === medicalProcedureId);
  //   if (selectedProcedure) {
  //     this.Procedure_Material_Usage_Body[index].treatment_course_id = this.treatmentCourse_Id;
  //     this.Procedure_Material_Usage_Body[index].price = selectedProcedure.mp_price;
  //     this.Procedure_Material_Usage_Body[index].total_paid = selectedProcedure.mp_price;
  //   }
  // }

  // updateMaterialWarehouse(index: number, material_warehouse_id: any) {
  //   const selectedMaterialW = this.MaterialWarehouse_Array.find((mw: any) => mw.mw_material_warehouse_id === material_warehouse_id);
  //   console.log("Selected Material: ", selectedMaterialW);
  //   if (selectedMaterialW) {
  //     this.Material_Usage_Body[index].treatment_course_id = this.treatmentCourse_Id;
  //     this.Material_Usage_Body[index].price = selectedMaterialW.mw_price;
  //     this.Material_Usage_Body[index].mw_remaining = selectedMaterialW.mw_remaining;
  //     // this.Material_Usage_Body[index].total_paid = this.Material_Usage_Body[index].price * this.Material_Usage_Body[index].quantity;
  //     this.Material_Usage_Body[index].total_paid = 0;

  //     console.log("updateMaterialWarehouse: ", this.Material_Usage_Body);
  //   }
  // }

  // allowedEmptyFields: string[]
  //   = ['usage_date', 'adder', 'description', 'examination_id',
  //     'material_warehouse_id', 'medical_procedure_id'];

  // areRequiredFieldsFilled(array: any[]): boolean {
  //   return array.every(item => {
  //     return Object.entries(item).every(([key, value]) => {
  //       if (this.allowedEmptyFields.includes(key)) {
  //         return true;
  //       }

  //       return value !== null && value !== '';
  //     });
  //   });
  // }

  postExamination() {
    const faci = sessionStorage.getItem('locale');
    if (faci != null) {
      this.examination.facility_id = faci;
    }
    this.examination.treatment_course_id = this.treatmentCourse_Id;
    this.examination.staff_id = this.staff_id;
    this.examination.created_date = this.currentDate;
    if (this.recordsImage.length > 0) {
      this.recordsImage.forEach((item: any) => {
        if (item.typeImage != null) {
          this.examination['x-ray-image'] += item.imageInsert + "|||";
          this.examination['x-ray-image-des'] += item.description + "|||";
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
            el.examination_id = examinationId
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
          this.recordsSpecimen.forEach((item:any) => {
            item.patient_id = this.patient_Id;
            item.facility_id = this.facility;
            item.treatment_course_id = this.treatmentCourse_Id;
            this.medicalSupplyService.addMedicalSupply(item).subscribe(data=>{
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
        this.showNaviPopup(1)
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.tcDetailService.apiUrl + "/examination", error);
        }
      )
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
  // @ViewChild('fileInput') fileInputVariable!: ElementRef;
  // onFileSelected(event: any) {
  //   // const files = event.target.files;
  //   // console.log(files);
  //   // if (files) {
  //   //   for (let file of files) {
  //   //     const reader = new FileReader();

  //   //     reader.onload = (e: any) => {
  //   //       this.imageUrls.push(e.target.result);
  //   //       this.showImages = true;
  //   //       this.cdr.detectChanges();
  //   //       console.log(this.imageUrls);
  //   //     };
  //   //     reader.readAsDataURL(file);
  //   //   }
  //   // }
  //   const fileInput = event.target;
  //   if (fileInput.files && fileInput.files[0]) {
  //     const file = fileInput.files[0];
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       const base64Data = e.target.result;
  //       this.imageURL = base64Data;
  //     };
  //     reader.readAsDataURL(file);
  //   }

  // }

  // addImageUrl() {
  //   if (this.imageLink) {
  //     console.log('Adding image URL:', this.imageLink); // Kiểm tra URL
  //     this.imageUrls.push(this.imageLink);
  //     // this.imageLink = '';
  //     console.log('Image URLs:', this.imageUrls); // Kiểm tra xem URL có được thêm vào mảng không
  //     this.cdr.detectChanges();
  //   }
  // }

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
        totalPaid: '',
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
    const selectedMaterial = this.results.find((material: any) => material.materialId === event);
    if (selectedMaterial) {
      this.materialName = selectedMaterial.tenVatLieu;
      record.price = selectedMaterial.unitPrice;
      record.totalPaid = selectedMaterial.unitPrice;
    }
  }

  changeUnitPrice(record: any) {
    const selectedMaterial = this.results.find((material: any) => material.materialName === record.materialName);
    record.totalPaid = selectedMaterial.unitPrice * selectedMaterial.quantity;
  }

  changeQuantity(record: any) {
    console.log(record)
    const selectedMaterial = this.results.find((material: any) => material.materialId === record.material_warehouse_id);
    record.totalPaid = selectedMaterial.unitPrice * record.quantity;
    console.log(record.totalPaid);
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
        this.specimenBody.order_date = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
      this.recordsSpecimen.push(this.specimenBody);
    }
  }

  listLabo: any[] = []
  listDisplay: any[] = []
  laboO = {
    labo_id: '',
    name:''
  }
  getLabos() {
    this.LaboService.getLabos()
      .subscribe((res) => {
        this.listLabo = res.data;
        this.listLabo.forEach((item:any) => {
          let laboO = {
            labo_id: item.labo_id,
            name: item.name
          }
          this.listDisplay.push(laboO);
        })
      })
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
