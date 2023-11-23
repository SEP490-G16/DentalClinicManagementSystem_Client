import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {
  constructor(
    private cognitoService: CognitoService,
    private router:Router

  ) { }

  ngOnInit(): void {
    this.getListStaff();
  }

  getListFacility() {

  }

  staff = {
    staffId: '',
    staffName: '',
    staffUserName: '',
    dob: '',
    address: '',
    note: '',
    email: '',
    phoneNumber: '',
    roleId: '',
    roleName:'',
    gender: '',
    image: '',
    locale: '',
    zoneInfor: '',
  }

  listStaffDisplay:any [] = [];

  listStaff: any [] = [];
  getListStaff() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.listStaff = res.message;
        console.log("ListStaff:",this.listStaff);
        this.listStaff.forEach((staff:any) => {
          this.staff = {
            staffId: '',
            staffName: '',
            staffUserName: '',
            dob: '',
            address: '',
            note: '',
            email: '',
            phoneNumber: '',
            roleId: '',
            roleName:'',
            gender: '',
            image: '',
            locale: '',
            zoneInfor: ''
          }
          this.staff.staffUserName = staff.Username;
          staff.Attributes.forEach((attr:any) => {
            if (attr.Name == 'sub') {
              this.staff.staffId = attr.Value;
            }
            if (attr.Name == 'address') {
              this.staff.address = attr.Value;
            }
            if (attr.Name == 'email') {
              this.staff.email = attr.Value;
            }
            if (attr.Name == 'phone_number') {
              this.staff.phoneNumber = this.normalizePhoneNumber(attr.Value);
            }
            if (attr.Name == 'custom:role') {
              this.staff.roleId = attr.Value;
              this.staff.roleName = this.getStaffName(this.staff.roleId);
            }
            if (attr.Name == 'gender') {
              this.staff.gender = attr.Value;
            }
            if (attr.Name == 'custom:DOB') {
              this.staff.dob = this.timestampToDate(attr.Value);
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'custom:image') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'zoneinfo') {
              this.staff.zoneInfor = attr.Value;
            }
          })
          this.listStaffDisplay.push(this.staff);
        })

      },
      )
    }

  getStaffName(id:any):any {
    if (id == "1") {
      return "Admin";
    } else if (id == "2") {
      return "Bác sĩ"
    } else if (id == "3") {
      return "Lễ tân";
    } else if (id == "4") {
      return "Y tá";
    } else if (id == "5") {
      return "Y tá trưởng";
    }
  }
  staffEdit: any;

  openEditPopup(staff:any) {
    this.staffEdit = staff;
  }

  deleteStaff(staff: any) {
    this.cognitoService.deleteStaff(staff).subscribe((res) => {
      const index = this.listStaffDisplay.findIndex((item:any) => item.staffName == staff.staffName);
      if (index != -1) {
        this.listStaffDisplay.splice(index, 1);
      }
    })
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
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
