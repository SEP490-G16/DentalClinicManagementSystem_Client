import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FacilityService} from "../../../../../service/FacilityService/facility.service";
import {ToastrService} from "ngx-toastr";
import {ResponseHandler} from "../../../libs/ResponseHandler";

@Component({
  selector: 'app-popup-edit-facility',
  templateUrl: './popup-edit-facility.component.html',
  styleUrls: ['./popup-edit-facility.component.css']
})
export class PopupEditFacilityComponent implements OnChanges {

  @Input() facility:any;
  @Input() facilityList:any;
  id:any;
  facilityInput = {
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
  isChange:boolean = false;
  loading:boolean = false;
  disable:boolean = false;
  constructor(private facilityService:FacilityService,
              private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facility']){
      this.id = this.facility.facility_id;
      this.facilityInput.name = this.facility.name;
      this.facilityInput.address = this.facility.address;
      let phoneNumberFacility = this.facility.facility_phone_number.replace(/\(\+84\)/, "0");
      this.facilityInput.sdtFacility = phoneNumberFacility;
      let phoneNumberManager = this.facility.manager_phone_number.replace(/\(\+84\)/, "0");
      this.facilityInput.sdtManager = phoneNumberManager;
      this.facilityInput.managerName = this.facility.manager_name;
    }
  }
  updateFacility(){
    this.error();
    if (!this.facilityInput.name){
      this.errorFacility.name = 'Tên cơ sở không được để trống !';
      this.isSubmited = true;

    }
    if (!this.facilityInput.address){
      this.errorFacility.address = 'Địa chỉ không được để trống !';
      this.isSubmited = true;

    }
    if (!this.facilityInput.sdtFacility){
      this.errorFacility.sdtFacility = 'Số điện thoại phòng khám không được để trống !';
      this.isSubmited = true;
    }else if (!this.isVietnamesePhoneNumber(this.facilityInput.sdtFacility)){
      this.errorFacility.sdtFacility = 'Số điện thoại phòng khám không hợp lệ !'
      this.isSubmited = true;
    }
    if (!this.facilityInput.sdtManager){
      this.errorFacility.sdtManager = 'Số điện thoại người đại diện không được để trống !';
      this.isSubmited = true;
    }else if (!this.isVietnamesePhoneNumber(this.facilityInput.sdtManager)){
      this.errorFacility.sdtManager = 'Số điện thoại người đại diện không hợp lệ !'
      this.isSubmited = true;
    }
    if (!this.facilityInput.managerName){
      this.errorFacility.manager = 'Tên người đại diện không được để trống !';
      this.isSubmited = true;
    }
    if (this.isSubmited){
      return;
    }

    // if (this.facilityInput.sdtFacility.length >=10 || this.facilityInput.sdtManager.length >=10){
    //   this.facilityBody = {
    //     facility_id:'',
    //     name: this.facilityInput.name,
    //     address: this.facilityInput.address,
    //     facility_phone_number:'(+84)'+ this.facilityInput.sdtFacility.substring(1),
    //     manager_phone_number:'(+84)'+ this.facilityInput.sdtManager.substring(1),
    //     manager_name:this.facilityInput.managerName
    //   }
    // }
    // else {
    //   this.facilityBody = {
    //     facility_id:'',
    //     name: this.facilityInput.name,
    //     address: this.facilityInput.address,
    //     facility_phone_number:'(+84)'+ this.facilityInput.sdtFacility,
    //     manager_phone_number:'(+84)'+ this.facilityInput.sdtManager,
    //     manager_name:this.facilityInput.managerName
    //
    //   }
    //
    // }
    if (this.facilityInput.sdtFacility.length === 9 || this.facilityInput.sdtManager.length === 9){
      this.facilityBody = {
        facility_id: '',
        name: this.facilityInput.name,
        address: this.facilityInput.address,
        facility_phone_number: '(+84)'+this.facilityInput.sdtFacility,
        manager_phone_number: '(+84)'+this.facilityInput.sdtManager,
        manager_name: this.facilityInput.managerName
      }
    }
    if (this.facilityInput.sdtFacility.length >=10 || this.facilityInput.sdtManager.length >=10){
        this.facilityBody = {
          facility_id:'',
          name: this.facilityInput.name,
          address: this.facilityInput.address,
          facility_phone_number:'(+84)'+ this.facilityInput.sdtFacility.substring(1),
          manager_phone_number:'(+84)'+ this.facilityInput.sdtManager.substring(1),
          manager_name:this.facilityInput.managerName
        }
      }
    //this.loading = true;
    this.disable = true;
    this.facilityService.updateFacility(this.id, this.facilityBody).subscribe(data=>{
      this.toastr.success('Cập nhật thành công !');
      let ref = document.getElementById('cancel-edit-facility');
      ref?.click();
     // window.location.reload();
        this.facilityBody.facility_id = this.id;
        const index = this.facilityList.findIndex((facility:any) => facility.facility_id === this.id);
        if (index !== -1) {
          this.facilityBody.facility_phone_number = this.normalizePhoneNumber(this.facilityBody.facility_phone_number);
          this.facilityBody.manager_phone_number = this.normalizePhoneNumber(this.facilityBody.facility_phone_number);
          this.facilityList[index] = this.facilityBody;
        }
    },
      error => {
      this.loading = false;
      this.disable = false;
      this.toastr.error('Cập nhật thất bại !');
        ResponseHandler.HANDLE_HTTP_STATUS(this.facilityService.url+"/facility/"+this.id, error);
      }
    )
  }
  error(){
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
  normalizePhoneNumber(phoneNumber: string): string {
    if(phoneNumber.startsWith('(+84)')){
      return '0'+phoneNumber.slice(5);
    }else if(phoneNumber.startsWith('+84')){
      return '0'+phoneNumber.slice(3);
    }else
      return phoneNumber;
  }
}
