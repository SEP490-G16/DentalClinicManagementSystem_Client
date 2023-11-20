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

  staff = {
    staffId: '', 
    staffName: '', 
    dob: '', 
    address: '',
    note: '', 
    email: '', 
    phoneNumber: '', 
    roleId: '',
    roleName:'', 
    gender: '', 
    image: '',
  }

  listStaffDisplay:any [] = [];

  listStaff: any [] = [];
  getListStaff() {
    this.cognitoService.getListStaff()
      .subscribe((res) => {
        this.listStaff = res.message;
        console.log(this.listStaff);
        this.listStaff.forEach((staff:any) => {
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
              this.staff.phoneNumber = attr.Value;
            }
            if (attr.Name == 'custome:role') {
              this.staff.roleId = attr.Value;
            }
            if (attr.Name == 'gender') {
              this.staff.gender = attr.Value;
            }
            if (attr.Name == 'dob') {
              this.staff.dob = this.timestampToDate(attr.Value);
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'custome:image') {
              this.staff.staffName = attr.Value;
            }
            if (attr.Name == 'name') {
              this.staff.staffName = attr.Value;
            }
            this.listStaffDisplay.push(this.staff);
            this.staff = {
              staffId: '', 
              staffName: '', 
              dob: '', 
              address: '',
              note: '', 
              email: '', 
              phoneNumber: '', 
              roleId: '',
              roleName:'', 
              gender: '', 
              image: '',
            }
          })
        })
      },  
      )
  }

  staffEdit: any;

  openEditPopup(staff:any) {
    this.staffEdit = staff;
  }


  deleteStaff(id: any) {
    this.cognitoService.deleteStaff(id).subscribe((res) => {
      const index = this.listStaffDisplay.findIndex((item:any) => item.staffId == id);
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
}
