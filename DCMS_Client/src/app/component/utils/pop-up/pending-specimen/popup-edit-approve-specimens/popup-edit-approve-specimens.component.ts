import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MedicalSupplyService} from "../../../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";
import {PatientService} from "../../../../../service/PatientService/patient.service";
import { LaboService } from 'src/app/service/LaboService/Labo.service';

@Component({
  selector: 'app-popup-edit-approve-specimens',
  templateUrl: './popup-edit-approve-specimens.component.html',
  styleUrls: ['./popup-edit-approve-specimens.component.css']
})
export class PopupEditApproveSpecimensComponent implements OnChanges {
  @Input() id:any;
  @Input() specimens: any;
  @Input() approveSpecimensList:any;
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
    labo_id: '',
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
  constructor(private medicalSupplyService: MedicalSupplyService,
              private toastr: ToastrService,
              private laboService:LaboService,
              private patientSerivce:PatientService) { }

  ngOnInit(): void {
    this.getAllLabo();
  }
  calculateTotal() {
    const total = parseInt(this.specimen.quantity) * parseInt(this.specimen.price);
    this.specimen.total = total.toString();
  }
  onsearch(){
    this.patientSerivce.getPatientPhoneNumber(this.specimen.receiver).subscribe(data=>{
      this.patients = data;
      console.log(this.patients);
    })
  }
  selectPatient(patient:any) {
    // Thiết lập giá trị của input và ID của bệnh nhân
    this.specimen.receiver = patient.patient_name;
    this.patientId = patient.patient_id;
    // Xóa danh sách kết quả
    this.patients = [];
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
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    //this.getAllLabo();
    if (changes['id']){
      this.specimenId = this.id;
    }
    if (changes['specimens']){
      this.specimen.name = this.specimens.ms_name;
      this.specimen.type = this.specimens.ms_type;
      const orginalReceivedDate = this.specimens.ms_received_date;
      const receivedDatePart = orginalReceivedDate.split(" ");
      const formattedReceivedDate = receivedDatePart[0];
      this.specimen.receiverDate = formattedReceivedDate;
      this.specimen.orderer = this.specimens.ms_orderer;
      this.specimen.quantity = this.specimens.ms_quantity;
      this.specimen.price = this.specimens.ms_unit_price;
      this.specimen.total = (this.specimens.ms_quantity * this.specimens.ms_unit_price).toString();
      const orginalOrderDate = this.specimens.ms_order_date;
      const orderDatePart = orginalOrderDate.split(" ");
      const formattedOrderDate = orderDatePart[0];
      this.specimen.orderDate = formattedOrderDate;
      this.specimen.receiver = this.specimens.p_patient_name;
      const orginalUsedDate = this.specimens.ms_used_date;
      const usedDatePart = orginalUsedDate.split(" ");
      const formattedUsedDate = usedDatePart[0];
      this.specimen.usedDate = formattedUsedDate;
      this.specimen.labo_id = this.specimens.lb_id;
    }
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

  updateApproveSpecimens(){
    this.resetValidate();
    if (!this.specimen.name){
      this.validateSpecimens.name = 'Vui lòng nhập tên mẫu!';
      this.isSubmitted = true;
    }
    if (!this.specimen.type){
      this.validateSpecimens.type = 'Vui lòng nhập chất liệu!';
      this.isSubmitted = true;
    }
    if (!this.specimen.receiverDate){
      this.validateSpecimens.receiverDate = 'Vui lòng nhập ngày nhận!';
      this.isSubmitted = true;
    }
    if (!this.specimen.orderer){
      this.validateSpecimens.orderer = 'Vui lòng nhập người dặt!';
      this.isSubmitted = true;
    }
    if(!this.specimen.usedDate){
      this.validateSpecimens.usedDate = 'Vui lòng nhập ngày lắp!';
      this.isSubmitted = true;
    }
    if (!this.specimen.quantity){
      this.validateSpecimens.quantity = 'Vui lòng nhập số lượng!';
      this.isSubmitted = true;
    }
    else if (!this.checkNumber(this.specimen.quantity)){
      this.validateSpecimens.quantity = 'Vui lòng nhập số dương!';
      this.isSubmitted = true;
    }
    if (!this.specimen.price){
      this.validateSpecimens.price = 'Vui lòng nhập đơn giá!';
      this.isSubmitted = true;
    }
    else if (!this.checkNumber(this.specimen.price)){
      this.validateSpecimens.price = 'Vui lòng nhập số dương!'
      this.isSubmitted = true;
    }
    if (!this.specimen.orderDate){
      this.validateSpecimens.orderDate = 'Vui lòng nhập ngày đặt!';
      this.isSubmitted = true;
    }
    if (!this.specimen.receiver){
      this.validateSpecimens.receiver = 'Vui lòng nhập bệnh nhân';
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    let orderDate = new Date(this.specimen.orderDate);
    let receivedDate = new Date(this.specimen.receiverDate);
    let usedDate = new Date(this.specimen.usedDate);
    let orderDateTimestamp = (orderDate.getTime()/1000).toString();
    let receivedDateTimestamp = (receivedDate.getTime()/1000).toString();
    let userDateTimestamp = (usedDate.getTime()/1000).toString();
    this.specimenBody = {
      name:this.specimen.name,
      type:this.specimen.type,
      quantity:this.specimen.quantity,
      unit_price:this.specimen.price,
      order_date:orderDateTimestamp,
      orderer:this.specimen.orderer,
      received_date:receivedDateTimestamp,
      used_date: userDateTimestamp,
      facility_id:'F-01',
      patient_id:this.patientId,
      labo_id: this.specimen.labo_id,
      status:'1',
    }
    this.loading = true;
    this.medicalSupplyService.updateApproveSpecimens(this.id, this.specimenBody).subscribe(data=>{
      this.toastr.success('Cập nhật thành công !');
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
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
}
