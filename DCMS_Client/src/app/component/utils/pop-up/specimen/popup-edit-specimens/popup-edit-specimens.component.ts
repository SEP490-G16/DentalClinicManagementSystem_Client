import { Router } from '@angular/router';
import { SpecimensService } from '../../../../../service/SpecimensService/SpecimensService.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PutSpecimen } from 'src/app/model/ISpecimens';
import { CognitoService } from 'src/app/service/cognito.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
import {PatientService} from "../../../../../service/PatientService/patient.service";
import * as moment from 'moment';

@Component({
  selector: 'app-popup-edit-specimens',
  templateUrl: './popup-edit-specimens.component.html',
  styleUrls: ['./popup-edit-specimens.component.css']
})
export class PopupEditSpecimensComponent implements OnInit {
  @Input() PutSpecimen: any;
  @Input() AllLabos: any;
  loading: boolean = false;
  IPutSpecimens: PutSpecimen;
  Labos: any;
  id: string = "";
  status: string = "0";
  total: number = 0;
  constructor(
    private toastr: ToastrService,
    private cognitoService: CognitoService,
    private SpecimensService: SpecimensService,
    private patientService:PatientService,

    private router: Router

  ) {
    this.IPutSpecimens = {
      ms_type: "",
      ms_name: "",
      ms_quantity: 0,
      ms_unit_price: 0,
      ms_order_date: "",
      ms_orderer: "",
      ms_received_date: "",
      ms_receiver: "",
      ms_use_date: "",
      ms_warranty: "",
      ms_description: "",
      ms_status: 0,
      facility_id: "",
      lb_id: null,
      p_patient_id: "",
      p_patient_name: ""
    } as PutSpecimen;
  }
  putSpecimensBody ={
    name:'',
    type:'',
    quantity:0,
    unit_price:0,
    order_date:'',
    orderer:'',
    received_date:'',
    receiver:'',
    used_date:'',
    warranty:'',
    description:'',
    status:2,
    facility_id:'F-08',
    labo_id:'',
    patient_id:''
  }
  validatePutSpecimens={
    name:'',
    type:'',
    orderDate:'',
    receivedDate:'',
    useDate:'',
    labo:'',
    quantity:'',
    unitPrice:'',
    order:'',
    patient:''
  }
  isSubmitted:boolean=false;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['PutSpecimen'].currentValue) {
      console.log(changes['PutSpecimen']);
      this.IPutSpecimens.ms_name = this.PutSpecimen.ms_name;
      this.IPutSpecimens.ms_type = this.PutSpecimen.ms_type;
      this.IPutSpecimens.ms_unit_price = this.PutSpecimen.ms_unit_price;
      this.IPutSpecimens.ms_quantity = this.PutSpecimen.ms_quantity;
      this.IPutSpecimens.ms_orderer = this.PutSpecimen.ms_orderer;
      this.IPutSpecimens.lb_id = this.PutSpecimen.lb_id;
      this.IPutSpecimens.facility_id = 'F-08'
      this.IPutSpecimens.ms_order_date = this.PutSpecimen.ms_order_date?.split(" ")[0];
      this.IPutSpecimens.ms_received_date = this.PutSpecimen.ms_received_date?.split(" ")[0];
      this.IPutSpecimens.ms_use_date = this.PutSpecimen.ms_used_date?.split(" ")[0];
      if (this.IPutSpecimens.ms_quantity !== undefined && this.PutSpecimen.ms_unit_price !== undefined) {
        this.total = this.PutSpecimen.ms_quantity * this.PutSpecimen.ms_unit_price;
      }
      // alert(this.PutSpecimen.p_patient_id);
      // return;
      this.getPatient(this.PutSpecimen.p_patient_id);

      this.id = this.PutSpecimen.ms_id;
      //console.log(this.IPutSpecimens);
    }
    if (changes['AllLabos']) {
      this.Labos = this.AllLabos;
      console.log("Labos:", this.Labos);
    }
  }
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày   const format = 'YYYY-MM-DD HH:mm:ss';
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    var timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }
  EditSpecimen() {
    console.log("id", this.id);
    console.log("specimens", this.IPutSpecimens);
    this.resetValidate();
    if (!this.IPutSpecimens.ms_name){
      this.validatePutSpecimens.name = 'Vui lòng nhập tên mẫu!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_type){
      this.validatePutSpecimens.type = 'Vui lòng nhập chất liệu!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_order_date){
      this.validatePutSpecimens.orderDate = 'Vui lòng nhập ngày đặt!';
      this.isSubmitted = true;
    }
    else if (this.IPutSpecimens.ms_order_date > this.IPutSpecimens.ms_received_date){
      this.validatePutSpecimens.orderDate = 'Vui lòng chọn lại ngày đặt!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_received_date){
      this.validatePutSpecimens.receivedDate = 'Vui lòng nhập ngày nhận!';
      this.isSubmitted = true;
    }
    else if (this.IPutSpecimens.ms_received_date > this.IPutSpecimens.ms_use_date){
      this.validatePutSpecimens.receivedDate = 'Vui lòng chọn lại ngày nhận!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_use_date){
      this.validatePutSpecimens.useDate = 'Vui lòng nhập ngày lắp!';
      this.isSubmitted = true;
    }
    else if (this.IPutSpecimens.ms_use_date < this.IPutSpecimens.ms_received_date){
      this.validatePutSpecimens.useDate = 'Vui lòng chọn lại ngày lắp!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.lb_id){
      this.validatePutSpecimens.labo = 'Vui lòng chọn labo!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_quantity){
      this.validatePutSpecimens.quantity = 'Vui lòng nhập số lượng!';
      this.isSubmitted = true;
    }
    else if (!this.checkNumber(this.IPutSpecimens.ms_quantity)){
      this.validatePutSpecimens.quantity = 'Vui lòng nhập lại số lượng!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_unit_price){
      this.validatePutSpecimens.unitPrice = 'Vui lòng nhập đơn giá!';
      this.isSubmitted = true;
    }
    else if (!this.checkNumber(this.IPutSpecimens.ms_unit_price)){
      this.validatePutSpecimens.unitPrice = 'Vui lòng nhập lại đơn giá!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.ms_orderer){
      this.validatePutSpecimens.order = 'Vui lòng nhập người đặt!';
      this.isSubmitted = true;
    }
    if (!this.IPutSpecimens.p_patient_id){
      this.validatePutSpecimens.patient = 'Vui lòng nhập tên bệnh nhân!';
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
    this.putSpecimensBody ={
      name:this.IPutSpecimens.ms_name,
      type: this.IPutSpecimens.ms_type,
      quantity:this.IPutSpecimens.ms_quantity,
      unit_price: this.IPutSpecimens.ms_unit_price,
      order_date: this.dateToTimestamp(this.IPutSpecimens.ms_order_date).toString(),
      orderer: this.IPutSpecimens.ms_orderer,
      received_date: this.dateToTimestamp(this.IPutSpecimens.ms_received_date).toString(),
      receiver: this.IPutSpecimens.ms_receiver,
      used_date: this.dateToTimestamp(this.IPutSpecimens.ms_use_date).toString(),
      warranty: this.IPutSpecimens.ms_warranty,
      description: this.IPutSpecimens.ms_description,
      status: 2,
      facility_id: 'F-08',
      labo_id:this.IPutSpecimens.lb_id,
      patient_id:this.IPutSpecimens.p_patient_id
    }
    this.SpecimensService.putSpecimens(this.id, this.putSpecimensBody)
      .subscribe((res) => {
        this.loading = false;
        this.showSuccessToast('Chỉnh sửa mẫu vật thành công!');
        window.location.reload();
      },

        (error) => {
          // console.log(err.err.message)
          this.loading = false;
          // this.showErrorToast(err.err.message)
          //this.showSuccessToast('Chỉnh sửa mẫu vật thành công!');
          ResponseHandler.HANDLE_HTTP_STATUS(this.SpecimensService.apiUrl+"/medical-supply/"+this.id, error);
        }
      )
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    },
    );
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }
  patient:any;
  patientListShow:any[]=[];
  getPatient(id:any){
    if (id!==null){
      this.patientService.getPatientById(id).subscribe((data:any)=>{
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
        this.IPutSpecimens.p_patient_id = transformedMaterial.patientId;
      })
    }
  }
  patientList:any [] = [];
  onsearch(event:any) {
    console.log(event.target.value)
    this.IPutSpecimens.p_patient_name = event.target.value;
    this.patientService.getPatientByName(this.IPutSpecimens.p_patient_name, 1).subscribe(data => {
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
  closePopup(){
    this.IPutSpecimens = {
      ms_type: "",
      ms_name: "",
      ms_quantity: 0,
      ms_unit_price: 0,
      ms_order_date: "",
      ms_orderer: "",
      ms_received_date: "",
      ms_receiver: "",
      ms_use_date: "",
      ms_warranty: "",
      ms_description: "",
      ms_status: 0,
      facility_id: "",
      lb_id: null,
      p_patient_id: "",
      p_patient_name: "",
    } as PutSpecimen;
  }
  resetValidate(){
    this.validatePutSpecimens={
      name:'',
      type:'',
      orderDate:'',
      receivedDate:'',
      useDate:'',
      labo:'',
      quantity:'',
      unitPrice:'',
      order:'',
      patient:''
    }
    this.isSubmitted = false;
  }
  private checkNumber(number:any):boolean{
    return /^[1-9]\d*$/.test(number);
  }
}
