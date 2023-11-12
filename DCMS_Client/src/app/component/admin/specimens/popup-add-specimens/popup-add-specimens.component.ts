import {Component, Input, OnInit} from '@angular/core';
import {MedicalSupplyService} from "../../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";
import {PatientService} from "../../../../service/PatientService/patient.service";
import {LaboService} from "../../../../service/LaboService/Labo.service";

@Component({
  selector: 'app-popup-add-specimens',
  templateUrl: './popup-add-specimens.component.html',
  styleUrls: ['./popup-add-specimens.component.css']
})
export class PopupAddSpecimensComponent implements OnInit {
  @Input() approveSpecimensList:any;
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
    total:'',
    labo:''
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
    lb_id:''
  }
  specimensRes = {
    medical_supply_id:'',
    ms_name:'',
    ms_type:'',
    p_patient_name:'',
    ms_quantity:'',
    ms_unit_price:'',
    ms_used_date:'',
    ms_status:0
  }
  labos:any;
  patients:any[]=[];
  patientId:any;
  isSubmitted:boolean = false;
  loading:boolean = false;
  constructor(private medicalSupplyService: MedicalSupplyService,
              private toastr: ToastrService,
              private patientSerivce:PatientService,
              private laboService:LaboService) { }

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
  updateSpecimensRes(){
    let usedDate = this.convertTimestampToDateString(this.specimenBody.used_date);
    this.specimensRes={
      medical_supply_id:'',
      ms_name: this.specimenBody.name,
      ms_type: this.specimenBody.type,
      p_patient_name: this.specimen.receiver,
      ms_quantity: this.specimenBody.quantity,
      ms_unit_price: this.specimenBody.unit_price,
      ms_used_date: usedDate,
      ms_status: 1
    }

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
      lb_id: this.specimen.labo
    }
    console.log(this.specimenBody)
    this.loading = true;
    this.medicalSupplyService.addMedicalSupply(this.specimenBody).subscribe(data=>{
      this.toastr.success('Thêm mới mẫu thành công !');
      /*let ref = document.getElementById('cancel-specimen');
      ref?.click();*/
      window.location.reload();
     /* this.updateSpecimensRes();
      this.specimensRes.medical_supply_id = data.data.medical_supply_id;
      this.approveSpecimensList.unshift(this.specimensRes);*/
    },
      error => {
      this.loading = false;
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
  getAllLabo() {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
      console.log("Get all Labo: ", this.labos);
    })
  }
}
