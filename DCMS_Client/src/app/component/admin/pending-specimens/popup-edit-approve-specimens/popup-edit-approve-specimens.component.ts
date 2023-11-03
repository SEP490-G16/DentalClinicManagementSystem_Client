import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MedicalSupplyService} from "../../../../service/MedicalSupplyService/medical-supply.service";
import {ToastrService} from "ngx-toastr";
import {PatientService} from "../../../../service/PatientService/patient.service";

@Component({
  selector: 'app-popup-edit-approve-specimens',
  templateUrl: './popup-edit-approve-specimens.component.html',
  styleUrls: ['./popup-edit-approve-specimens.component.css']
})
export class PopupEditApproveSpecimensComponent implements OnChanges {
  @Input() id:any;
  @Input() specimens: any;
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
    quantity:'',
    unit_price:'',
    order_date:'',
    orderer:'',
    received_date:'',
    used_date:'',
    facility_id:'',
    patient_id:'',
    status:'',
  }
  specimenId:any;
  patients:any[]=[];
  patientId:any;
  constructor(private medicalSupplyService: MedicalSupplyService,
              private toastr: ToastrService,
              private patientSerivce:PatientService) { }

  ngOnInit(): void {
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

  ngOnChanges(changes: SimpleChanges): void {
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
    }
  }

  updateApproveSpecimens(){
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
      status:'1',
    }
    this.medicalSupplyService.updateApproveSpecimens(this.id, this.specimenBody).subscribe(data=>{
      this.toastr.success('Cập nhật thành công !');
        let ref = document.getElementById('cancel-approve');
        ref?.click();
        window.location.reload();
    },
      error => {
      this.toastr.error('Cập nhật thất bại !');
      }
      )
  }
}
