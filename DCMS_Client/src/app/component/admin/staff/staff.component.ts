import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/service/cognito.service';
import * as moment from 'moment-timezone';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {
  ConfirmDeleteModalComponent
} from "../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component";
import {ResponseHandler} from "../../utils/libs/ResponseHandler";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {
  constructor(
    private cognitoService: CognitoService,
    private modalService: NgbModal,
    private router:Router,
    private toastr:ToastrService

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
          const roleAttribute = staff.Attributes.find((attr: any) => attr.Name === 'custom:role');
          if (roleAttribute && roleAttribute.Value !== '1'){
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
                if (this.staff.gender == 'male'){
                  this.staff.gender = 'Nam'
                }
                if (this.staff.gender == 'female'){
                  this.staff.gender = 'Nữ'
                }
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
          }
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
      return "Điều dưỡng";
    } else if (id == "5") {
      return "Y tá trưởng";
    }
  }
  staffEdit: any;

  openEditPopup(staff:any) {
    this.staffEdit = staff;
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  deleteStaff(staff: any,staffName:string) {
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa nhân viên ${staffName} không?`).then((result) => {
      if (result) {
        this.cognitoService.deleteStaff(staff)
          .subscribe((res) => {
              this.toastr.success('Xoá nhân viên thành công !');
            const index = this.listStaffDisplay.findIndex((item:any) => item.staffName == staff.staffName);
              if (index != -1) {
                this.listStaffDisplay.splice(index, 1);
              }
            }
          )
      }
    });
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

  timestampToDate(timestamp: number): string {
    try {
      const date = moment.unix(timestamp);
      const dateStr = date.format('YYYY-MM-DD');
      return dateStr;
    } catch(err) {
      return '';
    }
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
