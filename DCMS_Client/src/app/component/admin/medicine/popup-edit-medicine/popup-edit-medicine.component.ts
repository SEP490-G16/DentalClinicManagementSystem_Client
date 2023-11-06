import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-edit-medicine',
  templateUrl: './popup-edit-medicine.component.html',
  styleUrls: ['./popup-edit-medicine.component.css']
})
export class PopupEditMedicineComponent implements OnInit {
  medicine={
    name:'',
    toUse:'',
    contraindicated:'',
    description:''
  }
  validateMedicine ={
    name:'',
    toUse:'',
  }
  isSubmitted:boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  updateMedicine(){
    this.resetValidate();
    if (!this.medicine.name){
      this.validateMedicine.name = "Vui lòng nhập tên thuốc!";
      this.isSubmitted = true;
    }
    if (!this.medicine.toUse){
      this.validateMedicine.toUse = "Vui lòng nhập cách sử dụng!";
      this.isSubmitted = true;
    }
    if (this.isSubmitted){
      return;
    }
  }

  private resetValidate(){
    this.validateMedicine ={
      name:'',
      toUse:'',
    }
    this.isSubmitted = false;
  }
}
