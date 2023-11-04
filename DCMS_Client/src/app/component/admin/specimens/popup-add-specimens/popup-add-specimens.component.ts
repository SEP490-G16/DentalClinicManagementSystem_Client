import { Component, OnInit } from '@angular/core';
import {MedicalSupplyService} from "../../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";
import {PatientService} from "../../../../service/PatientService/patient.service";

@Component({
  selector: 'app-popup-add-specimens',
  templateUrl: './popup-add-specimens.component.html',
  styleUrls: ['./popup-add-specimens.component.css']
})
export class PopupAddSpecimensComponent implements OnInit {

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
    total:''
  }
  specimenBody={
    name:'',
    type:'',
    received_date:'',
    orderer:'',
    used_date:'',
    quantity:'',
    unit_price:'',
    order_date:'',
    patient_id:'',
    facility_id:'',
  }
  patients:any[]=[];
  patientId:any;
  isSubmitted:boolean = false;
  constructor(private medicalSupplyService: MedicalSupplyService,
              private toastr: ToastrService,
              private patientSerivce:PatientService) { }

  ngOnInit(): void {
  }
  calculateTotal() {
    const total = parseInt(this.specimen.quantity) * parseInt(this.specimen.price);
   this.specimen.total = total.toString();
  }
  addMedicalSupply(){
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
    this.specimenBody={
      name: this.specimen.name,
      type: this.specimen.type,
      received_date: receivedDateTimestamp,
      orderer: this.specimen.orderer,
      used_date: userDateTimestamp,
      quantity: this.specimen.quantity,
      unit_price: this.specimen.price,
      order_date: orderDateTimestamp,
      patient_id:this.patientId,
      facility_id: 'F-01',
    }
    this.medicalSupplyService.addMedicalSupply(this.specimenBody).subscribe(data=>{
      this.toastr.success('Thêm mới mẫu thành công !');
      let ref = document.getElementById('cancel-specimen');
      ref?.click();
      window.location.reload();
    },
      error => {
      this.toastr.error('Thêm mới thất bại !');
      })
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
