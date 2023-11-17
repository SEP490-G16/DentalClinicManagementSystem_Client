import {Component, Input, OnInit} from '@angular/core';
import {FacilityService} from "../../../../../service/FacilityService/facility.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-popup-add-facility',
  templateUrl: './popup-add-facility.component.html',
  styleUrls: ['./popup-add-facility.component.css']
})
export class PopupAddFacilityComponent implements OnInit {
  @Input() facilityList:any;
  facility = {
    name:'',
    address:'',
    sdtFacility:'',
    sdtManager:'',
    managerName:'',
  }
  facilityBody = {
    facility_id:'',
    name:'',
    address: '',
    facility_phone_number:'',
    manager_phone_number:'',
    manager_name:''
  }
  errorFacility={
    name:'',
    address:'',
    sdtFacility: '',
    sdtManager: '',
    manager: ''
  }
  isSubmited:boolean= false;
  loading:boolean = false;
  constructor(private facilityService:FacilityService,
              private toastr: ToastrService) { }

  ngOnInit(): void {
  }
  addFacility(){
    this.error();
    if (!this.facility.name){
      this.errorFacility.name = 'Tên cơ sở không được để trống !';
      this.isSubmited = true;

    }
    if (!this.facility.address){
      this.errorFacility.address = 'Địa chỉ không được để trống !';
      this.isSubmited = true;

    }
    if (!this.facility.sdtFacility){
      this.errorFacility.sdtFacility = 'Số điện thoại phòng khám không được để trống !';
      this.isSubmited = true;
    }else if (!this.isVietnamesePhoneNumber(this.facility.sdtFacility)){
      this.errorFacility.sdtFacility = 'Số điện thoại phòng khám không hợp lệ !';
      this.isSubmited = true;
    }
    if (!this.facility.sdtManager){
      this.errorFacility.sdtManager = 'Số điện thoại người đại diện không được để trống !';
      this.isSubmited = true;
    }else if (!this.isVietnamesePhoneNumber(this.facility.sdtManager)){
      this.errorFacility.sdtManager = 'Số điện thoại người đại diện không hợp lệ !';
      this.isSubmited = true;
    }
    if (!this.facility.managerName){
      this.errorFacility.manager = 'Tên người đại diện không được để trống !';
      this.isSubmited = true;
    }
    if (this.isSubmited){
      return;
    }

    if (this.facility.sdtFacility.length >= 10 || this.facility.sdtManager.length >= 10){
      this.facilityBody = {
        facility_id:'',
        name: this.facility.name,
        address: this.facility.address,
        facility_phone_number: '(+84)'+ this.facility.sdtFacility.substring(1),
        manager_phone_number:  '(+84)'+ this.facility.sdtManager.substring(1),
        manager_name: this.facility.managerName
      }
    }
    else {
      this.facilityBody = {
        facility_id:'',
        name: this.facility.name,
        address: this.facility.address,
        facility_phone_number: '(+84)'+ this.facility.sdtFacility,
        manager_phone_number:  '(+84)'+ this.facility.sdtManager,
        manager_name: this.facility.managerName
      }
    }
    this.loading = true;
    this.facilityService.addFacility(this.facilityBody).subscribe(data=>{
      this.toastr.success('Thêm mới cơ sở thành công !');
      /*let ref = document.getElementById('cancel-add-facility');
      ref?.click();
      const newFacilityId = data.data.facility_id;
      this.facilityBody.facility_id = newFacilityId;
      this.facilityList.unshift(this.facilityBody);*/
      window.location.reload();
    },
      error => {
      this.loading = false;
      this.toastr.error('Thêm mới cơ sở thất bại !')
      }
    )
  }
  private error(){
    this.errorFacility ={
      name:'',
      address:'',
      sdtFacility: '',
      sdtManager: '',
      manager: ''
    }
    this.isSubmited = false;
  }
  private isVietnamesePhoneNumber(number:string):boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
}
