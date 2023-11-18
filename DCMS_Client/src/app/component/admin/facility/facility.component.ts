import { Component, OnInit} from '@angular/core';
import {FacilityService} from "../../../service/FacilityService/facility.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-facility',
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.css']
})
export class FacilityComponent implements OnInit {
  facilityList:any[]=[];
  facility:any;
  loading: boolean = false;
  constructor(private facilityService:FacilityService,
              private toastr:ToastrService) { }

  ngOnInit(): void {
    this.getFacilityList();
  }
  getFacilityList(){
    this.loading = true;
    this.facilityService.getFacilityList().subscribe(data=>{
      this.facilityList = data.data;
      this.facilityList.forEach((facility) => {
        facility.facility_phone_number = this.normalizePhoneNumber(facility.facility_phone_number);
        facility.manager_phone_number = this.normalizePhoneNumber(facility.manager_phone_number);
      });
      
      this.loading = false;
    },error => {
      this.loading = false;
    })
  }
  openEditFacility(facility:any){
    this.facility = facility;
  }
  deleteFacility(id:string){
    console.log(id);
    const isConfirmed = window.confirm('Bạn có chắc muốn xoá cơ sở này?');
    if (isConfirmed){
      this.loading = true;
      this.facilityService.deleteFacility(id).subscribe(data=>{
          this.toastr.success('Xoá cơ sở thành công !');
          const index = this.facilityList.findIndex((facility:any) => facility.facility_id === id);
          if (index !== -1) {
            this.facilityList.splice(index, 1);
          }
          this.loading = false;
        },
        error => {
          this.toastr.error('Xoá cơ sở thất bại!');
        }
      )
    }

  }
  normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.startsWith('(+84)') ? '0' + phoneNumber.slice(5) : phoneNumber;
  }
}