import {Component, Input, OnChanges, OnInit, SimpleChanges, AfterViewInit} from '@angular/core';
import {MedicalSupplyService} from "../../../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";
import {PatientService} from "../../../../../service/PatientService/patient.service";
import { LaboService } from 'src/app/service/LaboService/Labo.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
import { TreatmentCourseService } from 'src/app/service/TreatmentCourseService/TreatmentCourse.service';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {FormatNgbDate} from "../../../libs/formatNgbDate";
import { Normalize } from 'src/app/service/Lib/Normalize';

@Component({
  selector: 'app-popup-edit-approve-specimens',
  templateUrl: './popup-edit-approve-specimens.component.html',
  styleUrls: ['./popup-edit-approve-specimens.component.css']
})
export class PopupEditApproveSpecimensComponent implements OnChanges  {
  @Input() id:any;
  @Input() specimens: any;
  @Input() approveSpecimensList:any;
  patientInfor: any;
  orderDateNgbModal!:NgbDateStruct;
  receiverDateNgbModal!:NgbDateStruct;
  usedDateNgbModal!:NgbDateStruct;
  specimen={
    name:'',
    type:'',
    receiverDate:'',
    orderer:'',
    usedDate:'',
    quantity:'',
    price:'',
    totalPrice: '',
    orderDate:'',
    receiver:'',
    patientId: '',
    patientName:'',
    labo_id: '',
    treatment_course_id: '',
    total:''
  }
  specimenBody={
    name:'',
    type:'',
    quantity:'',
    unit_price:'',
    order_date:'',
    orderer:'',
    received_date:'',
    used_date:'',
    facility_id:'',
    patient_id:'',
    labo_id: '',
    treatment_course_id: '',
    status:'',
  }
  validateSpecimens = {
    name:'',
    type:'',
    receiverDate:'',
    orderer:'',
    usedDate:'',
    quantity:'',
    price:'',
    orderDate:'',
    receiver:'',
    labo:''
  }
  specimensRes = {
    ms_id:'',
    ms_name:'',
    ms_type:'',
    p_patient_name:'',
    ms_quantity:'',
    ms_unit_price:'',
    ms_used_date:'',
    ms_status:0
  }
  isSubmitted:boolean = false;
  specimenId:any;
  patients:any[]=[];
  patientId:any;
  loading:boolean = false;
  disable:boolean = false;
  constructor(private medicalSupplyService: MedicalSupplyService,
              private toastr: ToastrService,
              private laboService:LaboService,
              private treatmentCourseService: TreatmentCourseService,
              private patientSerivce:PatientService) { }

  ngOnInit(): void {
    this.getAllLabo();
  }

  calculateTotal() {
    const total = parseInt(this.specimen.quantity) * parseInt(this.specimen.price);
    this.specimen.total = total.toString();
  }

  convertTimestampToDateString(timestamp: any): string {
    const date = new Date(timestamp * 1000); // Nhân với 1000 để chuyển đổi từ giây sang mili giây
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0'); // Lấy giờ và đảm bảo có 2 chữ số
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Lấy phút và đảm bảo có 2 chữ số
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  padZero(value: number): string {
    if (value < 10) {
      return `0${value}`;
    }
    return value.toString();
  }

  labos: any [] = [];

  getAllLabo() {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.laboService.apiUrl+"/labo", error);
      }
      )
  }

  ChoosePatientBy: any[] = []

  clickPatient(patient:any) {
    var pa = patient.split(' - ');
    this.treatmentCourseService.getTreatmentCourse(pa[0]).subscribe((data) => {
      this.ChoosePatientBy = data
      console.log(this.ChoosePatientBy);
      this.loading = false;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    //this.getAllLabo();
    if (changes['id']){
      this.specimenId = this.id;
    }
    if (changes['specimens'] && this.specimens){
      this.specimen.name = this.specimens.ms_name;
      this.specimen.type = this.specimens.ms_type;
      // const orginalReceivedDate = this.specimens.ms_received_date;
      // const receivedDatePart = orginalReceivedDate.split(" ");
      // const formattedReceivedDate = receivedDatePart[0];
      // this.specimen.receiverDate = formattedReceivedDate;
      const receivedDateParts = this.specimens.ms_received_date?.split(' ')[0].split('-').map(Number);
      if (receivedDateParts && receivedDateParts.length === 3) {
        this.receiverDateNgbModal = { year: receivedDateParts[0], month: receivedDateParts[1], day: receivedDateParts[2] };
      }
      this.specimen.orderer = this.specimens.ms_orderer;
      this.specimen.quantity = this.specimens.ms_quantity;
      this.specimen.price = this.specimens.ms_unit_price;
      this.specimen.total = (this.specimens.ms_quantity * this.specimens.ms_unit_price).toString();
      // const orginalOrderDate = this.specimens.ms_order_date;
      // const orderDatePart = orginalOrderDate.split(" ");
      // const formattedOrderDate = orderDatePart[0];
      // this.specimen.orderDate = formattedOrderDate;
      const orderDateParts = this.specimens.ms_order_date?.split(' ')[0].split('-').map(Number);
      if (orderDateParts && orderDateParts.length === 3) {
        this.orderDateNgbModal = { year: orderDateParts[0], month: orderDateParts[1], day: orderDateParts[2] };
      }
      this.specimen.patientName = this.specimens.p_patient_name;
      // const orginalUsedDate = this.specimens.ms_used_date;
      // const usedDatePart = orginalUsedDate.split(" ");
      // const formattedUsedDate = usedDatePart[0];
      // this.specimen.usedDate = formattedUsedDate;
      const usedDateParts = this.specimens.ms_used_date?.split(' ')[0].split('-').map(Number);
      if (usedDateParts && usedDateParts.length === 3) {
        this.usedDateNgbModal = { year: usedDateParts[0], month: usedDateParts[1], day: usedDateParts[2] };
      }
      this.specimen.treatment_course_id = this.specimens.treatment_course_id;
      this.specimen.labo_id = this.specimens.lb_id;
      this.getPatient(this.specimens.p_patient_id);
      this.patientInfor = this.specimens.p_patient_id + " - "+this.specimens.p_patient_name+ " - "+this.specimens.p_phone_number;
    }
  }
  patient:any;
  patientListShow:any[]=[];
  getPatient(id:any){
    this.patientSerivce.getPatientById(id).subscribe((data:any)=>{
      const transformedMaterial = {
        patientId: data.patient_id,
        patientName: data.patient_name,
        patientInfor: data.patient_name + " - " + data.phone_number,
      };
      console.log(transformedMaterial)
      if (!this.patientListShow.some(p => p.patientId === transformedMaterial.patientId)) {
        this.patientListShow.push(transformedMaterial);
      }
      this.patientList = this.patientListShow;
      this.specimen.patientId = transformedMaterial.patientId;
      console.log("patientId",this.specimen.patientId);
    })
  }

  updateSpecimensRes(){
    let usedDate = this.convertTimestampToDateString(this.specimenBody.used_date);
    this.specimensRes={
      ms_id:'',
      ms_name: this.specimenBody.name,
      ms_type: this.specimenBody.type,
      p_patient_name: this.specimen.receiver,
      ms_quantity: this.specimenBody.quantity,
      ms_unit_price: this.specimenBody.unit_price,
      ms_used_date: usedDate,
      ms_status: 1
    }

  }

  getPatentByName(patientName: any) {
    alert(patientName);
    this.patientSerivce.getPatientByName(patientName, 1).subscribe(data => {
      const transformedMaterialList = data.data.map((item:any) => {
        return {
          patientId: item.patient_id,
          patientName: item.patient_name,
          patientInfor: item.patient_name + " - "+ item.phone_number,
        };
      });
      this.patientList = transformedMaterialList;
    })
  }

  patientList:any [] = [];
  onsearch(event:any) {
    console.log(event.target.value)
    this.specimen.patientName = event.target.value;
    let searchTermWithDiacritics = Normalize.normalizeDiacritics(event.target.value);
    searchTermWithDiacritics = searchTermWithDiacritics.toLowerCase().trim();
    searchTermWithDiacritics = searchTermWithDiacritics.replace(/\s+/g, '-');
    this.patientSerivce.getPatientByName(searchTermWithDiacritics, 1).subscribe(data => {
      const transformedMaterialList = data.data.map((item:any) => {
        return {
          patientId: item.patient_id,
          patientName: item.patient_name,
          patientInfor: item.patient_name + " - "+ item.phone_number,
        };
      });
      this.patientList = transformedMaterialList;
    })
  }

  selectedPatient: any;
  isCheckSelectedPatient: boolean = true;
  temporaryName: string='';

  updateApproveSpecimens(){
    const orderDate = FormatNgbDate.formatNgbDateToString(this.orderDateNgbModal);
    const receivedDate = FormatNgbDate.formatNgbDateToString(this.receiverDateNgbModal);
    const usedDate = FormatNgbDate.formatNgbDateToString(this.usedDateNgbModal);
    this.resetValidate();
    if (!this.specimen.name){
      this.validateSpecimens.name = 'Vui lòng nhập tên mẫu!';
      this.isSubmitted = true;
    }
    if (!orderDate || !this.formatDate(orderDate)){
      this.validateSpecimens.orderDate = 'Vui lòng nhập ngày đặt!';
      this.isSubmitted = true;
    }
    // if (this.specimen.receiverDate && !this.formatDate(this.specimen.receiverDate)){
    //   this.validateSpecimens.receiverDate = 'Vui lòng nhập lại ngày nhận!';
    //   this.isSubmitted = true;
    // }
    // else if (this.specimen.receiverDate < this.specimen.orderDate && this.formatDate(this.specimen.receiverDate)){
    //   this.validateSpecimens.receiverDate = 'Vui lòng chọn ngày nhận lớn hơn ngày đặt!';
    //   this.isSubmitted = true;
    // }
    // else if (this.specimen.receiverDate > this.specimen.usedDate && this.formatDate(this.specimen.receiverDate)){
    //   this.validateSpecimens.receiverDate = 'Vui lòng chọn ngày nhận nhỏ hơn ngày lắp!';
    //   this.isSubmitted = true;
    // }
    // if (this.specimen.usedDate && !this.formatDate(this.specimen.usedDate)){
    //   this.validateSpecimens.usedDate = 'Vui lòng nhập lại ngày lắp!';
    //   this.isSubmitted = true;
    // }
    // else if (this.specimen.usedDate < this.specimen.orderDate && this.formatDate(this.specimen.usedDate)){
    //   this.validateSpecimens.usedDate = 'Vui lòng chọn ngày lắp lớn hơn ngày đặt!';
    //   this.isSubmitted = true;
    // }
    // else if (this.specimen.usedDate < this.specimen.receiverDate && this.formatDate(this.specimen.usedDate)){
    //   this.validateSpecimens.usedDate = 'Vui lòng chọn ngày lắp lớn hơn ngày nhận!';
    //   this.isSubmitted = true;
    // }
    if (!this.specimen.labo_id){
      this.validateSpecimens.labo = 'Vui lòng chọn labo!';
      this.isSubmitted = true;
    }
    if (this.specimen.quantity && !this.checkNumber(this.specimen.quantity)){
      this.validateSpecimens.quantity = 'Vui lòng nhập lại số lượng!';
      this.isSubmitted = true;
    }
    if (this.specimen.price && !this.checkNumber(this.specimen.price)){
      this.validateSpecimens.price = 'Vui lòng nhập lại đơn giá!';
      this.isSubmitted = true;
    }
    if (!this.specimen.patientId){
      this.validateSpecimens.receiver = 'Vui lòng nhập tên bệnh nhân!';
      this.isSubmitted = true;
    }

    if (this.isSubmitted){
      return;
    }
    let orderDateParse = new Date(orderDate);
    let receivedDateParse = new Date(receivedDate);
    let usedDateParse = new Date(usedDate);
    let orderDateTimestamp = (orderDateParse.getTime()/1000).toString();
    let receivedDateTimestamp = (receivedDateParse.getTime()/1000).toString();
    let userDateTimestamp = (usedDateParse.getTime()/1000).toString();
    let faci = sessionStorage.getItem('locale');
    if (faci != null) {
      this.specimenBody.facility_id = faci;
    }

    this.specimenBody = {
      name:this.specimen.name,
      type:this.specimen.type,
      quantity:this.specimen.quantity,
      unit_price:this.specimen.price,
      order_date:orderDateTimestamp,
      orderer:this.specimen.orderer,
      received_date:receivedDateTimestamp,
      used_date: userDateTimestamp,
      facility_id: this.specimenBody.facility_id,
      patient_id:this.specimen.patientId,
      labo_id: this.specimen.labo_id,
      treatment_course_id: this.specimen.treatment_course_id,
      status:'1',
    }
    //this.loading = true;
    this.disable = true;
    this.medicalSupplyService.updateApproveSpecimens(this.id, this.specimenBody).subscribe(data=>{
      this.toastr.success('Cập nhật thành công !');
      this.disable = false;
       /* let ref = document.getElementById('cancel-approve');
        ref?.click();*/
        window.location.reload();

        /*this.updateSpecimensRes();
        this.specimensRes.ms_id = this.id;
        const index = this.approveSpecimensList.findIndex((s:any) => s.ms_id === this.id);
        if (index !== -1) {
          this.approveSpecimensList[index] = this.specimensRes;
        }*/

    },
      error => {
        this.toastr.error('Cập nhật thất bại !');
        this.disable = false;
        ResponseHandler.HANDLE_HTTP_STATUS(this.medicalSupplyService.url+"/medical-supply/"+this.id, error);
      }
      )
  }
  private resetValidate(){
    this.validateSpecimens = {
      name:'',
      type:'',
      receiverDate:'',
      orderer:'',
      usedDate:'',
      quantity:'',
      price:'',
      orderDate:'',
      receiver:'',
      labo: ''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
  private formatDate(dateString:any):boolean{
    return  /^\d{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(dateString);
  }
}
